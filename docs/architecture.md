# Архитектура

Карта того, **как код работает сейчас**. Для «почему именно так» — см. [decisions.md](./decisions.md).
Публичный API ядра вынесен в [lib-api.md](./lib-api.md).

## Слои

```
┌─ app/ (Next App Router) ──────────────────────────────────────┐
│  Компоненты (RSC + 'use client')                              │
│      │  вызывают                                              │
│      ▼                                                        │
│  Server Actions ('use server')  ← тонкие обёртки              │
│      │  валидация (Zod) + вызов lib + updateTag               │
└──────┼───────────────────────────────────────────────────────┘
       ▼
┌─ lib/ (чистое ядро, bot-ready) ───────────────────────────────┐
│  createTransaction(userId, …), getStats(…), …                 │
│  Чистые async-функции. userId всегда явным параметром.        │
│  Нет импортов next/* — переиспользуется будущим Telegram-ботом│
└──────┼───────────────────────────────────────────────────────┘
       ▼
   Drizzle ORM → PostgreSQL (Neon, HTTP-драйвер)
```

**Правила слоёв** (нарушать нельзя):

- Доменная логика и любые запросы в БД — только в `lib/`.
- Server Action не содержит бизнес-логики: валидация входа → вызов `lib/` → инвалидация кэша.
- Компоненты не ходят в БД и не содержат логики.
- `userId` приходит из сессии в слое `app/` (`requireUser` / `requireUserId` из `app/_session.ts`)
  и передаётся в `lib/` явным аргументом. В `lib/` сессии нет.

## Где что лежит

| Путь                              | Назначение                                                                                                   |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `lib/*.ts`                        | Доменное ядро: CRUD, статистика, типы. Рядом `*.test.ts`.                                                    |
| `app/_session.ts`                 | `requireUser` / `requireUserId` — мост сессии Auth.js в `userId`. Не в `lib/`, т.к. тянет `next/navigation`. |
| `app/**/actions.ts`               | Server Actions (обёртки над `lib/`).                                                                         |
| `app/**/_components/`             | UI конкретного роута.                                                                                        |
| `app/_components/`, `app/_hooks/` | Переиспользуемые компоненты/хуки.                                                                            |
| `components/ui/`                  | shadcn/ui (наш код, не node_modules).                                                                        |
| `auth.ts`                         | Конфиг Auth.js v5 (провайдеры, JWT-колбэки).                                                                 |

## Жизненный цикл запроса (на примере «добавить транзакцию»)

1. `TransactionForm` сабмитит `FormData` → `useTransactions.handleSubmit`.
2. `useOptimistic` мгновенно добавляет транзакцию в список (UI не ждёт сервер).
3. `addTransaction` (Server Action) валидирует вход через Zod-схему.
4. Зовёт `createTransaction(userId, walletId, data)` из `lib/` — проверка доступа + INSERT.
5. `updateTag('wallet-${walletId}')` инвалидирует кэш списка транзакций.
6. RSC перерисовывается свежими данными; optimistic-стейт заменяется реальным.

Ошибка на шаге 3–4 → action бросает/возвращает ошибку → `useOptimistic` откатывает
изменение, пользователю показывается `toast`/сообщение формы.

## Кэширование (Next 15 `'use cache'` + теги)

Чтобы `lib/` оставался чистым, кэшируются **обёртки на страницах**, а не функции ядра:

```ts
async function getCachedTransactions(userId: string, walletId: string) {
  'use cache: remote'
  cacheTag(`wallet-${walletId}`)
  cacheLife('days')
  return getTransactions(userId, walletId)
}
```

Server Actions после мутации зовут `updateTag(...)` — это сбрасывает помеченный кэш.

### Таксономия тегов

| Тег                          | Что кэширует           | Читается в                                     | Инвалидируется в                                |
| ---------------------------- | ---------------------- | ---------------------------------------------- | ----------------------------------------------- |
| `user-wallets-${userId}`     | список кошельков юзера | `wallets/page`, `wallet/[id]/layout` (сайдбар) | create/deleteWallet, renameWallet, acceptInvite |
| `wallet-meta-${walletId}`    | имя/мета кошелька      | `wallet/[id]/page` (шапка)                     | renameWalletAction                              |
| `wallet-${walletId}`         | список транзакций      | `wallet/[id]/page` (тело)                      | add / update / deleteTransaction                |
| `wallet-members-${walletId}` | участники кошелька     | `wallet/[id]/settings/page`                    | create/accept/revokeInvite, removeWalletMember  |
| `rates`                      | курсы валют (FX)       | `wallet/[id]/page`                             | не сбрасывается вручную — `cacheLife('hours')`  |

> При добавлении мутации проверь, какие из этих тегов она затрагивает, и сбрось **все** —
> иначе получишь стейл (напр. переименование кошелька трогает и `wallet-meta-*`, и `user-wallets-*`).

## Optimistic-паттерн (`app/wallet/[id]/_components/useTransactions.ts`)

- `useOptimistic` — мгновенное add/update/delete в списке до ответа сервера.
- `useActionState` — состояние формы добавления (`idle | error | success`) + таймаут 9 с на медленную сеть.
- При ошибке update/delete — `toast.error`, а `useOptimistic` сам откатывает состояние.
- `useLayoutEffect`-cleanup шлёт `'reset'` при скрытии формы через `<Activity>`, чтобы прошлый
  success/error не «залипал» при возврате на страницу.

## Модель данных

```
users ──< wallet_members >── wallets ──< transactions
  │              (owner|member)   │
  └──< wallet_invites >───────────┘
```

- **`wallets`** — кошелёк (`id` UUID, `name`).
- **`wallet_members`** — связь many-to-many user↔wallet с ролью `owner | member`. PK `(walletId, userId)`.
- **`transactions`** — привязаны к **кошельку**, а не к юзеру (`createdBy` — только аудит). FK на `wallets` с `ON DELETE CASCADE`.
- **`wallet_invites`** — инвайт-токен (UUID) без срока действия, `acceptedAt` помечает принятый.
- **`users`** + `oauth_accounts` / `sessions` / `verification_tokens` — таблицы Auth.js;
  плюс гостевые поля (`isGuest`, `guestToken`) и лимиты сканов чеков (`receiptScans*`).
- **Деньги**: `amount` хранится в копейках (`integer`), кастомный Drizzle-тип отдаёт наружу рубли.

Доступ проверяется в каждой функции `lib/` через членство в `wallet_members`
(`assertWalletAccess` / `getWallet`), не через `createdBy`.

## Auth и сессия

- Три провайдера: Google OAuth, Credentials (email+пароль), гостевой (Credentials с `guestToken`).
- Стратегия — **JWT** (сессия в cookie, не в БД): нет lookup в Neon на каждый запрос.
- `isGuest` пробрасывается JWT → session; для гостей скрыты шаринг и участники.
- `requireUser()` редиректит на `/login` при отсутствии сессии; `requireUserId()` отдаёт `string`.
- Гостевой `guest-token` — httpOnly cookie (не localStorage: iOS PWA имеет изолированный
  от Safari localStorage). Подробности — в [decisions.md](./decisions.md).

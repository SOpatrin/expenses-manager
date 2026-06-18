# Expense Tracker

Трекер доходов и расходов с поддержкой нескольких кошельков и совместного доступа. Устанавливается на домашний экран как PWA.

## Стек

- **Next.js 15** — App Router, RSC, Server Actions
- **React 19** — `useActionState`, `useOptimistic`, `useFormStatus`
- **TypeScript** strict
- **Drizzle ORM** + **PostgreSQL** (Neon)
- **Auth.js v5** — Google OAuth, email/password, гостевой режим
- **Tailwind CSS** + **shadcn/ui**
- Деплой: **Vercel**

## Возможности

- Транзакции: добавление, редактирование, удаление (расходы / доходы)
- Несколько кошельков с переключением
- Шаринг кошелька по инвайт-ссылке
- Баланс и статистика по валютам (RSD, RUB, USD, EUR)
- Вход через Google, email + пароль или без регистрации
- Swipe-to-delete на мобильном
- PWA — офлайн-фолбэк из кеша
- **Сканирование чеков** — фото → Claude Vision → автозаполнение формы (HEIC/JPEG/PNG/WebP)

## Запуск

```bash
pnpm install
pnpm dev   # HTTPS обязателен для SW и secure cookies
```

Скопируй `.env` в `.env.local` и заполни значения.

## Команды

| Команда            | Описание                    |
| ------------------ | --------------------------- |
| `pnpm dev`         | Dev-сервер с HTTPS          |
| `pnpm build`       | Миграции + production build |
| `pnpm test`        | Vitest                      |
| `pnpm db:generate` | Сгенерировать миграцию      |
| `pnpm db:migrate`  | Применить миграции          |
| `pnpm db:studio`   | Drizzle Studio              |

## Архитектура

```
lib/     — доменная логика, чистые функции
app/     — Next App Router: страницы, Server Actions, компоненты
docs/    — decisions.md, roadmap.md
```

- Вся логика работы с данными — в `lib/`, Server Actions — только тонкие обёртки
- `userId` всегда из сессии Auth.js, передаётся явно

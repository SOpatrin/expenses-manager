# Контракт `lib/` (ядро)

Публичная поверхность доменного ядра. Это **тот код, который переиспользует будущий
Telegram-бот** — поверх него строится и текущий web-клиент (`app/`), и бот.

## Инварианты

- Все функции — чистые async поверх Drizzle. **Нет импортов `next/*`**, нет доступа к сессии.
- `userId` — всегда **первый явный аргумент** (кроме функций по публичному токену: `getInvite`, `acceptInvite`).
- Доступ к данным кошелька проверяется внутри функций по членству в `wallet_members`;
  при отсутствии доступа — `throw new Error('Access denied')`.
- Суммы наружу — в рублях (БД хранит копейки, см. money-тип в `schema.ts`).
- Любой новый файл в `lib/` сопровождается `lib/*.test.ts` (integration-тесты на реальной Neon dev-БД).

## Транзакции — `lib/transactions.ts`

| Функция                                                     | Контракт                                                                    |
| ----------------------------------------------------------- | --------------------------------------------------------------------------- |
| `createTransaction(userId, walletId, data: NewTransaction)` | INSERT, возвращает `Transaction`. Проверяет доступ.                         |
| `getTransactions(userId, walletId)`                         | Список по кошельку, сортировка `date DESC, createdAt DESC`.                 |
| `updateTransaction(userId, walletId, txId, data)`           | UPDATE, возвращает `Transaction`. **Бросает**, если строки нет/нет доступа. |
| `deleteTransaction(userId, walletId, txId)`                 | DELETE.                                                                     |

`NewTransaction = { amount, currency, type: 'income'|'expense', category?, description?, date: 'YYYY-MM-DD' }`

## Кошельки — `lib/wallets.ts`

| Функция                                                   | Контракт                                                 |
| --------------------------------------------------------- | -------------------------------------------------------- |
| `getFirstWallet(userId)`                                  | Первый кошелёк юзера или `null`.                         |
| `getWallet(userId, walletId)`                             | Кошелёк или `null` (если не участник).                   |
| `getWallets(userId)`                                      | Все кошельки юзера.                                      |
| `createWallet(userId, name)`                              | Создаёт кошелёк + добавляет создателя как `owner`.       |
| `renameWallet(userId, walletId, name)`                    | Бросает, если нет доступа.                               |
| `deleteWallet(userId, walletId)`                          | Только `owner`. Транзакции/участники удаляются каскадом. |
| `getWalletMembers(userId, walletId)`                      | Участники с `name`/`email`. Бросает без доступа.         |
| `addWalletMember(walletId, userId)`                       | Идемпотентно (`onConflictDoNothing`), роль `member`.     |
| `removeWalletMember(ownerUserId, walletId, targetUserId)` | Только `owner`; нельзя удалить себя.                     |

## Инвайты — `lib/invites.ts`

| Функция                                  | Контракт                                                             |
| ---------------------------------------- | -------------------------------------------------------------------- |
| `createInvite(userId, walletId, email?)` | Только `owner`. Возвращает UUID-токен.                               |
| `getInvite(token)`                       | `InviteInfo \| null` по токену (без userId — публичный).             |
| `getWalletInvites(userId, walletId)`     | Непринятые инвайты кошелька.                                         |
| `acceptInvite(userId, token)`            | Добавляет юзера в кошелёк, помечает принятым. Возвращает `walletId`. |
| `revokeInvite(userId, token)`            | Только `owner`.                                                      |

## Статистика — `lib/stats.ts` (чистые, без БД)

| Функция                                                    | Контракт                                                  |
| ---------------------------------------------------------- | --------------------------------------------------------- |
| `computeStats(transactions)`                               | `WalletStats` — доход/расход/баланс **по каждой валюте**. |
| `convertAmount(amount, from, to, rates)`                   | Конвертация по словарю курсов (`rates[base] === 1`).      |
| `computeUnifiedStats(transactions, rates, targetCurrency)` | Сводная статистика в одной валюте.                        |

## Пользователи / гости — `lib/users.ts`, `lib/guest.ts`

| Функция                              | Контракт                                                               |
| ------------------------------------ | ---------------------------------------------------------------------- |
| `createUser(email, password, name?)` | Хеширует пароль (bcrypt), бросает `EmailTakenError`, если email занят. |
| `createGuestUser()`                  | Создаёт гостя, возвращает `{ userId, guestToken }`.                    |

## Курсы валют — `lib/rates.ts`

| Функция          | Контракт                                            |
| ---------------- | --------------------------------------------------- |
| `getRates(base)` | Словарь курсов относительно `base` из внешнего API. |

## Чеки — `lib/receipts.ts`, `lib/receipt-limits.ts`

| Функция                              | Контракт                                                                                                |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| `parseReceiptImage(imageDataUrl)`    | data-URL → Claude Vision → валидированный `ReceiptDraft`. Бросает при неверном формате/нераспознавании. |
| `nextScanState(user, now)`           | **Чистая** — решение по лимиту сканов (allowed/limit/что записать). Тестируема без мокинга времени.     |
| `checkAndIncrementScanLimit(userId)` | I/O-обёртка над `nextScanState`: читает счётчики, пишет результат.                                      |

## Справочники — `lib/currencies.ts`

`CURRENCIES = ['RSD','RUB','USD','EUR']`, `TX_TYPES = ['expense','income']`, `TX_TYPE_LABELS`.
Единый источник для Zod-схем (`z.enum(CURRENCIES)`) и опций форм.

> Примечание: в `lib/rates.ts` есть свой список `SUPPORTED_CURRENCIES` (тот же набор, другой порядок) —
> историческая дубль-точка, при случае стоит свести к `CURRENCIES`.

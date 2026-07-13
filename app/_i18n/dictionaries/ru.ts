// Русский словарь — источник истины по структуре: en.ts типизируется как
// Dict = typeof ru, поэтому расхождение ключей/сигнатур ловит tsc.
// Без as const: значения расширяются до string, иначе en не тайпчекнется.
// Параметризованные строки — функции, поэтому Dict НЕ сериализуем:
// через границу server→client передаём только Locale, словарь резолвим
// на месте через getDict(locale).
// Плюрализация пока не нужна; появится — Intl.PluralRules.

import type { ReceiptErrorCode } from '@/lib/receipts'

export const ru = {
  common: {
    signOut: 'Выйти',
    create: 'Создать',
    cancel: 'Отмена',
    save: 'Сохранить',
    delete: 'Удалить',
    all: 'Все',
  },
  theme: {
    light: 'Светлая',
    system: 'Системная',
    dark: 'Тёмная',
  },
  language: {
    label: 'Язык',
  },
  errorPage: {
    message: 'Что-то пошло не так.',
    retry: 'Повторить',
  },
  auth: {
    loginTitle: 'Вход',
    registerTitle: 'Регистрация',
    googleButton: 'Войти через Google',
    or: 'или',
    password: 'Пароль',
    confirmPassword: 'Повторите пароль',
    signIn: 'Войти',
    signingIn: 'Вход...',
    signUp: 'Зарегистрироваться',
    signingUp: 'Создание...',
    noAccount: 'Ещё нет аккаунта?',
    haveAccount: 'Уже есть аккаунт?',
    guestButton: 'войти без регистрации',
    invalidEmail: 'Некорректный email',
    passwordMin: 'Минимум 8 символов',
    passwordsMismatch: 'Пароли не совпадают',
    emailTaken: 'Этот email уже зарегистрирован',
    invalidCredentials: 'Неверный email или пароль',
  },
  wallets: {
    title: 'Кошельки',
    namePlaceholder: 'Название кошелька',
    newWalletPlaceholder: 'Новый кошелёк',
    createShort: '+ Создать',
    defaultName: 'Мой кошелёк',
    allWallets: 'Все кошельки',
    members: 'Участники',
    deleteButton: 'Удалить кошелек',
    deleteTitle: 'Удалить кошелёк?',
    deleteDescription:
      'Все транзакции будут удалены безвозвратно. Это действие нельзя отменить.',
  },
  tabs: {
    list: 'Список',
    analytics: 'Аналитика',
  },
  stats: {
    balance: 'Баланс',
  },
  form: {
    amount: 'Сумма',
    note: 'Заметка',
    autoCategory: '🏷️ Авто',
    add: 'Добавить',
    saving: 'Сохраняю...',
    amountInvalid: 'Введите корректную сумму',
    dateInvalid: 'Некорректная дата',
  },
  filters: {
    period: {
      week: 'Неделя',
      month: 'Месяц',
      quarter: 'Квартал',
      all: 'Всё',
      custom: 'Свой',
    },
    fromDate: 'С даты',
    toDate: 'По дату',
    type: 'Тип',
    category: 'Категория',
    allTypes: 'Все типы',
    allCategories: 'Все категории',
  },
  list: {
    empty: 'Транзакций пока нет',
    noCategory: 'Без категории',
  },
  analytics: {
    expensesByCategory: 'Расходы по категориям',
    incomeByCategory: 'Доходы по категориям',
    noData: 'Нет данных за выбранный период',
    noExpenses: 'Расходов нет',
    noIncome: 'Доходов нет',
    backToAll: 'все категории',
    dynamics: 'Динамика',
  },
  tx: {
    saveFailed: 'Не удалось сохранить. Попробуй ещё раз.',
    updateFailed: 'Не удалось сохранить изменения. Попробуй ещё раз.',
    deleteFailed: 'Не удалось удалить. Попробуй ещё раз.',
    deleted: (label: string) => `Удалили «${label}»`,
    fallbackLabel: 'запись',
    undo: 'Отменить',
  },
  scan: {
    buttonTitle: 'Сканировать чек',
    readFailed: 'Не удалось прочитать файл',
    unsupportedFormat:
      'Поддерживаются HEIC, JPEG, PNG, WebP. Попробуйте другой файл.',
    processFailed: 'Не удалось обработать изображение',
    noImage: 'Изображение не передано',
    tooLarge: 'Файл слишком большой',
    limitReached: (limit: number) =>
      `Достигнут лимит сканирований на сегодня (${limit} в день)`,
    parseError: {
      invalid_image: 'Неверный формат изображения',
      unrecognized: 'Не удалось распознать чек',
    } satisfies Record<ReceiptErrorCode, string>,
  },
  settings: {
    title: 'Участники',
    owner: 'владелец',
    member: 'участник',
    remove: 'Удалить',
    inviteTitle: 'Пригласить',
    createInviteLink: 'Создать ссылку-приглашение',
    linkCopied: 'Ссылка скопирована',
    activeInvites: 'Активные приглашения',
    revoke: 'Отозвать',
  },
  invite: {
    used: 'Это приглашение уже использовано.',
    someone: 'Кто-то',
    invitedBy: (name: string) => `${name} приглашает вас в кошелёк`,
    accept: 'Принять приглашение',
  },
}

export type Dict = typeof ru

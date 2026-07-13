// Английский словарь. Типизирован как Dict (= typeof ru): пропущенный или
// лишний ключ, а также несовпадение сигнатур функций — ошибка компиляции.

import type { Dict } from './ru'

export const en: Dict = {
  common: {
    signOut: 'Sign out',
    create: 'Create',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    all: 'All',
  },
  theme: {
    light: 'Light',
    system: 'System',
    dark: 'Dark',
  },
  language: {
    label: 'Language',
  },
  errorPage: {
    message: 'Something went wrong.',
    retry: 'Retry',
  },
  auth: {
    loginTitle: 'Sign in',
    registerTitle: 'Sign up',
    googleButton: 'Sign in with Google',
    or: 'or',
    password: 'Password',
    confirmPassword: 'Repeat password',
    signIn: 'Sign in',
    signingIn: 'Signing in...',
    signUp: 'Sign up',
    signingUp: 'Creating...',
    noAccount: "Don't have an account?",
    haveAccount: 'Already have an account?',
    guestButton: 'continue without an account',
    invalidEmail: 'Invalid email',
    passwordMin: 'At least 8 characters',
    passwordsMismatch: 'Passwords do not match',
    emailTaken: 'This email is already registered',
    invalidCredentials: 'Invalid email or password',
  },
  wallets: {
    title: 'Wallets',
    namePlaceholder: 'Wallet name',
    newWalletPlaceholder: 'New wallet',
    createShort: '+ Create',
    defaultName: 'My wallet',
    allWallets: 'All wallets',
    members: 'Members',
    deleteButton: 'Delete wallet',
    deleteTitle: 'Delete wallet?',
    deleteDescription:
      'All transactions will be permanently deleted. This action cannot be undone.',
  },
  tabs: {
    list: 'List',
    analytics: 'Analytics',
  },
  stats: {
    balance: 'Balance',
  },
  form: {
    amount: 'Amount',
    note: 'Note',
    autoCategory: '🏷️ Auto',
    add: 'Add',
    saving: 'Saving...',
    amountInvalid: 'Enter a valid amount',
    dateInvalid: 'Invalid date',
  },
  filters: {
    period: {
      week: 'Week',
      month: 'Month',
      quarter: 'Quarter',
      all: 'All',
      custom: 'Custom',
    },
    fromDate: 'From date',
    toDate: 'To date',
    type: 'Type',
    category: 'Category',
    allTypes: 'All types',
    allCategories: 'All categories',
  },
  list: {
    empty: 'No transactions yet',
    noCategory: 'No category',
  },
  analytics: {
    expensesByCategory: 'Expenses by category',
    incomeByCategory: 'Income by category',
    noData: 'No data for the selected period',
    noExpenses: 'No expenses',
    noIncome: 'No income',
    backToAll: 'all categories',
    dynamics: 'Trends',
  },
  tx: {
    saveFailed: 'Failed to save. Please try again.',
    updateFailed: 'Failed to save changes. Please try again.',
    deleteFailed: 'Failed to delete. Please try again.',
    deleted: (label: string) => `Deleted “${label}”`,
    fallbackLabel: 'entry',
    undo: 'Undo',
  },
  scan: {
    buttonTitle: 'Scan a receipt',
    readFailed: 'Failed to read the file',
    unsupportedFormat:
      'HEIC, JPEG, PNG and WebP are supported. Try another file.',
    processFailed: 'Failed to process the image',
    noImage: 'No image provided',
    tooLarge: 'File is too large',
    limitReached: (limit: number) =>
      `Daily scan limit reached (${limit} per day)`,
    parseError: {
      invalid_image: 'Invalid image format',
      unrecognized: 'Could not recognize the receipt',
    },
  },
  settings: {
    title: 'Members',
    owner: 'owner',
    member: 'member',
    remove: 'Remove',
    inviteTitle: 'Invite',
    createInviteLink: 'Create an invite link',
    linkCopied: 'Link copied',
    activeInvites: 'Pending invites',
    revoke: 'Revoke',
  },
  invite: {
    used: 'This invite has already been used.',
    someone: 'Someone',
    invitedBy: (name: string) => `${name} invites you to a wallet`,
    accept: 'Accept invite',
  },
}

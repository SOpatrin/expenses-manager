// Единый источник правды по категориям транзакций.
// CATEGORY_KEYS используется в pgEnum (schema) и Zod-схемах (валидация),
// CATEGORIES — в формах/списке (label + иконка), suggestCategory — авто-присвоение
// категории по тексту заметки. Чистый модуль: переиспользуется ботом.

import type { Locale } from './i18n'

export const CATEGORY_KEYS = [
  'food',
  'groceries',
  'transport',
  'home',
  'bills',
  'health',
  'fun',
  'shopping',
  'travel',
  'education',
  'gifts',
  'salary',
  'other',
] as const

export type CategoryKey = (typeof CATEGORY_KEYS)[number]

export type CategoryMeta = {
  key: CategoryKey
  label: Record<Locale, string>
  icon: string
}

export const CATEGORIES: readonly CategoryMeta[] = [
  { key: 'food', label: { ru: 'Еда', en: 'Food' }, icon: '🍔' },
  { key: 'groceries', label: { ru: 'Продукты', en: 'Groceries' }, icon: '🛒' },
  { key: 'transport', label: { ru: 'Транспорт', en: 'Transport' }, icon: '🚕' },
  { key: 'home', label: { ru: 'Дом', en: 'Home' }, icon: '🏠' },
  { key: 'bills', label: { ru: 'Счета', en: 'Bills' }, icon: '🧾' },
  { key: 'health', label: { ru: 'Здоровье', en: 'Health' }, icon: '💊' },
  { key: 'fun', label: { ru: 'Развлечения', en: 'Fun' }, icon: '🎉' },
  { key: 'shopping', label: { ru: 'Покупки', en: 'Shopping' }, icon: '🛍️' },
  { key: 'travel', label: { ru: 'Путешествия', en: 'Travel' }, icon: '✈️' },
  {
    key: 'education',
    label: { ru: 'Образование', en: 'Education' },
    icon: '📚',
  },
  { key: 'gifts', label: { ru: 'Подарки', en: 'Gifts' }, icon: '🎁' },
  { key: 'salary', label: { ru: 'Зарплата', en: 'Salary' }, icon: '💰' },
  { key: 'other', label: { ru: 'Прочее', en: 'Other' }, icon: '📦' },
]

const CATEGORY_BY_KEY = new Map(CATEGORIES.map((c) => [c.key, c]))

export function getCategory(key: string): CategoryMeta | undefined {
  return CATEGORY_BY_KEY.get(key as CategoryKey)
}

export function getCategoryLabel(
  key: string,
  locale: Locale,
): string | undefined {
  return CATEGORY_BY_KEY.get(key as CategoryKey)?.label[locale]
}

// Ключевые слова для авто-присвоения. Совпадение по подстроке в нормализованном
// тексте; перебор в порядке KEYWORDS, первое совпадение выигрывает.
// EN-токены добавлены рядом с RU (оба языка активны одновременно). Короткие
// подстроки проверены на ложные совпадения: 'bar'/'gas' сознательно не
// добавлены ('barcelona' и 'gastro' ловились бы как food); 'bus' тоже
// выкинут — словит 'business' раньше, чем более подходящая категория
// (например 'business trip' стало бы transport вместо travel).
const KEYWORDS: ReadonlyArray<readonly [CategoryKey, readonly string[]]> = [
  [
    'food',
    [
      'кафе',
      'ресторан',
      'обед',
      'ужин',
      'завтрак',
      'еда',
      'кофе',
      'бар',
      'пицца',
      'шаурма',
      'мороженое',
      'вольт',
      'wolt',
      'cafe',
      'restaurant',
      'lunch',
      'dinner',
      'breakfast',
      'coffee',
      'pizza',
      'burger',
    ],
  ],
  [
    'groceries',
    [
      'продукт',
      'магазин',
      'супермаркет',
      'maxi',
      'макси',
      'lidl',
      'лидл',
      'idea',
      'рынок',
      'grocery',
      'supermarket',
      'market',
    ],
  ],
  [
    'transport',
    [
      'такси',
      'метро',
      'автобус',
      'бензин',
      'заправка',
      'uber',
      'bolt',
      'парковк',
      'taxi',
      'metro',
      'fuel',
      'parking',
    ],
  ],
  [
    'home',
    [
      'аренда',
      'квартира',
      'ремонт',
      'мебель',
      'дом',
      'rent',
      'furniture',
      'repair',
    ],
  ],
  [
    'bills',
    [
      'счёт',
      'счет',
      'коммуналк',
      'электричеств',
      'интернет',
      'связь',
      'налог',
      'подписк',
      'utilities',
      'electricity',
      'internet',
      'tax',
      'subscription',
    ],
  ],
  [
    'health',
    [
      'аптека',
      'врач',
      'лекарств',
      'клиника',
      'стоматолог',
      'анализ',
      'массаж',
      'pharmacy',
      'doctor',
      'dentist',
      'clinic',
    ],
  ],
  [
    'fun',
    [
      'кино',
      'концерт',
      'игр',
      'развлеч',
      'клуб',
      'netflix',
      'spotify',
      'танц',
      'свидание',
      'музык',
      'ютуб',
      'youtube',
      'cinema',
      'movie',
      'concert',
      'game',
      'party',
    ],
  ],
  [
    'shopping',
    [
      'одежда',
      'обувь',
      'покупк',
      'zara',
      'h&m',
      'маркетплейс',
      'электроник',
      'шампун',
      'косметик',
      'козметик',
      'temu',
      'clothes',
      'shoes',
      'electronics',
      'cosmetics',
    ],
  ],
  [
    'travel',
    [
      'отель',
      'билет',
      'самолёт',
      'самолет',
      'поезд',
      'путешеств',
      'airbnb',
      'hotel',
      'ticket',
      'flight',
      'train',
      'trip',
    ],
  ],
  [
    'education',
    [
      'курс',
      'обучение',
      'книг',
      'университет',
      'школа',
      'учеб',
      'course',
      'book',
      'school',
      'university',
    ],
  ],
  ['gifts', ['подарок', 'подарк', 'цвет', 'gift', 'flowers']],
  [
    'salary',
    [
      'зарплат',
      'аванс',
      'премия',
      'доход',
      'salary',
      'получк',
      'зп',
      'paycheck',
      'bonus',
      'income',
    ],
  ],
]

export function suggestCategory(text: string | null | undefined): CategoryKey {
  const normalized = (text ?? '').toLowerCase().trim()
  if (!normalized) return 'other'
  for (const [key, words] of KEYWORDS) {
    if (words.some((w) => normalized.includes(w))) return key
  }
  return 'other'
}

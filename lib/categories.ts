// Единый источник правды по категориям транзакций.
// CATEGORY_KEYS используется в pgEnum (schema) и Zod-схемах (валидация),
// CATEGORIES — в формах/списке (label + иконка), suggestCategory — авто-присвоение
// категории по тексту заметки. Чистый модуль: переиспользуется ботом.

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

type CategoryMeta = { key: CategoryKey; label: string; icon: string }

export const CATEGORIES: readonly CategoryMeta[] = [
  { key: 'food', label: 'Еда', icon: '🍔' },
  { key: 'groceries', label: 'Продукты', icon: '🛒' },
  { key: 'transport', label: 'Транспорт', icon: '🚕' },
  { key: 'home', label: 'Дом', icon: '🏠' },
  { key: 'bills', label: 'Счета', icon: '🧾' },
  { key: 'health', label: 'Здоровье', icon: '💊' },
  { key: 'fun', label: 'Развлечения', icon: '🎉' },
  { key: 'shopping', label: 'Покупки', icon: '🛍️' },
  { key: 'travel', label: 'Путешествия', icon: '✈️' },
  { key: 'education', label: 'Образование', icon: '📚' },
  { key: 'gifts', label: 'Подарки', icon: '🎁' },
  { key: 'salary', label: 'Зарплата', icon: '💰' },
  { key: 'other', label: 'Прочее', icon: '📦' },
]

const CATEGORY_BY_KEY = new Map(CATEGORIES.map((c) => [c.key, c]))

export function getCategory(key: string): CategoryMeta | undefined {
  return CATEGORY_BY_KEY.get(key as CategoryKey)
}

// Ключевые слова для авто-присвоения. Совпадение по подстроке в нормализованном
// тексте; перебор в порядке KEYWORDS, первое совпадение выигрывает.
const KEYWORDS: ReadonlyArray<readonly [CategoryKey, readonly string[]]> = [
  [
    'food',
    ['кафе', 'ресторан', 'обед', 'ужин', 'завтрак', 'еда', 'кофе', 'бар'],
  ],
  ['groceries', ['продукты', 'магазин', 'супермаркет', 'maxi', 'lidl', 'idea']],
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
    ],
  ],
  ['home', ['аренда', 'квартира', 'ремонт', 'мебель', 'дом']],
  [
    'bills',
    ['счёт', 'счет', 'коммуналк', 'электр', 'интернет', 'связь', 'налог'],
  ],
  ['health', ['аптека', 'врач', 'лекарств', 'клиника', 'стоматолог', 'анализ']],
  ['fun', ['кино', 'концерт', 'игра', 'развлеч', 'клуб', 'netflix', 'spotify']],
  ['shopping', ['одежда', 'обувь', 'покупк', 'zara', 'h&m', 'маркетплейс']],
  [
    'travel',
    ['отель', 'билет', 'самолёт', 'самолет', 'поезд', 'путешеств', 'airbnb'],
  ],
  ['education', ['курс', 'обучение', 'книг', 'университет', 'школа', 'учеб']],
  ['gifts', ['подарок', 'подарк', 'цвет']],
  ['salary', ['зарплат', 'аванс', 'премия', 'доход', 'salary']],
]

export function suggestCategory(text: string | null | undefined): CategoryKey {
  const normalized = (text ?? '').toLowerCase().trim()
  if (!normalized) return 'other'
  for (const [key, words] of KEYWORDS) {
    if (words.some((w) => normalized.includes(w))) return key
  }
  return 'other'
}

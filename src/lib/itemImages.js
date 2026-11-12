const LEGACY_PLACEHOLDER_URLS = new Set([
  'https://images.unsplash.com/photo-1586769852836-bc069f19e1b6?w=600&q=80',
  'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&q=80',
  'https://images.unsplash.com/photo-1587145820266-a5951ee6f620?w=600&q=80',
  'https://images.unsplash.com/photo-1578574577315-3fbeb0cecdc2?w=600&q=80',
  'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=80',
  'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
])

const NAME_KEYWORD_RULES = [
  {
    keywords: ['laptop', 'macbook', 'thinkpad', 'pavilion', 'inspiron', 'vivobook', 'ideapad', 'chromebook', 'hp ', 'dell ', 'lenovo', 'asus', 'acer'],
    image: '/images/items/laptop.jpg',
  },
  {
    keywords: ['calculator', 'ti-84', 'ti84', 'casio fx', 'scientific calc', 'graphing calc'],
    image: '/images/items/calculator.jpg',
  },
  {
    keywords: ['id card', 'student id', 'identity card', 'campus card', 'lanyard', 'admit card', 'library card', 'badge'],
    image: '/images/items/id-card.jpg',
  },
  {
    keywords: ['phone', 'mobile', 'smartphone', 'iphone', 'samsung', 'galaxy', 'oneplus', 'pixel', 'redmi', 'realme', 'vivo', 'oppo', 'xiaomi'],
    image: '/images/items/smartphone.jpg',
  },
  {
    keywords: ['bottle', 'thermos', 'flask', 'milton', 'cello', 'tumbler', 'hydro', 'sipper', 'water'],
    image: '/images/items/bottle.jpg',
  },
  {
    keywords: ['key', 'keys', 'keychain', 'keyring', 'car key', 'bike key', 'hostel key'],
    image: '/images/items/keys.jpg',
  },
  {
    keywords: ['wallet', 'purse', 'cardholder', 'card holder', 'leather pouch'],
    image: '/images/items/wallet.jpg',
  },
  {
    keywords: ['bag', 'backpack', 'rucksack', 'knapsack', 'laptop sleeve', 'sling', 'tote', 'handbag', 'kitbag'],
    image: '/images/items/bag.jpg',
  },
  {
    keywords: ['earbud', 'airpod', 'headphone', 'earphone', 'charger', 'adapter', 'powerbank', 'power bank', 'mouse', 'keyboard', 'pendrive', 'usb', 'tablet', 'ipad', 'kindle', 'speaker'],
    image: '/images/items/electronics.jpg',
  },
  {
    keywords: ['book', 'textbook', 'notebook', 'register', 'notes', 'novel', 'manual', 'workbook', 'diary'],
    image: '/images/items/books.jpg',
  },
  {
    keywords: ['document', 'certificate', 'marksheet', 'transcript', 'folder', 'passport', 'pan card', 'aadhaar', 'driving license', 'file', 'paperwork'],
    image: '/images/items/documents.svg',
  },
  {
    keywords: ['watch', 'smartwatch', 'glasses', 'spectacles', 'specs', 'sunglasses', 'goggles', 'umbrella', 'bracelet', 'ring', 'belt'],
    image: '/images/items/accessories.svg',
  },
  {
    keywords: ['hoodie', 'jacket', 'sweater', 'blazer', 'coat', 'shirt', 'cap', 'hat', 'scarf', 'gloves', 'shoe', 'jersey'],
    image: '/images/items/clothing.jpg',
  },
]

const CATEGORY_IMAGE_MAP = {
  'ID Card': '/images/items/id-card.jpg',
  Laptop: '/images/items/laptop.jpg',
  Mobile: '/images/items/smartphone.jpg',
  Electronics: '/images/items/electronics.jpg',
  Bottle: '/images/items/bottle.jpg',
  Documents: '/images/items/documents.svg',
  Bag: '/images/items/bag.jpg',
  Wallet: '/images/items/wallet.jpg',
  Keys: '/images/items/keys.jpg',
  Accessories: '/images/items/accessories.svg',
  Clothing: '/images/items/clothing.jpg',
  Books: '/images/items/books.jpg',
  Other: '/images/items/bag.jpg',
}

export function getSuggestedItemImage(itemName = '', category = 'Other') {
  const normalizedName = ` ${String(itemName || '').toLowerCase()} `
  for (const rule of NAME_KEYWORD_RULES) {
    if (rule.keywords.some((kw) => normalizedName.includes(kw.toLowerCase()))) {
      return rule.image
    }
  }
  return CATEGORY_IMAGE_MAP[category] || '/images/items/bag.jpg'
}

export function isCustomUploadedImage(imageUrl) {
  const trimmed = String(imageUrl || '').trim()
  if (!trimmed) return false
  if (LEGACY_PLACEHOLDER_URLS.has(trimmed)) return false
  if (trimmed.startsWith('/images/items/')) return false
  return true
}

export function resolveItemImage(itemName = '', category = 'Other', imageUrl = '') {
  if (isCustomUploadedImage(imageUrl)) {
    return String(imageUrl).trim()
  }
  return getSuggestedItemImage(itemName, category)
}

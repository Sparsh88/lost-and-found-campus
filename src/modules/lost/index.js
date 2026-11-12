export const DEFAULT_ITEM_IMAGE =
  'https://images.unsplash.com/photo-1586769852836-bc069f19e1b6?w=400&q=80'

export const categories = [
  'Electronics',
  'Documents',
  'Bags',
  'Accessories',
  'Clothing',
  'Books',
  'Other',
]

const STORAGE_KEY = 'lostItems'

export const lostItems = []

export function getAllLostItems() {
  if (typeof window === 'undefined') return lostItems

  try {
    const saved = localStorage.getItem(STORAGE_KEY)

    if (saved) return JSON.parse(saved)

    localStorage.setItem(STORAGE_KEY, JSON.stringify(lostItems))
    return lostItems
  } catch {
    return lostItems
  }
}

export function getLostItemById(id) {
  return getAllLostItems().find(
    (item) => String(item.id) === String(id)
  )
}

export function addLostItem(newItem) {
  if (typeof window === 'undefined') {
    throw new Error('Lost items can only be added in the browser.')
  }

  const items = getAllLostItems()

  const item = {
    ...newItem,
    id: String(Date.now()),
    imageUrl: newItem.imageUrl || DEFAULT_ITEM_IMAGE,
    status: 'Lost',
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([item, ...items]))
  } catch {
    throw new Error('Unable to save the lost item in browser storage.')
  }

  return item
}

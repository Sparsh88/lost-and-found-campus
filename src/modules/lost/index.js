'use client'

export const CATEGORIES = [
  'ID Card',
  'Laptop',
  'Mobile',
  'Bottle',
  'Documents',
  'Bag',
  'Wallet',
  'Keys',
  'Accessories',
  'Clothing',
  'Books',
  'Other',
]

export const CAMPUS_LOCATIONS = [
  'Main Library',
  'Engineering Block A',
  'Engineering Block B',
  'Science Block',
  'Central Cafeteria',
  'Sports Complex',
  'Hostel A',
  'Hostel B',
  'Auditorium',
  'Campus Gate',
]

export const DEFAULT_ITEM_IMAGE =
  'https://images.unsplash.com/photo-1586769852836-bc069f19e1b6?w=600&q=80'

export const initialLostItems = [
  {
    id: '101',
    itemName: 'Black HP Laptop',
    category: 'Laptop',
    description:
      'Black HP laptop misplaced in the computer lab. It has an HP logo on the back.',
    location: 'Engineering Block A',
    lostDate: '2026-10-28',
    lostTime: '10:30',
    imageUrl:
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80',
    ownerName: 'Rahul Sharma',
    ownerContact: 'rahul.sharma@campus.edu.in',
    ownerEmail: '',
    status: 'Lost',
  },
  {
    id: '102',
    itemName: 'Blue Student ID Card',
    category: 'ID Card',
    description:
      'Blue university student identity card misplaced near the main library entrance.',
    location: 'Main Library',
    lostDate: '2026-10-27',
    lostTime: '11:00',
    imageUrl:
      'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&q=80',
    ownerName: 'Priya Sharma',
    ownerContact: 'priya@campus.edu.in',
    ownerEmail: '',
    status: 'Lost',
  },
  {
    id: '103',
    itemName: 'Black Laptop Bag',
    category: 'Bag',
    description:
      'Black laptop backpack containing notebooks and personal belongings.',
    location: 'Central Cafeteria',
    lostDate: '2026-10-26',
    lostTime: '14:15',
    imageUrl:
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80',
    ownerName: 'Ankit Verma',
    ownerContact: '9876543210',
    ownerEmail: '',
    status: 'Lost',
  },
  {
    id: '104',
    itemName: 'Wireless Earbuds',
    category: 'Mobile',
    description:
      'White wireless earbuds with a charging case.',
    location: 'Sports Complex',
    lostDate: '2026-10-25',
    lostTime: '16:30',
    imageUrl:
      'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=600&q=80',
    ownerName: 'Rohit Kumar',
    ownerContact: 'rohit@campus.edu.in',
    ownerEmail: '',
    status: 'Lost',
  },
  {
    id: '105',
    itemName: 'Engineering Notebook',
    category: 'Books',
    description:
      'Spiral notebook containing programming and data structures notes.',
    location: 'Main Library',
    lostDate: '2026-10-24',
    lostTime: '12:00',
    imageUrl:
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80',
    ownerName: 'Meera Joshi',
    ownerContact: 'meera@campus.edu.in',
    ownerEmail: '',
    status: 'Lost',
  },
  {
    id: '106',
    itemName: 'Silver Wrist Watch',
    category: 'Accessories',
    description:
      'Silver-colored wrist watch misplaced near the hostel entrance.',
    location: 'Hostel A',
    lostDate: '2026-10-23',
    lostTime: '18:20',
    imageUrl:
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80',
    ownerName: 'Karan Singh',
    ownerContact: 'karan@campus.edu.in',
    ownerEmail: '',
    status: 'Lost',
  },
]

const STORAGE_KEY = 'campusLostItems'

function readItems() {
  if (typeof window === 'undefined') {
    return initialLostItems
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY)

    if (saved !== null) {
      const parsed = JSON.parse(saved)
      return Array.isArray(parsed) ? parsed : initialLostItems
    }

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(initialLostItems)
    )

    return initialLostItems
  } catch (error) {
    console.error('Error reading lost items:', error)
    return initialLostItems
  }
}

function saveItems(items) {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch (error) {
    console.error('Error saving lost items:', error)
  }
}

export function getLostItems() {
  return readItems()
}

export function getLostItemById(id) {
  return readItems().find(
    (item) => String(item.id) === String(id)
  ) || null
}

export function addLostItem(newItem) {
  const items = readItems()

  const itemWithId = {
    ...newItem,
    id: String(Date.now()),
    imageUrl: newItem.imageUrl?.trim() || DEFAULT_ITEM_IMAGE,
    status: 'Lost',
  }

  saveItems([itemWithId, ...items])

  return itemWithId
}

export function updateLostItem(id, updatedData) {
  const items = readItems()

  const updatedItems = items.map((item) =>
    String(item.id) === String(id)
      ? { ...item, ...updatedData }
      : item
  )

  saveItems(updatedItems)

  return updatedItems.find(
    (item) => String(item.id) === String(id)
  ) || null
}

export function deleteLostItem(id) {
  const items = readItems()

  const updatedItems = items.filter(
    (item) => String(item.id) !== String(id)
  )

  saveItems(updatedItems)
}

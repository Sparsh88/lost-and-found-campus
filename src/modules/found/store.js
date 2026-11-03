import { initialFoundItems } from './data'

// In-memory list of found items
let items = [...initialFoundItems]

export function getFoundItems() {
  return items
}

export function getFoundItemById(id) {
  return items.find((item) => String(item.id) === String(id))
}

export function addFoundItem(newItem) {
  const itemWithId = {
    ...newItem,
    id: String(items.length + 1),
    status: newItem.status || 'Pending',
    handoverInfo: newItem.handoverInfo || '',
  }
  items = [itemWithId, ...items]
  return itemWithId
}

export function updateFoundItem(id, updatedData) {
  const index = items.findIndex((item) => String(item.id) === String(id))
  if (index !== -1) {
    items[index] = { ...items[index], ...updatedData }
    return items[index]
  }
  return null
}

export function deleteFoundItem(id) {
  items = items.filter((item) => String(item.id) !== String(id))
}

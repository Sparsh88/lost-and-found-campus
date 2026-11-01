/**
 * modules/found/store.js
 * ─────────────────────────────────────────────────────────────────
 * Client-side in-memory store for the Found Item module.
 *
 * This file acts as the single source of truth for found items
 * while MongoDB integration is pending.
 *
 * To integrate MongoDB later:
 *  1. Replace the functions below with fetch() calls to your
 *     /api/found-items route.
 *  2. Keep the same function signatures so page components
 *     do not need to change.
 * ─────────────────────────────────────────────────────────────────
 */

import { MOCK_FOUND_ITEMS } from './data'

// ─── In-memory state ─────────────────────────────────────────────
// We clone the array so that mutations don't affect the original mock.
let _items = [...MOCK_FOUND_ITEMS]

/**
 * Returns a shallow copy of all found items.
 * @returns {import('./data').FoundItem[]}
 */
export function getAllFoundItems() {
  return [..._items]
}

/**
 * Returns a single found item by ID, or undefined.
 * @param {string} id
 * @returns {import('./data').FoundItem | undefined}
 */
export function getFoundItemById(id) {
  return _items.find((item) => item.id === id)
}

/**
 * Adds a new found item to the store.
 * Generates an incremental ID automatically.
 *
 * @param {Omit<import('./data').FoundItem, 'id' | 'submittedAt'>} payload
 * @returns {import('./data').FoundItem} The newly created item.
 */
export function addFoundItem(payload) {
  const newItem = {
    ...payload,
    id: `fi-${String(_items.length + 1).padStart(3, '0')}`,
    status: 'Pending',
    submittedAt: new Date().toISOString(),
  }
  _items = [newItem, ..._items]
  return newItem
}

/**
 * Updates an existing found item by ID.
 * @param {string} id
 * @param {Partial<import('./data').FoundItem>} updates
 * @returns {import('./data').FoundItem | null} Updated item or null if not found.
 */
export function updateFoundItem(id, updates) {
  const index = _items.findIndex((item) => item.id === id)
  if (index === -1) return null

  _items[index] = { ..._items[index], ...updates }
  return _items[index]
}

/**
 * Deletes a found item by ID.
 * @param {string} id
 * @returns {boolean} True if deleted, false if not found.
 */
export function deleteFoundItem(id) {
  const before = _items.length
  _items = _items.filter((item) => item.id !== id)
  return _items.length < before
}


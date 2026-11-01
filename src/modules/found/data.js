/**
 * modules/found/data.js
 * ─────────────────────────────────────────────────────────────────
 * Mock data store for Module 2 – Found Item Service.
 * Replace this with MongoDB API calls when the database is ready.
 * ─────────────────────────────────────────────────────────────────
 */

/**
 * Category options available throughout the Found Item module.
 * @type {string[]}
 */
export const CATEGORIES = [
  'ID Card',
  'Laptop',
  'Mobile',
  'Bottle',
  'Documents',
  'Bag',
  'Wallet',
  'Keys',
  'Earphones',
  'Charger',
  'Umbrella',
  'Other',
]

/**
 * Status options for a found item.
 */
export const STATUS = {
  PENDING:   'Pending',      // Registered, no claim yet
  CLAIMED:   'Claimed',      // Someone filed a claim
  VERIFIED:  'Verified',     // Ownership verified by authority
  HANDED_OVER: 'Handed Over', // Item returned to owner
}

/**
 * Campus locations (used in the report form as suggestions).
 * @type {string[]}
 */
export const CAMPUS_LOCATIONS = [
  'Main Library',
  'Engineering Block A',
  'Engineering Block B',
  'Science Block',
  'MBA Block',
  'Arts Block',
  'Central Cafeteria',
  'Sports Complex',
  'Hostel A',
  'Hostel B',
  'Hostel C',
  'Administrative Block',
  'Campus Gate 1',
  'Campus Gate 2',
  'Parking Lot',
  'Auditorium',
  'Medical Centre',
  'Open Air Theatre',
  'Garden Area',
  'Bus Stand',
]

/**
 * Sample found items – mock data for UI development.
 * MongoDB integration: replace with fetch("/api/found-items").
 *
 * @type {FoundItem[]}
 *
 * @typedef {Object} FoundItem
 * @property {string}  id
 * @property {string}  itemName
 * @property {string}  category
 * @property {string}  description
 * @property {string}  location
 * @property {string}  foundDate        ISO date string  (YYYY-MM-DD)
 * @property {string}  foundTime        HH:MM (24-hr)
 * @property {string}  imageUrl         Placeholder image URL
 * @property {string}  finderName
 * @property {string}  finderContact    Email or phone
 * @property {string}  status           One of STATUS values
 * @property {string}  [handoverInfo]   Present when status === 'Handed Over'
 * @property {string}  submittedAt      ISO datetime string
 */
export const MOCK_FOUND_ITEMS = [
  {
    id: 'fi-001',
    itemName: 'Student ID Card',
    category: 'ID Card',
    description:
      'Found a student ID card near the main library entrance. The name on the card is partially visible. Card appears to be from the Computer Science department.',
    location: 'Main Library',
    foundDate: '2024-11-10',
    foundTime: '09:30',
    imageUrl: 'https://images.unsplash.com/photo-1578574577315-3fbeb0cecdc2?w=400&q=80',
    finderName: 'Rahul Sharma',
    finderContact: 'rahul.sharma@campus.edu.in',
    status: STATUS.PENDING,
    submittedAt: '2024-11-10T09:45:00Z',
  },
  {
    id: 'fi-002',
    itemName: 'Black Laptop Bag',
    category: 'Bag',
    description:
      'A black Dell laptop bag found on bench outside Engineering Block B. Contains what appears to be study notes and a charger cable. No laptop inside.',
    location: 'Engineering Block B',
    foundDate: '2024-11-09',
    foundTime: '14:15',
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80',
    finderName: 'Priya Patel',
    finderContact: 'priya.patel@campus.edu.in',
    status: STATUS.CLAIMED,
    submittedAt: '2024-11-09T14:30:00Z',
  },
  {
    id: 'fi-003',
    itemName: 'Samsung Galaxy Phone',
    category: 'Mobile',
    description:
      'Found a Samsung Galaxy S23 with a blue case near the cafeteria exit. Phone is locked. Screen has a small crack on the corner. Battery was at 45% when found.',
    location: 'Central Cafeteria',
    foundDate: '2024-11-08',
    foundTime: '13:00',
    imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80',
    finderName: 'Ankit Verma',
    finderContact: '9876543210',
    status: STATUS.VERIFIED,
    submittedAt: '2024-11-08T13:15:00Z',
  },
  {
    id: 'fi-004',
    itemName: 'Blue Water Bottle',
    category: 'Bottle',
    description:
      'A blue Milton water bottle found in Sports Complex changing room. Has a small sticker with initials "A.K." on the bottom. Capacity appears to be 1 litre.',
    location: 'Sports Complex',
    foundDate: '2024-11-07',
    foundTime: '17:45',
    imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&q=80',
    finderName: 'Security Staff',
    finderContact: 'security@campus.edu.in',
    status: STATUS.HANDED_OVER,
    handoverInfo:
      'Item handed over to owner Aditya Kumar on 2024-11-11 at 10:00 AM. Verified by Security Officer Mr. Singh (Badge #042).',
    submittedAt: '2024-11-07T18:00:00Z',
  },
  {
    id: 'fi-005',
    itemName: 'Engineering Notebook',
    category: 'Documents',
    description:
      'A spiral-bound engineering notebook with handwritten notes on Data Structures and Algorithms. Found on a desk in the library reading room. Has equations and diagrams.',
    location: 'Main Library',
    foundDate: '2024-11-06',
    foundTime: '11:30',
    imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80',
    finderName: 'Meera Joshi',
    finderContact: 'meera.joshi@campus.edu.in',
    status: STATUS.PENDING,
    submittedAt: '2024-11-06T11:45:00Z',
  },
  {
    id: 'fi-006',
    itemName: 'MacBook Pro Charger',
    category: 'Charger',
    description:
      'Apple MacBook Pro 65W USB-C charger found in Lab 203 of Science Block. Has a small piece of tape with no name written on it. Cable is in good condition.',
    location: 'Science Block',
    foundDate: '2024-11-05',
    foundTime: '16:00',
    imageUrl: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&q=80',
    finderName: 'Karan Singh',
    finderContact: '9988776655',
    status: STATUS.PENDING,
    submittedAt: '2024-11-05T16:20:00Z',
  },
  {
    id: 'fi-007',
    itemName: 'Brown Leather Wallet',
    category: 'Wallet',
    description:
      'A brown leather wallet found near the admin block steps. Contains some cash, an ATM card, and a library card. No ID card or contact information inside.',
    location: 'Administrative Block',
    foundDate: '2024-11-04',
    foundTime: '10:15',
    imageUrl: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&q=80',
    finderName: 'Divya Nair',
    finderContact: 'divya.nair@campus.edu.in',
    status: STATUS.CLAIMED,
    submittedAt: '2024-11-04T10:30:00Z',
  },
  {
    id: 'fi-008',
    itemName: 'Bunch of Keys',
    category: 'Keys',
    description:
      'A bunch of 4 keys found on a hook near the MBA block entrance. Has a red keychain with a small Ganesha pendant. Could be hostel or vehicle keys.',
    location: 'MBA Block',
    foundDate: '2024-11-03',
    foundTime: '08:45',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
    finderName: 'Rohit Gupta',
    finderContact: 'rohit.gupta@campus.edu.in',
    status: STATUS.PENDING,
    submittedAt: '2024-11-03T09:00:00Z',
  },
]


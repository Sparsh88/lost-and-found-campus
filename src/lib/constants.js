export const DEFAULT_ITEM_IMAGE =
  'https://images.unsplash.com/photo-1586769852836-bc069f19e1b6?w=600&q=80'

export const ITEM_CATEGORIES = [
  'ID Card',
  'Laptop',
  'Mobile',
  'Electronics',
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
  'Admin Block',
  'Other',
]

export const LOST_ITEM_STATUSES = ['ACTIVE', 'CLOSED', 'RETURNED']

export const FOUND_ITEM_STATUSES = [
  'AVAILABLE',
  'RESERVED_FOR_HANDOVER',
  'RETURNED',
  'CLOSED',
]

export const CLAIM_STATUSES = [
  'PENDING',
  'ADDITIONAL_INFO_REQUESTED',
  'APPROVED',
  'REJECTED',
  'CLOSED',
  'COMPLETED',
]

export const FINDER_SUBMISSION_STATUSES = ['NEW', 'VIEWED', 'RESOLVED']

export const STATUS_LABELS = {
  ACTIVE: 'Active',
  CLOSED: 'Closed',
  RETURNED: 'Returned',
  AVAILABLE: 'Available',
  RESERVED_FOR_HANDOVER: 'Reserved for Handover',
  PENDING: 'Pending',
  ADDITIONAL_INFO_REQUESTED: 'Info Requested',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  COMPLETED: 'Completed',
  NEW: 'New',
  VIEWED: 'Viewed',
  RESOLVED: 'Resolved',
}

export function formatStatusLabel(status) {
  return STATUS_LABELS[status] || status || 'Unknown'
}

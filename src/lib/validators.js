import { z } from 'zod'

export const RegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(80),
  email: z.string().email('Please enter a valid campus email address'),
  studentId: z.string().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional(),
})

export const LoginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const ItemSchema = z.object({
  type: z.enum(['LOST', 'FOUND']),
  itemName: z.string().min(3, 'Item name must be at least 3 characters').max(120),
  category: z.enum([
    'ID Card',
    'Laptop',
    'Mobile',
    'Bottle',
    'Documents',
    'Bag',
    'Wallet',
    'Keys',
    'Clothing',
    'Books',
    'Other',
  ]),
  description: z.string().min(10, 'Please provide a descriptive explanation (at least 10 chars)'),
  location: z.string().min(2, 'Location is required'),
  foundDate: z.string().min(1, 'Date is required'),
  foundTime: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
  finderName: z.string().min(2, 'Name is required'),
  finderContact: z.string().min(5, 'Contact detail is required'),
  // Secret verification anchors (optional)
  secretQuestion: z.string().optional(),
  secretAnswer: z.string().optional(),
})

export const ClaimSchema = z.object({
  itemId: z.string().min(1, 'Item ID is required'),
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  studentId: z.string().min(1, 'Student ID / Roll No is required'),
  phone: z.string().min(8, 'Phone number is required'),
  proofDescription: z.string().min(15, 'Please provide detailed proof of ownership (at least 15 chars)'),
  answerToChallenge: z.string().optional(),
})

const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://manideepgembali9_db_user:manideep123@lostandfoundcampus.g5ivie6.mongodb.net/lostandfoundcampus?retryWrites=true&w=majority'

async function seed() {
  console.log('Connecting to MongoDB...')
  await mongoose.connect(MONGODB_URI)
  console.log('Connected!')

  const db = mongoose.connection.db

  // Clean collections
  console.log('Clearing old test records...')
  try { await db.collection('users').drop() } catch {}
  try { await db.collection('items').drop() } catch {}
  try { await db.collection('claims').drop() } catch {}

  console.log('Seeding Users...')
  const salt = await bcrypt.genSalt(12)
  const adminPassword = await bcrypt.hash('Admin@123', salt)
  const studentPassword = await bcrypt.hash('Student@123', salt)
  const securityPassword = await bcrypt.hash('Security@123', salt)

  const users = [
    {
      name: 'Campus Chief Security',
      email: 'admin@campus.edu',
      studentId: 'STAFF-001',
      passwordHash: adminPassword,
      role: 'admin',
      phone: '9876500001',
      karmaPoints: 100,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: 'Duty Officer Singh',
      email: 'security@campus.edu',
      studentId: 'SEC-104',
      passwordHash: securityPassword,
      role: 'security',
      phone: '9876500002',
      karmaPoints: 50,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: 'Rahul Sharma',
      email: 'rahul.sharma@campus.edu',
      studentId: '12104582',
      passwordHash: studentPassword,
      role: 'student',
      phone: '9876543210',
      karmaPoints: 15,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: 'Priya Patel',
      email: 'priya.patel@campus.edu',
      studentId: '12109844',
      passwordHash: studentPassword,
      role: 'student',
      phone: '9876543211',
      karmaPoints: 25,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]

  const insertedUsers = await db.collection('users').insertMany(users)
  console.log(`✓ Seeded ${insertedUsers.insertedCount} users`)

  console.log('Seeding Items (Lost & Found)...')
  const items = [
    {
      type: 'FOUND',
      itemName: 'Student ID Card (B.Tech CSE)',
      category: 'ID Card',
      description: 'Found a student ID card near Central Library entrance revolving gates.',
      location: 'Main Library',
      foundDate: '2026-11-04',
      foundTime: '09:30',
      imageUrl: 'https://images.unsplash.com/photo-1578574577315-3fbeb0cecdc2?w=600&q=80',
      finderName: 'Rahul Sharma',
      finderContact: 'rahul.sharma@campus.edu',
      status: 'Pending',
      custodyOffice: 'Campus Security Desk (Block 29)',
      shelfBin: 'BIN-ID-01',
      handoverInfo: '',
      verificationAnchors: {
        secretQuestion: 'What is the last 4 digits of the card barcode?',
        secretAnswer: '4582',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      type: 'FOUND',
      itemName: 'Black Dell Laptop Bag',
      category: 'Bag',
      description: 'Black Dell laptop bag found on bench outside Block B. Contains notebook and charger.',
      location: 'Engineering Block B',
      foundDate: '2026-11-03',
      foundTime: '14:15',
      imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80',
      finderName: 'Priya Patel',
      finderContact: 'priya.patel@campus.edu',
      status: 'Pending',
      custodyOffice: 'Campus Security Desk (Block 29)',
      shelfBin: 'RACK-B-04',
      handoverInfo: '',
      verificationAnchors: {
        secretQuestion: 'What keychain is attached to the main zipper?',
        secretAnswer: 'Batman black logo',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      type: 'FOUND',
      itemName: 'Samsung Galaxy Smartphone',
      category: 'Mobile',
      description: 'Samsung phone with dark blue case found on cafeteria table #14.',
      location: 'Central Cafeteria',
      foundDate: '2026-11-02',
      foundTime: '13:00',
      imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80',
      finderName: 'Duty Officer Singh',
      finderContact: 'security@campus.edu',
      status: 'Claimed',
      custodyOffice: 'Campus Security Desk (Block 29)',
      shelfBin: 'SAFE-VAL-02',
      handoverInfo: '',
      verificationAnchors: {
        secretQuestion: 'Describe the lock-screen wallpaper.',
        secretAnswer: 'Astronaut in space floating',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      type: 'LOST',
      itemName: 'Blue Milton 1L Thermos Bottle',
      category: 'Bottle',
      description: 'Lost my blue Milton stainless steel water bottle near basketball court during evening practice.',
      location: 'Sports Complex',
      foundDate: '2026-11-03',
      foundTime: '17:30',
      imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&q=80',
      finderName: 'Rahul Sharma',
      finderContact: 'rahul.sharma@campus.edu',
      status: 'Pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      type: 'FOUND',
      itemName: 'Set of 3 Keys with Red Keychain',
      category: 'Keys',
      description: 'Keys found near Hostel A ground floor parking lot.',
      location: 'Hostel A',
      foundDate: '2026-11-01',
      foundTime: '18:20',
      imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
      finderName: 'Rohit Gupta',
      finderContact: 'rohit@campus.edu',
      status: 'Pending',
      custodyOffice: 'Campus Security Desk (Block 29)',
      shelfBin: 'KEY-BOARD-09',
      handoverInfo: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]

  const insertedItems = await db.collection('items').insertMany(items)
  console.log(`✓ Seeded ${insertedItems.insertedCount} items`)

  console.log('\n===============================================')
  console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!')
  console.log('-----------------------------------------------')
  console.log('Demo Accounts:')
  console.log('1. Admin:    admin@campus.edu   / Admin@123')
  console.log('2. Security: security@campus.edu / Security@123')
  console.log('3. Student:  rahul.sharma@campus.edu / Student@123')
  console.log('===============================================\n')

  await mongoose.disconnect()
}

seed().catch((err) => {
  console.error('Seeding failed:', err)
  process.exit(1)
})

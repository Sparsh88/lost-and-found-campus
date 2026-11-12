const fs = require('fs')
const path = require('path')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

function loadEnvUri() {
  if (process.env.MONGODB_URI) return process.env.MONGODB_URI
  const envPath = path.join(__dirname, '..', '.env.local')
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8')
    const match = content.match(/^MONGODB_URI=(.+)$/m)
    if (match) return match[1].trim()
  }
  throw new Error('MONGODB_URI not found in environment or .env.local')
}

async function seed() {
  const MONGODB_URI = loadEnvUri()
  console.log('Connecting to MongoDB Atlas...')
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 10000 })
  console.log('Connected!')

  const db = mongoose.connection.db

  console.log('Resetting collections for clean schema alignment...')
  const collectionsToDrop = [
    'users',
    'items',
    'lostitems',
    'founditems',
    'findersubmissions',
    'claims',
    'notifications',
    'handovers',
    'auditlogs',
  ]
  for (const col of collectionsToDrop) {
    try {
      await db.collection(col).drop()
    } catch {}
  }

  const salt = await bcrypt.genSalt(12)
  const adminPassword = await bcrypt.hash('Admin@123', salt)
  const securityPassword = await bcrypt.hash('Security@123', salt)
  const studentPassword = await bcrypt.hash('Student@123', salt)

  const now = new Date()
  const usersToInsert = [
    {
      name: 'Campus Chief Security',
      email: 'admin@campus.edu',
      registrationNumber: 'STAFF-001',
      studentId: 'STAFF-001',
      passwordHash: adminPassword,
      role: 'admin',
      phone: '9876500001',
      karmaPoints: 100,
      isBlocked: false,
      createdAt: now,
      updatedAt: now,
    },
    {
      name: 'Duty Officer Singh',
      email: 'security@campus.edu',
      registrationNumber: 'SEC-104',
      studentId: 'SEC-104',
      passwordHash: securityPassword,
      role: 'security',
      phone: '9876500002',
      karmaPoints: 50,
      isBlocked: false,
      createdAt: now,
      updatedAt: now,
    },
    {
      name: 'Rahul Sharma',
      email: 'rahul.sharma@campus.edu',
      registrationNumber: '12104582',
      studentId: '12104582',
      passwordHash: studentPassword,
      role: 'student',
      phone: '9876543210',
      karmaPoints: 15,
      isBlocked: false,
      createdAt: now,
      updatedAt: now,
    },
    {
      name: 'Priya Patel',
      email: 'priya.patel@campus.edu',
      registrationNumber: '12109844',
      studentId: '12109844',
      passwordHash: studentPassword,
      role: 'student',
      phone: '9876543211',
      karmaPoints: 25,
      isBlocked: false,
      createdAt: now,
      updatedAt: now,
    },
    {
      name: 'Ankit Verma',
      email: 'ankit.verma@campus.edu',
      registrationNumber: '12107731',
      studentId: '12107731',
      passwordHash: studentPassword,
      role: 'student',
      phone: '9876543212',
      karmaPoints: 10,
      isBlocked: false,
      createdAt: now,
      updatedAt: now,
    },
  ]

  const userRes = await db.collection('users').insertMany(usersToInsert)
  const adminId = userRes.insertedIds[0]
  const securityId = userRes.insertedIds[1]
  const rahulId = userRes.insertedIds[2]
  const priyaId = userRes.insertedIds[3]
  const ankitId = userRes.insertedIds[4]

  // Create indexes on users
  await db.collection('users').createIndex({ email: 1 }, { unique: true })
  await db.collection('users').createIndex(
    { registrationNumber: 1 },
    { unique: true, partialFilterExpression: { registrationNumber: { $type: 'string', $gt: '' } } }
  )

  const lostItemsToInsert = [
    {
      reportId: 'LST-2026-SEED0001',
      ownerId: rahulId,
      itemName: 'Blue Milton 1L Thermos Bottle',
      category: 'Bottle',
      description: 'Lost my blue Milton stainless steel water bottle near the basketball court during evening practice.',
      lostDate: '2026-11-03',
      lostLocation: 'Sports Complex',
      imageUrl: '/images/items/bottle.jpg',
      imagePublicId: '',
      identifyingDetails: 'Has a small scratch near the base and black paracord handle strap.',
      status: 'ACTIVE',
      finderSubmissionsCount: 0,
      createdAt: now,
      updatedAt: now,
    },
    {
      reportId: 'LST-2026-SEED0002',
      ownerId: priyaId,
      itemName: 'TI-84 Plus Scientific Calculator',
      category: 'Electronics',
      description: 'Misplaced black graphing calculator in Lecture Hall 204 after calculus quiz.',
      lostDate: '2026-11-04',
      lostLocation: 'Engineering Block A',
      imageUrl: '/images/items/calculator.jpg',
      imagePublicId: '',
      identifyingDetails: 'Initials P.P. written in silver marker inside the slide cover.',
      status: 'ACTIVE',
      finderSubmissionsCount: 0,
      createdAt: now,
      updatedAt: now,
    },
  ]

  await db.collection('lostitems').insertMany(lostItemsToInsert)
  await db.collection('lostitems').createIndex({ reportId: 1 }, { unique: true })

  const foundItemsToInsert = [
    {
      foundId: 'FND-2026-SEED0001',
      finderId: rahulId,
      finderName: 'Rahul Sharma',
      finderRegistrationNumber: '12104582',
      finderPhone: '9876543210',
      itemName: 'Student ID Card (B.Tech CSE)',
      category: 'ID Card',
      description: 'Found a student ID card near Central Library entrance revolving gates.',
      foundDate: '2026-11-04',
      foundTime: '09:30',
      foundLocation: 'Main Library',
      imageUrl: '/images/items/id-card.jpg',
      imagePublicId: '',
      hiddenIdentifyingDetails: 'Card holder lanyard is navy blue with 2024 orientation badge; barcode ends in 9844.',
      custodyOffice: 'Campus Security Desk (Block 29)',
      shelfBin: 'BIN-ID-01',
      status: 'AVAILABLE',
      claimsCount: 0,
      approvedClaimId: null,
      handoverInfo: '',
      createdAt: now,
      updatedAt: now,
    },
    {
      foundId: 'FND-2026-SEED0002',
      finderId: priyaId,
      finderName: 'Priya Patel',
      finderRegistrationNumber: '12109844',
      finderPhone: '9876543211',
      itemName: 'Black HP Laptop',
      category: 'Laptop',
      description: 'Black HP Pavilion laptop in a padded sleeve found on bench outside Engineering Block B.',
      foundDate: '2026-11-05',
      foundTime: '14:15',
      foundLocation: 'Engineering Block B',
      imageUrl: '/images/items/laptop.jpg',
      imagePublicId: '',
      hiddenIdentifyingDetails: 'Space Shuttle sticker under trackpad corner; blue spiral notebook inside front sleeve.',
      custodyOffice: 'Campus Security Desk (Block 29)',
      shelfBin: 'SAFE-LAP-04',
      status: 'AVAILABLE',
      claimsCount: 0,
      approvedClaimId: null,
      handoverInfo: '',
      createdAt: now,
      updatedAt: now,
    },
    {
      foundId: 'FND-2026-SEED0003',
      finderId: securityId,
      finderName: 'Duty Officer Singh',
      finderRegistrationNumber: 'SEC-104',
      finderPhone: '9876500002',
      itemName: 'Samsung Galaxy Smartphone',
      category: 'Mobile',
      description: 'Samsung phone with dark blue matte case found on cafeteria table #14.',
      foundDate: '2026-11-02',
      foundTime: '13:00',
      foundLocation: 'Central Cafeteria',
      imageUrl: '/images/items/smartphone.jpg',
      imagePublicId: '',
      hiddenIdentifyingDetails: 'Lock-screen wallpaper shows an astronaut floating in space; small chip at top-right bezel.',
      custodyOffice: 'Campus Security Desk (Block 29)',
      shelfBin: 'SAFE-VAL-02',
      status: 'AVAILABLE',
      claimsCount: 0,
      approvedClaimId: null,
      handoverInfo: '',
      createdAt: now,
      updatedAt: now,
    },
    {
      foundId: 'FND-2026-SEED0004',
      finderId: ankitId,
      finderName: 'Ankit Verma',
      finderRegistrationNumber: '12107731',
      finderPhone: '9876543212',
      itemName: 'Set of 3 Keys with Red Keychain',
      category: 'Keys',
      description: 'Keys found near Hostel A ground floor cycle stand.',
      foundDate: '2026-11-01',
      foundTime: '18:20',
      foundLocation: 'Hostel A',
      imageUrl: '/images/items/keys.jpg',
      imagePublicId: '',
      hiddenIdentifyingDetails: 'Key tag labeled Room 312B.',
      custodyOffice: 'Campus Security Desk (Block 29)',
      shelfBin: 'KEY-BOARD-09',
      status: 'AVAILABLE',
      claimsCount: 0,
      approvedClaimId: null,
      handoverInfo: '',
      createdAt: now,
      updatedAt: now,
    },
  ]

  await db.collection('founditems').insertMany(foundItemsToInsert)
  await db.collection('founditems').createIndex({ foundId: 1 }, { unique: true })
  await db.collection('claims').createIndex({ claimId: 1 }, { unique: true })
  await db.collection('claims').createIndex(
    { foundItemId: 1, claimantId: 1 },
    {
      unique: true,
      partialFilterExpression: {
        status: { $in: ['PENDING', 'ADDITIONAL_INFO_REQUESTED', 'APPROVED'] },
      },
    }
  )

  await db.collection('auditlogs').insertOne({
    actorId: adminId,
    actorName: 'Campus Chief Security',
    actorRole: 'admin',
    action: 'SYSTEM_SEEDED',
    targetModel: 'System',
    targetId: 'SEED',
    details: 'Initialized campus users, lost reports, and found inventory.',
    ipAddress: '127.0.0.1',
    createdAt: now,
    updatedAt: now,
  })

  console.log('\n===============================================')
  console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!')
  console.log('-----------------------------------------------')
  console.log('Admin Portal (/admin/login):')
  console.log('  • Admin:    STAFF-001 / Admin@123 (admin@campus.edu)')
  console.log('  • Security: SEC-104   / Security@123 (security@campus.edu)')
  console.log('Student Portal (/login):')
  console.log('  • Student A: 12104582 / Student@123 (Rahul Sharma)')
  console.log('  • Student B: 12109844 / Student@123 (Priya Patel)')
  console.log('  • Student C: 12107731 / Student@123 (Ankit Verma)')
  console.log('===============================================\n')

  await mongoose.disconnect()
}

seed().catch((err) => {
  console.error('Seeding failed:', err)
  process.exit(1)
})

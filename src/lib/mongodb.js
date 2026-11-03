import mongoose from 'mongoose'

// Connect to MongoDB when MONGODB_URI is provided
export default async function connectDB() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.log('MONGODB_URI not found in environment variables. Using local store.')
    return
  }

  if (mongoose.connection.readyState >= 1) {
    return
  }

  try {
    await mongoose.connect(uri)
    console.log('Connected to MongoDB')
  } catch (err) {
    console.error('MongoDB connection error:', err)
  }
}

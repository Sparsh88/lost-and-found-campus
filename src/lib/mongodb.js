import mongoose from 'mongoose'

export default async function connectDB() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    return
  }

  if (mongoose.connection.readyState >= 1) {
    return
  }

  try {
    await mongoose.connect(uri)
  } catch (err) {
    console.error('MongoDB connection error:', err)
  }
}

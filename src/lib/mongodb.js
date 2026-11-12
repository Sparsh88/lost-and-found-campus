import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI

let cached = global.mongoose
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null, isConnected: false }
}

export default async function connectDB() {
  if (!MONGODB_URI) {
    return null
  }

  if (cached.conn && cached.isConnected) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 3000, // Quick 3s timeout for responsive fallback
    }

    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((m) => {
        cached.isConnected = true
        return m
      })
      .catch((err) => {
        cached.promise = null
        cached.isConnected = false
        console.warn('⚠️ MongoDB Atlas is currently unreachable (check IP whitelist at cloud.mongodb.com). Operating in resilient fallback mode.')
        return null
      })
  }

  try {
    cached.conn = await cached.promise
    return cached.conn
  } catch {
    cached.promise = null
    cached.isConnected = false
    return null
  }
}

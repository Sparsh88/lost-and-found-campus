import mongoose from 'mongoose'

let cached = global.mongoose
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

export default async function connectDB() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    throw new Error('MONGODB_URI environment variable is not configured.')
  }

  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn
  }

  if (!cached.promise || mongoose.connection.readyState === 0) {
    cached.promise = null
    cached.conn = null
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
      maxPoolSize: 10,
    }

    cached.promise = mongoose.connect(uri, opts).then((mongooseInstance) => {
      return mongooseInstance
    }).catch((err) => {
      cached.promise = null
      cached.conn = null
      throw err
    })
  }

  try {
    cached.conn = await cached.promise
    return cached.conn
  } catch (error) {
    cached.promise = null
    cached.conn = null
    throw error
  }
}

export async function getGridFSBucket(bucketName = 'private_evidence') {
  await connectDB()
  const db = mongoose.connection.db
  if (!db) {
    throw new Error('MongoDB database handle is not initialized.')
  }
  return new mongoose.mongo.GridFSBucket(db, { bucketName })
}

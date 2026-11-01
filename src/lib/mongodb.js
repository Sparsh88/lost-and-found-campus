/**
 * lib/mongodb.js
 * ─────────────────────────────────────────────────────────────────
 * MongoDB connection helper using Mongoose.
 *
 * USAGE (when ready):
 *   import connectDB from '@/lib/mongodb'
 *   await connectDB()
 *
 * SETUP:
 *   1. npm install mongoose
 *   2. Create .env.local and add:
 *        MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/campus-lf
 *   3. Uncomment the code below.
 * ─────────────────────────────────────────────────────────────────
 */

// import mongoose from 'mongoose'
//
// const MONGODB_URI = process.env.MONGODB_URI
//
// if (!MONGODB_URI) {
//   throw new Error('MONGODB_URI is not defined in .env.local')
// }
//
// let cached = global.mongoose ?? { conn: null, promise: null }
// global.mongoose = cached
//
// export default async function connectDB() {
//   if (cached.conn) return cached.conn
//
//   if (!cached.promise) {
//     cached.promise = mongoose
//       .connect(MONGODB_URI, { bufferCommands: false })
//       .then((m) => m)
//   }
//
//   cached.conn = await cached.promise
//   return cached.conn
// }

// Placeholder export until MongoDB is connected
export default async function connectDB() {
  console.log('[MongoDB] Connection stub — integrate Mongoose when ready.')
}


import mongoose from 'mongoose';

// Don't validate at module load - only when connecting
// This allows the module to be imported during Next.js build
const MONGODB_URI = process.env.MONGODB_URI;

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Use global variable to cache the connection in development
declare global {
  var mongoose: MongooseCache | undefined;
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached!.conn) {
    return cached!.conn;
  }

  if (!cached!.promise) {
    // Validate MONGODB_URI only when actually connecting
    if (!MONGODB_URI) {
      throw new Error(
        'Please define the MONGODB_URI environment variable. ' +
        'In Docker/Coolify: set it in the environment variables. ' +
        'In local development: add it to .env.local'
      );
    }

    const opts = {
      bufferCommands: false,
    };

    cached!.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('✅ Connected to MongoDB');
      return mongoose;
    });
  }

  try {
    cached!.conn = await cached!.promise;
  } catch (e) {
    cached!.promise = null;
    console.error('❌ MongoDB connection error:', e);
    throw e;
  }

  return cached!.conn;
}

// Initialize connection on module load
let isInitialized = false;

async function initializeDB() {
  if (!isInitialized) {
    try {
      await connectDB();
      isInitialized = true;
      console.log('🚀 Database initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize database:', error);
      throw error;
    }
  }
}

// Don't auto-initialize - let each API route connect as needed
// This prevents connection attempts during Next.js build process

export default connectDB;
export { initializeDB };

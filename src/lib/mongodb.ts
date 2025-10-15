import mongoose from 'mongoose';

const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/etho-dv';

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

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

// Auto-initialize in production, manual in development
if (process.env.NODE_ENV === 'production') {
  initializeDB().catch(console.error);
}

export default connectDB;
export { initializeDB };

import mongoose from 'mongoose';

// Don't validate at module load - only when connecting
// This allows the module to be imported during Next.js build
const MONGODB_URI = process.env.MONGODB_URI;

// Optimized connection options for Next.js
const mongooseOptions = {
  bufferCommands: false,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4, // Use IPv4, skip trying IPv6
  maxIdleTimeMS: 30000,
  // Optimize for serverless functions
  minPoolSize: 0,
  maxConnecting: 2,
};

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Global caching for Next.js development HMR
declare global {
  var mongoose: MongooseCache | undefined;
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

/**
 * Optimized MongoDB connection for Next.js
 * - Uses connection pooling for performance
 * - Handles serverless function lifecycle
 * - Supports development HMR
 */
async function connectDB(): Promise<typeof mongoose> {
  // Return existing connection
  if (cached!.conn) {
    return cached!.conn;
  }

  // Create connection promise if it doesn't exist
  if (!cached!.promise) {
    // Validate MONGODB_URI only when actually connecting
    if (!MONGODB_URI) {
      throw new Error(
        'Please define the MONGODB_URI environment variable. ' +
        'In Docker/Coolify: set it in the environment variables. ' +
        'In local development: add it to .env.local'
      );
    }

    cached!.promise = mongoose
      .connect(MONGODB_URI, mongooseOptions)
      .then((mongoose) => {
        console.log('✅ MongoDB connected successfully');
        return mongoose;
      });
  }

  try {
    cached!.conn = await cached!.promise;
  } catch (e) {
    // Reset promise on error to allow retry
    cached!.promise = null;
    console.error('❌ MongoDB connection error:', e);
    throw e;
  }

  return cached!.conn;
}

/**
 * Check if MongoDB is connected and healthy
 */
export function isConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

/**
 * Get current connection state
 */
export function getConnectionState() {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  return {
    state:
      states[mongoose.connection.readyState as keyof typeof states] ||
      'unknown',
    readyState: mongoose.connection.readyState,
    host: mongoose.connection.host,
    name: mongoose.connection.name,
  };
}

/**
 * Graceful disconnect (useful for testing)
 */
export async function disconnectDB(): Promise<void> {
  if (cached?.conn) {
    await mongoose.disconnect();
    cached.conn = null;
    cached.promise = null;
    console.log('✅ MongoDB disconnected');
  }
}

// Don't auto-initialize - let each API route connect as needed
// This prevents connection attempts during Next.js build process

export default connectDB;

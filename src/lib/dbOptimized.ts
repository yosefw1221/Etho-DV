import mongoose from 'mongoose';
import { MongoClient, MongoClientOptions } from 'mongodb';
import { attachDatabasePool } from '@vercel/functions';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

// MongoDB Native Client Configuration
const mongoClientOptions: MongoClientOptions = {
  appName: "etho-dv.vercel.integration",
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4, // Use IPv4, skip trying IPv6
};

// Mongoose Configuration
const mongooseOptions = {
  bufferCommands: false,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4,
};

// Global caching interfaces
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

interface MongoClientCache {
  client: MongoClient | null;
  promise: Promise<MongoClient> | null;
}

// Extend global namespace
declare global {
  var mongoose: MongooseCache | undefined;
  var mongoClient: MongoClientCache | undefined;
}

// Initialize caches
let mongooseCache = global.mongoose;
let mongoClientCache = global.mongoClient;

if (!mongooseCache) {
  mongooseCache = global.mongoose = { conn: null, promise: null };
}

if (!mongoClientCache) {
  mongoClientCache = global.mongoClient = { client: null, promise: null };
}

/**
 * Connect using Mongoose (for ODM operations)
 */
export async function connectMongoose(): Promise<typeof mongoose> {
  if (mongooseCache!.conn) {
    return mongooseCache!.conn;
  }

  if (!mongooseCache!.promise) {
    mongooseCache!.promise = mongoose.connect(MONGODB_URI, mongooseOptions).then((mongoose) => {
      console.log('✅ Mongoose connected to MongoDB');
      return mongoose;
    });
  }

  try {
    mongooseCache!.conn = await mongooseCache!.promise;
  } catch (e) {
    mongooseCache!.promise = null;
    console.error('❌ Mongoose connection error:', e);
    throw e;
  }

  return mongooseCache!.conn;
}

/**
 * Connect using native MongoDB driver (for direct operations)
 */
export async function connectMongoClient(): Promise<MongoClient> {
  if (mongoClientCache!.client) {
    return mongoClientCache!.client;
  }

  if (!mongoClientCache!.promise) {
    if (process.env.NODE_ENV === 'development') {
      // In development mode, use a global variable for HMR compatibility
      mongoClientCache!.promise = new MongoClient(MONGODB_URI, mongoClientOptions)
        .connect()
        .then((client) => {
          console.log('✅ MongoDB native client connected (development)');
          return client;
        });
    } else {
      // In production mode, optimize for Vercel
      const client = new MongoClient(MONGODB_URI, mongoClientOptions);
      
      // Attach the client to ensure proper cleanup on function suspension
      attachDatabasePool(client);
      
      mongoClientCache!.promise = client.connect().then((connectedClient) => {
        console.log('✅ MongoDB native client connected (production)');
        return connectedClient;
      });
    }
  }

  try {
    mongoClientCache!.client = await mongoClientCache!.promise;
  } catch (e) {
    mongoClientCache!.promise = null;
    console.error('❌ MongoDB native client connection error:', e);
    throw e;
  }

  return mongoClientCache!.client;
}

/**
 * Get database instance from native MongoDB client
 */
export async function getDatabase(dbName?: string) {
  const client = await connectMongoClient();
  return client.db(dbName);
}

/**
 * Unified connection function that ensures both Mongoose and native client are connected
 */
export async function connectDB() {
  try {
    // Connect Mongoose first (most operations use this)
    await connectMongoose();
    
    // Also ensure native client is available for direct operations
    await connectMongoClient();
    
    console.log('🚀 Database connections initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize database connections:', error);
    throw error;
  }
}

/**
 * Graceful shutdown for both connections
 */
export async function disconnectDB() {
  try {
    if (mongooseCache?.conn) {
      await mongoose.disconnect();
      mongooseCache.conn = null;
      mongooseCache.promise = null;
      console.log('✅ Mongoose disconnected');
    }

    if (mongoClientCache?.client) {
      await mongoClientCache.client.close();
      mongoClientCache.client = null;
      mongoClientCache.promise = null;
      console.log('✅ MongoDB native client disconnected');
    }
  } catch (error) {
    console.error('❌ Error during database disconnection:', error);
    throw error;
  }
}

/**
 * Health check for database connections
 */
export async function checkDBHealth() {
  try {
    const mongooseHealthy = mongoose.connection.readyState === 1;
    const client = await connectMongoClient();
    const nativeHealthy = client.topology?.isConnected() ?? false;
    
    return {
      mongoose: mongooseHealthy,
      native: nativeHealthy,
      overall: mongooseHealthy && nativeHealthy
    };
  } catch (error) {
    console.error('❌ Database health check failed:', error);
    return {
      mongoose: false,
      native: false,
      overall: false
    };
  }
}

// Auto-initialize in production, manual in development
if (process.env.NODE_ENV === 'production') {
  connectDB().catch(console.error);
}

// Default export for backward compatibility
export default connectDB;
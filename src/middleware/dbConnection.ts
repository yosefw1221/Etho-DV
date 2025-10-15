import { NextRequest, NextResponse } from 'next/server';
import connectDB, { checkDBHealth, connectMongoose, connectMongoClient } from '@/lib/dbOptimized';

// Cache to track if DB is already connected
let isConnected = false;
let lastHealthCheck = 0;
const HEALTH_CHECK_INTERVAL = 30000; // 30 seconds

/**
 * Enhanced health check with caching
 */
async function performHealthCheck(): Promise<boolean> {
  const now = Date.now();
  
  // Skip health check if recently performed
  if (now - lastHealthCheck < HEALTH_CHECK_INTERVAL && isConnected) {
    return true;
  }
  
  try {
    const health = await checkDBHealth();
    lastHealthCheck = now;
    isConnected = health.overall;
    return health.overall;
  } catch (error) {
    console.error('Health check failed:', error);
    isConnected = false;
    return false;
  }
}

/**
 * Higher-order function that wraps API route handlers to ensure DB connection
 * This eliminates the need to call connectDB() in every route
 */
export function withDBConnection<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      // Check if connection is healthy
      const isHealthy = await performHealthCheck();
      
      if (!isHealthy) {
        console.log('🔄 Reconnecting to database...');
        await connectDB();
        isConnected = true;
      }

      // Call the actual handler
      return await handler(...args);
    } catch (error) {
      console.error('Database connection middleware error:', error);
      
      // Reset connection status on error
      isConnected = false;
      
      return NextResponse.json(
        { 
          error: 'Database connection failed',
          message: process.env.NODE_ENV === 'development' 
            ? (error instanceof Error ? error.message : String(error))
            : 'Internal server error'
        },
        { status: 500 }
      );
    }
  };
}

/**
 * Simple function to ensure DB is connected (for use in middleware)
 */
export async function ensureDBConnection() {
  const isHealthy = await performHealthCheck();
  
  if (!isHealthy) {
    await connectDB();
    isConnected = true;
  }
}

/**
 * Ensure only Mongoose connection (for ODM operations)
 */
export async function ensureMongooseConnection() {
  try {
    await connectMongoose();
    return true;
  } catch (error) {
    console.error('Mongoose connection failed:', error);
    throw error;
  }
}

/**
 * Ensure only native MongoDB client connection (for direct operations)
 */
export async function ensureNativeConnection() {
  try {
    await connectMongoClient();
    return true;
  } catch (error) {
    console.error('Native MongoDB client connection failed:', error);
    throw error;
  }
}

/**
 * Reset connection status (useful for testing)
 */
export function resetDBConnection() {
  isConnected = false;
  lastHealthCheck = 0;
}

/**
 * Get current connection status
 */
export function getConnectionStatus() {
  return {
    isConnected,
    lastHealthCheck: new Date(lastHealthCheck).toISOString(),
    timeSinceLastCheck: Date.now() - lastHealthCheck
  };
}

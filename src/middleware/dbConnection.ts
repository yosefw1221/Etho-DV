import { NextRequest, NextResponse } from 'next/server';
import connectDB, { isConnected, getConnectionState } from '@/lib/dbOptimized';

// Cache to track connection attempts and reduce redundant checks
let lastConnectionCheck = 0;
const CONNECTION_CHECK_INTERVAL = 30000; // 30 seconds

/**
 * Smart connection check with caching to avoid redundant database pings
 */
async function ensureConnection(): Promise<void> {
  const now = Date.now();
  
  // Skip check if recently verified and still connected
  if (now - lastConnectionCheck < CONNECTION_CHECK_INTERVAL && isConnected()) {
    return;
  }
  
  // Update check timestamp
  lastConnectionCheck = now;
  
  // Connect if not connected
  if (!isConnected()) {
    console.log('🔄 Establishing MongoDB connection...');
    await connectDB();
  }
}

/**
 * Higher-order function that wraps API route handlers with optimized DB connection
 * Ensures database is connected before executing the handler
 */
export function withDBConnection<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      await ensureConnection();
      return await handler(...args);
    } catch (error) {
      console.error('Database connection middleware error:', error);
      
      return NextResponse.json(
        {
          error: 'Database connection failed',
          message:
            process.env.NODE_ENV === 'development'
              ? error instanceof Error
                ? error.message
                : String(error)
              : 'Internal server error',
        },
        { status: 500 }
      );
    }
  };
}

/**
 * Simple function to ensure DB is connected (for use in middleware)
 */
export async function ensureDBConnection(): Promise<void> {
  await ensureConnection();
}

/**
 * Get current connection status and statistics
 */
export function getConnectionStatus() {
  return {
    connected: isConnected(),
    lastCheck: new Date(lastConnectionCheck).toISOString(),
    timeSinceLastCheck: Date.now() - lastConnectionCheck,
    connectionState: getConnectionState(),
  };
}

/**
 * Reset connection check cache (useful for testing)
 */
export function resetConnectionCache(): void {
  lastConnectionCheck = 0;
}
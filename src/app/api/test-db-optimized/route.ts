import { NextRequest, NextResponse } from 'next/server';
import { withDBConnection, getConnectionStatus } from '@/middleware/dbConnection';
import { checkDBHealth, getDatabase } from '@/lib/dbOptimized';

async function handler(req: NextRequest): Promise<NextResponse> {
  try {
    // Get connection status
    const status = getConnectionStatus();
    
    // Perform health check
    const health = await checkDBHealth();
    
    // Test native MongoDB client
    const db = await getDatabase();
    const collections = await db.listCollections().toArray();
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      connectionStatus: status,
      healthCheck: health,
      database: {
        name: db.databaseName,
        collectionsCount: collections.length,
        collections: collections.map(c => c.name)
      },
      message: 'Database connection test successful'
    });
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Database test failed',
        message: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

// Export the handler wrapped with database connection middleware
export const GET = withDBConnection(handler);
export const POST = withDBConnection(handler);

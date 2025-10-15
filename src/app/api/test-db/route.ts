import { NextRequest, NextResponse } from 'next/server';
import { ensureDBConnection } from '@/middleware/dbConnection';

export async function GET() {
  try {
    await ensureDBConnection();

    return NextResponse.json({
      success: true,
      message: 'Database connection successful!',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Database connection failed:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Database connection failed',
        error: error.message,
      },
      { status: 500 }
    );
  }
}

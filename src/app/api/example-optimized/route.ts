/**
 * EXAMPLE: OPTIMIZED API ROUTE WITH PROPER DB CONNECTION
 *
 * This demonstrates the best practice for database connections in API routes.
 *
 * BEFORE (BAD):
 * ```typescript
 * export async function POST(request: NextRequest) {
 *   try {
 *     await connectDB(); // ❌ Called on every request
 *     // ... rest of the code
 *   }
 * }
 * ```
 *
 * AFTER (GOOD):
 * ```typescript
 * export async function POST(request: NextRequest) {
 *   try {
 *     await ensureDBConnection(); // ✅ Only connects once, then uses cache
 *     // ... rest of the code
 *   }
 * }
 * ```
 */

import { NextRequest, NextResponse } from 'next/server';
import { withDBConnection } from '@/middleware/dbConnection';
import User from '@/lib/models/User';

async function getHandler(request: NextRequest) {
  try {
    // Now you can safely use your models
    const users = await User.find({}).limit(10);

    return NextResponse.json({
      success: true,
      message: 'Database connection optimized!',
      userCount: users.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function postHandler(request: NextRequest) {
  try {
    const body = await request.json();

    // Your business logic here
    const newUser = new User(body);
    await newUser.save();

    return NextResponse.json(
      {
        success: true,
        message: 'User created successfully',
        user: newUser,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ✅ Export with middleware - no need to call connectDB() manually
export const GET = withDBConnection(getHandler);
export const POST = withDBConnection(postHandler);

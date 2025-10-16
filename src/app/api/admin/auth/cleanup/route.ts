import { NextRequest, NextResponse } from 'next/server';
import { ensureDBConnection } from '@/middleware/dbConnection';
import AdminUser from '@/models/AdminUser';

const SUPER_ADMIN_SECRET = process.env.SUPER_ADMIN_SECRET;

/**
 * Cleanup endpoint - only works when SUPER_ADMIN_SECRET is provided
 * Used to delete all admin users for fresh setup
 */
async function cleanupAdminHandler(request: NextRequest) {
  try {
    const setupSecret = request.headers.get('x-setup-secret');

    // Require setup secret
    if (!SUPER_ADMIN_SECRET || !setupSecret || setupSecret !== SUPER_ADMIN_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized. Invalid or missing setup secret.' },
        { status: 403 }
      );
    }

    // Delete all admin users
    const result = await AdminUser.deleteMany({});

    return NextResponse.json({
      success: true,
      message: `Deleted ${result.deletedCount} admin user(s). System is ready for fresh setup.`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error('Admin cleanup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  await ensureDBConnection();
  return cleanupAdminHandler(request);
}


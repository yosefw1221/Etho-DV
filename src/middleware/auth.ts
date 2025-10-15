import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromHeader, TokenPayload } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export interface AuthenticatedRequest extends NextRequest {
  user?: TokenPayload & {
    id: string;
  };
}

export async function authenticateUser(request: NextRequest): Promise<{
  user: TokenPayload | null;
  error: string | null;
}> {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader!);

    if (!token) {
      return { user: null, error: 'No token provided' };
    }

    const tokenPayload = verifyToken(token);
    if (!tokenPayload) {
      return { user: null, error: 'Invalid token' };
    }

    // Verify user still exists
    await connectDB();
    const user = await User.findById(tokenPayload.userId);
    if (!user) {
      return { user: null, error: 'User not found' };
    }

    return { user: tokenPayload, error: null };
  } catch (error) {
    console.error('Authentication error:', error);
    return { user: null, error: 'Authentication failed' };
  }
}

export function requireAuth(
  handler: (req: AuthenticatedRequest, context?: any) => Promise<NextResponse>
) {
  return async (request: NextRequest, context?: any) => {
    const { user, error } = await authenticateUser(request);

    if (error || !user) {
      return NextResponse.json(
        { error: error || 'Authentication required' },
        { status: 401 }
      );
    }

    // Add user to request object
    (request as AuthenticatedRequest).user = {
      ...user,
      id: user.userId,
    };

    return handler(request as AuthenticatedRequest, context);
  };
}

export function requireRole(
  allowedRoles: ('user' | 'agent' | 'admin' | 'operator')[]
) {
  return function (
    handler: (req: AuthenticatedRequest) => Promise<NextResponse>
  ) {
    return async (request: NextRequest) => {
      const { user, error } = await authenticateUser(request);

      if (error || !user) {
        return NextResponse.json(
          { error: error || 'Authentication required' },
          { status: 401 }
        );
      }

      if (!allowedRoles.includes(user.role)) {
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        );
      }

      // Add user to request object
      (request as AuthenticatedRequest).user = {
        ...user,
        id: user.userId,
      };

      return handler(request as AuthenticatedRequest);
    };
  };
}

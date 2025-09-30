import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';

export interface ErrorResponse {
  error: string;
  message?: string;
  details?: any;
  code?: string;
  timestamp: string;
  path: string;
}

export class APIError extends Error {
  public statusCode: number;
  public code?: string;
  public details?: any;

  constructor(message: string, statusCode: number = 500, code?: string, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.name = 'APIError';
  }
}

export function createErrorResponse(
  error: Error | APIError | ZodError,
  request: NextRequest
): NextResponse {
  const timestamp = new Date().toISOString();
  const path = new URL(request.url).pathname;

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const errorResponse: ErrorResponse = {
      error: 'Validation Error',
      message: 'Request validation failed',
      details: error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code
      })),
      code: 'VALIDATION_ERROR',
      timestamp,
      path
    };

    return NextResponse.json(errorResponse, { status: 400 });
  }

  // Handle custom API errors
  if (error instanceof APIError) {
    const errorResponse: ErrorResponse = {
      error: error.message,
      code: error.code,
      details: error.details,
      timestamp,
      path
    };

    return NextResponse.json(errorResponse, { status: error.statusCode });
  }

  // Handle MongoDB errors
  if (error.name === 'ValidationError') {
    const errorResponse: ErrorResponse = {
      error: 'Database Validation Error',
      message: 'Data validation failed',
      details: (error as any).errors,
      code: 'DB_VALIDATION_ERROR',
      timestamp,
      path
    };

    return NextResponse.json(errorResponse, { status: 400 });
  }

  if (error.name === 'MongoServerError' && (error as any).code === 11000) {
    const field = Object.keys((error as any).keyPattern)[0];
    const errorResponse: ErrorResponse = {
      error: 'Duplicate Entry',
      message: `${field} already exists`,
      code: 'DUPLICATE_ENTRY',
      timestamp,
      path
    };

    return NextResponse.json(errorResponse, { status: 409 });
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    const errorResponse: ErrorResponse = {
      error: 'Invalid Token',
      message: 'Authentication token is invalid',
      code: 'INVALID_TOKEN',
      timestamp,
      path
    };

    return NextResponse.json(errorResponse, { status: 401 });
  }

  if (error.name === 'TokenExpiredError') {
    const errorResponse: ErrorResponse = {
      error: 'Token Expired',
      message: 'Authentication token has expired',
      code: 'TOKEN_EXPIRED',
      timestamp,
      path
    };

    return NextResponse.json(errorResponse, { status: 401 });
  }

  // Handle generic errors
  console.error('Unhandled error:', error);
  
  const errorResponse: ErrorResponse = {
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
    code: 'INTERNAL_ERROR',
    timestamp,
    path
  };

  return NextResponse.json(errorResponse, { status: 500 });
}

export function withErrorHandler(
  handler: (request: NextRequest, ...args: any[]) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: any[]) => {
    try {
      return await handler(request, ...args);
    } catch (error) {
      return createErrorResponse(error as Error, request);
    }
  };
}

// Rate limiting middleware
export function withRateLimit(
  maxRequests: number = 100,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
) {
  const requests = new Map<string, { count: number; resetTime: number }>();

  return function(handler: (request: NextRequest, ...args: any[]) => Promise<NextResponse>) {
    return async (request: NextRequest, ...args: any[]) => {
      const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
      const now = Date.now();
      
      const userRequests = requests.get(ip);
      
      if (!userRequests || now > userRequests.resetTime) {
        requests.set(ip, { count: 1, resetTime: now + windowMs });
        return handler(request, ...args);
      }
      
      if (userRequests.count >= maxRequests) {
        return NextResponse.json({
          error: 'Too Many Requests',
          message: 'Rate limit exceeded. Please try again later.',
          code: 'RATE_LIMIT_EXCEEDED',
          timestamp: new Date().toISOString(),
          path: new URL(request.url).pathname
        }, { status: 429 });
      }
      
      userRequests.count++;
      return handler(request, ...args);
    };
  };
}

// Request validation middleware
export function validateRequest<T>(schema: any) {
  return function(handler: (request: NextRequest, data: T, ...args: any[]) => Promise<NextResponse>) {
    return async (request: NextRequest, ...args: any[]) => {
      try {
        const body = await request.json();
        const validatedData = schema.parse(body);
        return handler(request, validatedData, ...args);
      } catch (error) {
        if (error instanceof ZodError) {
          return createErrorResponse(error, request);
        }
        throw error;
      }
    };
  };
}

// Common error types
export const ErrorCodes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_REQUIRED: 'AUTHENTICATION_REQUIRED',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  PAYMENT_REQUIRED: 'PAYMENT_REQUIRED',
  INTERNAL_ERROR: 'INTERNAL_ERROR'
} as const;
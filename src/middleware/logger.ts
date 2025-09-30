import { NextRequest, NextResponse } from 'next/server';

export interface RequestLog {
  method: string;
  url: string;
  userAgent?: string;
  ip?: string;
  userId?: string;
  timestamp: string;
  duration?: number;
  statusCode?: number;
  error?: string;
}

export class Logger {
  private static instance: Logger;
  private logs: RequestLog[] = [];

  private constructor() {}

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  public log(logData: RequestLog) {
    this.logs.push(logData);
    
    // In production, you'd send this to a proper logging service
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${logData.timestamp}] ${logData.method} ${logData.url} - ${logData.statusCode} - ${logData.duration}ms`);
    }

    // Keep only last 1000 logs in memory
    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(-1000);
    }
  }

  public getLogs(limit: number = 100): RequestLog[] {
    return this.logs.slice(-limit);
  }

  public getErrorLogs(limit: number = 50): RequestLog[] {
    return this.logs
      .filter(log => log.error || (log.statusCode && log.statusCode >= 400))
      .slice(-limit);
  }
}

export function withRequestLogging(
  handler: (request: NextRequest, ...args: any[]) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: any[]) => {
    const startTime = Date.now();
    const logger = Logger.getInstance();
    
    const logData: RequestLog = {
      method: request.method,
      url: new URL(request.url).pathname,
      userAgent: request.headers.get('user-agent') || undefined,
      ip: request.ip || request.headers.get('x-forwarded-for') || undefined,
      userId: (request as any).user?.userId,
      timestamp: new Date().toISOString()
    };

    try {
      const response = await handler(request, ...args);
      
      logData.duration = Date.now() - startTime;
      logData.statusCode = response.status;
      
      logger.log(logData);
      
      return response;
    } catch (error) {
      logData.duration = Date.now() - startTime;
      logData.error = error instanceof Error ? error.message : 'Unknown error';
      logData.statusCode = 500;
      
      logger.log(logData);
      
      throw error;
    }
  };
}

// Audit logging for sensitive operations
export function auditLog(
  action: string,
  resourceType: string,
  resourceId?: string,
  userId?: string,
  metadata?: Record<string, any>
) {
  const auditEntry = {
    action,
    resourceType,
    resourceId,
    userId,
    metadata,
    timestamp: new Date().toISOString(),
    ip: 'unknown' // Would be extracted from request context in real implementation
  };

  // In production, this would go to a secure audit log
  console.log('AUDIT:', JSON.stringify(auditEntry));
}

export function withAuditLogging(
  action: string,
  resourceType: string,
  getResourceId?: (request: NextRequest, ...args: any[]) => string
) {
  return function(handler: (request: NextRequest, ...args: any[]) => Promise<NextResponse>) {
    return async (request: NextRequest, ...args: any[]) => {
      const userId = (request as any).user?.userId;
      const resourceId = getResourceId ? getResourceId(request, ...args) : undefined;
      
      try {
        const response = await handler(request, ...args);
        
        // Log successful operations
        if (response.status < 400) {
          auditLog(action, resourceType, resourceId, userId, {
            method: request.method,
            url: new URL(request.url).pathname,
            success: true
          });
        }
        
        return response;
      } catch (error) {
        // Log failed operations
        auditLog(action, resourceType, resourceId, userId, {
          method: request.method,
          url: new URL(request.url).pathname,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        
        throw error;
      }
    };
  };
}
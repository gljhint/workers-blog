/**
 * 自定义错误类
 */
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 预定义的错误类型
 */
export class ValidationError extends AppError {
  constructor(message: string = '数据验证失败') {
    super(message, 400);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = '资源') {
    super(`${resource}未找到`, 404);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = '数据库操作失败') {
    super(message, 500);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = '身份验证失败') {
    super(message, 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = '权限不足') {
    super(message, 403);
  }
}

/**
 * 错误处理工具函数
 */
export const handleError = (error: unknown): { message: string; statusCode: number } => {
  if (error instanceof AppError) {
    return {
      message: error.message,
      statusCode: error.statusCode
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      statusCode: 500
    };
  }

  return {
    message: '未知错误',
    statusCode: 500
  };
};

/**
 * API 响应格式化
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
}

export const createSuccessResponse = <T>(data: T): ApiResponse<T> => ({
  success: true,
  data
});

export const createErrorResponse = (error: unknown): ApiResponse => {
  const { message, statusCode } = handleError(error);
  return {
    success: false,
    error: message,
    statusCode
  };
};
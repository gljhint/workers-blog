/**
 * 基础控制器类 - 提供通用的业务逻辑处理方法
 */
export class BaseController {
  /**
   * 处理异步操作的错误包装器
   */
  protected async handleAsync<T>(
    operation: () => Promise<T>,
    errorMessage: string = '操作失败'
  ): Promise<{ success: boolean; data?: T; error?: string }> {
    try {
      const data = await operation();
      return { success: true, data };
    } catch (error) {
      console.error(`${errorMessage}:`, error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : errorMessage 
      };
    }
  }

  /**
   * 验证必填参数
   */
  protected validateRequired(
    data: Record<string, any>, 
    requiredFields: string[]
  ): { isValid: boolean; missingFields: string[] } {
    const missingFields = requiredFields.filter(field => 
      data[field] === undefined || data[field] === null || data[field] === ''
    );

    return {
      isValid: missingFields.length === 0,
      missingFields
    };
  }

  /**
   * 清理输入数据
   */
  protected sanitizeInput(data: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string') {
        sanitized[key] = value.trim();
      } else {
        sanitized[key] = value;
      }
    }
    
    return sanitized;
  }

  /**
   * 分页计算
   */
  protected calculatePagination(
    page: number = 1, 
    limit: number = 10
  ): { offset: number; limit: number } {
    const validPage = Math.max(1, page);
    const validLimit = Math.max(1, Math.min(100, limit)); // 最大限制 100 条
    
    return {
      offset: (validPage - 1) * validLimit,
      limit: validLimit
    };
  }
}
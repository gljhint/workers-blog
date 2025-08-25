import { ValidationError } from '@/utils/errors';

/**
 * 分类数据验证器
 */
export class CategoryValidator {
  /**
   * 验证创建分类的数据
   */
  static validateCreateCategory(data: any): void {
    if (!data.name || (typeof data.name === 'string' && data.name.trim() === '')) {
      throw new ValidationError('分类名称不能为空');
    }

    if (data.name.length > 50) {
      throw new ValidationError('分类名称长度不能超过 50 个字符');
    }

    if (data.description && data.description.length > 200) {
      throw new ValidationError('分类描述长度不能超过 200 个字符');
    }

    if (data.color && !this.isValidColor(data.color)) {
      throw new ValidationError('颜色格式无效，请使用十六进制颜色代码（如 #ff0000）');
    }
  }

  /**
   * 验证更新分类的数据
   */
  static validateUpdateCategory(data: any): void {
    if (data.name !== undefined) {
      if (!data.name || data.name.trim() === '') {
        throw new ValidationError('分类名称不能为空');
      }
      if (data.name.length > 50) {
        throw new ValidationError('分类名称长度不能超过 50 个字符');
      }
    }

    if (data.description !== undefined && data.description && data.description.length > 200) {
      throw new ValidationError('分类描述长度不能超过 200 个字符');
    }

    if (data.color !== undefined && data.color && !this.isValidColor(data.color)) {
      throw new ValidationError('颜色格式无效，请使用十六进制颜色代码（如 #ff0000）');
    }
  }

  /**
   * 验证分类 slug
   */
  static validateSlug(slug: string): void {
    if (!slug || slug.trim() === '') {
      throw new ValidationError('分类 slug 不能为空');
    }

    if (!/^[a-z0-9-]+$/.test(slug)) {
      throw new ValidationError('分类 slug 只能包含小写字母、数字和连字符');
    }

    if (slug.length > 50) {
      throw new ValidationError('分类 slug 长度不能超过 50 个字符');
    }
  }

  /**
   * 验证十六进制颜色格式
   */
  private static isValidColor(color: string): boolean {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
  }
}
import { ValidationError } from '@/utils/errors';

/**
 * 标签数据验证器
 */
export class TagValidator {
  /**
   * 验证创建标签的数据
   */
  static validateCreateTag(data: any): void {
    if (!data.name || (typeof data.name === 'string' && data.name.trim() === '')) {
      throw new ValidationError('标签名称不能为空');
    }

    if (data.name.length > 30) {
      throw new ValidationError('标签名称长度不能超过 30 个字符');
    }

    if (data.description && data.description.length > 100) {
      throw new ValidationError('标签描述长度不能超过 100 个字符');
    }
  }

  /**
   * 验证更新标签的数据
   */
  static validateUpdateTag(data: any): void {
    if (data.name !== undefined) {
      if (!data.name || data.name.trim() === '') {
        throw new ValidationError('标签名称不能为空');
      }
      if (data.name.length > 30) {
        throw new ValidationError('标签名称长度不能超过 30 个字符');
      }
    }

    if (data.description !== undefined && data.description && data.description.length > 100) {
      throw new ValidationError('标签描述长度不能超过 100 个字符');
    }
  }

  /**
   * 验证标签 slug
   */
  static validateSlug(slug: string): void {
    if (!slug || slug.trim() === '') {
      throw new ValidationError('标签 slug 不能为空');
    }

    if (!/^[a-z0-9-]+$/.test(slug)) {
      throw new ValidationError('标签 slug 只能包含小写字母、数字和连字符');
    }

    if (slug.length > 30) {
      throw new ValidationError('标签 slug 长度不能超过 30 个字符');
    }
  }

  /**
   * 验证标签名称数组
   */
  static validateTagNames(tagNames: string[]): void {
    if (!Array.isArray(tagNames)) {
      throw new ValidationError('标签必须是数组格式');
    }

    if (tagNames.length > 10) {
      throw new ValidationError('标签数量不能超过 10 个');
    }

    for (const name of tagNames) {
      if (!name || name.trim() === '') {
        throw new ValidationError('标签名称不能为空');
      }
      if (name.length > 30) {
        throw new ValidationError('标签名称长度不能超过 30 个字符');
      }
    }

    // 检查是否有重复的标签
    const uniqueNames = new Set(tagNames.map(name => name.trim().toLowerCase()));
    if (uniqueNames.size !== tagNames.length) {
      throw new ValidationError('标签名称不能重复');
    }
  }
}
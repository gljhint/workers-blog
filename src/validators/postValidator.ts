import { ValidationError } from '@/utils/errors';

/**
 * 文章数据验证器
 */
export class PostValidator {
  /**
   * 验证创建文章的数据
   */
  static validateCreatePost(data: any): void {
    const requiredFields = ['title'];
    const missingFields = requiredFields.filter(field => 
      !data[field] || (typeof data[field] === 'string' && data[field].trim() === '')
    );

    if (missingFields.length > 0) {
      throw new ValidationError(`缺少必填字段: ${missingFields.join(', ')}`);
    }

    // 验证字段长度
    if (data.title.length > 200) {
      throw new ValidationError('标题长度不能超过 200 个字符');
    }

    if (data.description && data.description.length > 500) {
      throw new ValidationError('描述长度不能超过 500 个字符');
    }

    if (data.author && data.author.length > 100) {
      throw new ValidationError('作者名称长度不能超过 100 个字符');
    }

    // 验证标签数量
    if (data.tags && Array.isArray(data.tags) && data.tags.length > 10) {
      throw new ValidationError('标签数量不能超过 10 个');
    }

    // 验证分类 ID
    if (data.category_id && (!Number.isInteger(data.category_id) || data.category_id <= 0)) {
      throw new ValidationError('分类 ID 必须是正整数');
    }
  }

  /**
   * 验证更新文章的数据
   */
  static validateUpdatePost(data: any): void {
    // 更新时字段可选，但如果提供了就要验证
    if (data.title !== undefined) {
      if (!data.title || data.title.trim() === '') {
        throw new ValidationError('标题不能为空');
      }
      if (data.title.length > 200) {
        throw new ValidationError('标题长度不能超过 200 个字符');
      }
    }

    if (data.description !== undefined) {
      if (!data.description || data.description.trim() === '') {
        throw new ValidationError('描述不能为空');
      }
      if (data.description.length > 500) {
        throw new ValidationError('描述长度不能超过 500 个字符');
      }
    }

    if (data.content !== undefined) {
      if (!data.content || data.content.trim() === '') {
        throw new ValidationError('文章内容不能为空');
      }
    }

    if (data.author !== undefined) {
      if (!data.author || data.author.trim() === '') {
        throw new ValidationError('作者不能为空');
      }
      if (data.author.length > 100) {
        throw new ValidationError('作者名称长度不能超过 100 个字符');
      }
    }

    if (data.tags && Array.isArray(data.tags) && data.tags.length > 10) {
      throw new ValidationError('标签数量不能超过 10 个');
    }

    if (data.category_id && (!Number.isInteger(data.category_id) || data.category_id <= 0)) {
      throw new ValidationError('分类 ID 必须是正整数');
    }
  }

  /**
   * 验证文章 slug
   */
  static validateSlug(slug: string): void {
    if (!slug || slug.trim() === '') {
      throw new ValidationError('文章 slug 不能为空');
    }

    // slug 只能包含字母、数字、连字符
    if (!/^[a-z0-9-]+$/.test(slug)) {
      throw new ValidationError('文章 slug 只能包含小写字母、数字和连字符');
    }

    if (slug.length > 100) {
      throw new ValidationError('文章 slug 长度不能超过 100 个字符');
    }
  }
}
import { BaseController } from './BaseController';
import {
  getAllTags,
  findTagBySlug,
  createTag,
  findTagById,
  updateTag as updateTagData,
  deleteTag as deleteTagData,
  findOrCreateTagByName,
  generateUniqueTagSlug
} from '@/models/TagModel';
import { Tag } from '@/lib/types';

/**
 * 标签控制器 - 处理标签相关的业务逻辑
 */
export class TagController extends BaseController {

  /**
   * 获取所有标签
   */
  async getAllTags(): Promise<{ success: boolean; data?: Tag[]; error?: string }> {
    return await this.handleAsync(
      async () => {
        const tags = await getAllTags();
        return tags.map(tag => ({
          ...tag,
          description: tag.description || undefined,
          post_count: tag.post_count || 0,
          created_at: tag.created_at || new Date().toISOString(),
          updated_at: tag.updated_at || new Date().toISOString()
        })) as Tag[];
      }, 
      '获取标签列表失败'
    );
  }

  /**
   * 获取所有活跃的标签（有文章的标签）
   */
  async getActiveTags(): Promise<{ success: boolean; data?: Tag[]; error?: string }> {
    return await this.handleAsync(async () => {
      const allTags = await getAllTags();
      return allTags.filter(tag => (tag.post_count || 0) > 0).map(tag => ({
        ...tag,
        description: tag.description || undefined,
        post_count: tag.post_count || 0,
        created_at: tag.created_at || new Date().toISOString(),
        updated_at: tag.updated_at || new Date().toISOString()
      })) as Tag[];
    }, '获取标签列表失败');
  }

  /**
   * 根据 slug 获取标签
   */
  async getTagBySlug(slug: string): Promise<{ success: boolean; data?: Tag; error?: string }> {
    return await this.handleAsync(async () => {
      const tag = await findTagBySlug(slug);
      if (!tag) {
        throw new Error('标签不存在');
      }
      return {
        ...tag,
        description: tag.description || undefined,
        post_count: tag.post_count || 0,
        created_at: tag.created_at || new Date().toISOString(),
        updated_at: tag.updated_at || new Date().toISOString()
      } as Tag;
    }, '获取标签失败');
  }

  /**
   * 创建标签
   */
  async createTag(data: {
    name: string;
    slug?: string;
    description?: string;
  }): Promise<{ success: boolean; data?: Tag; error?: string }> {
    return await this.handleAsync(async () => {
      // 验证必填字段
      const validation = this.validateRequired(data, ['name']);
      if (!validation.isValid) {
        throw new Error(`缺少必填字段: ${validation.missingFields.join(', ')}`);
      }

      // 清理输入数据
      const sanitizedData = this.sanitizeInput(data);

      const result = await createTag({
        name: sanitizedData.name,
        slug: sanitizedData.slug
      });
      return result as Tag;
    }, '创建标签失败');
  }

  /**
   * 更新标签
   */
  async updateTag(
    id: number, 
    data: Partial<{
      name: string;
      description: string;
    }>
  ): Promise<{ success: boolean; data?: Tag; error?: string }> {
    return await this.handleAsync(async () => {
      // 检查标签是否存在
      const existingTag = await findTagById(id);
      if (!existingTag) {
        throw new Error('标签不存在');
      }

      // 清理输入数据
      const sanitizedData = this.sanitizeInput(data);

      // 准备更新数据
      const updateData: Record<string, any> = {};

      if (sanitizedData.name) {
        updateData.name = sanitizedData.name;
        // 如果名称改变，重新生成 slug
        if (sanitizedData.name !== existingTag.name) {
          updateData.slug = await generateUniqueTagSlug(sanitizedData.name);
        }
      }

      if (sanitizedData.description !== undefined) {
        updateData.description = sanitizedData.description || null;
      }

      const result = await updateTagData(id, updateData);
      return result as Tag;
    }, '更新标签失败');
  }

  /**
   * 删除标签
   */
  async deleteTag(id: number): Promise<{ success: boolean; error?: string }> {
    return await this.handleAsync(async () => {
      // 检查标签是否存在
      const existingTag = await findTagById(id);
      if (!existingTag) {
        throw new Error('标签不存在');
      }

      // 注意：这里会级联删除所有使用此标签的文章关联
      // 如果需要更严格的检查，可以先查询是否有文章使用此标签

      const deleted = await deleteTagData(id);
      if (!deleted) {
        throw new Error('删除标签失败');
      }

      return true;
    }, '删除标签失败');
  }

  /**
   * 根据 ID 获取标签
   */
  async getTagById(id: number): Promise<{ success: boolean; data?: Tag; error?: string }> {
    return await this.handleAsync(async () => {
      const tag = await findTagById(id);
      if (!tag) {
        throw new Error('标签不存在');
      }
      return {
        ...tag,
        description: tag.description || undefined,
        post_count: tag.post_count || 0,
        created_at: tag.created_at || new Date().toISOString(),
        updated_at: tag.updated_at || new Date().toISOString()
      } as Tag;
    }, '获取标签失败');
  }

  /**
   * 批量创建或查找标签
   */
  async findOrCreateTags(tagNames: string[]): Promise<{ success: boolean; data?: Tag[]; error?: string }> {
    return await this.handleAsync(async () => {
      const tags: Tag[] = [];
      
      for (const name of tagNames) {
        if (name.trim()) {
          const tag = await findOrCreateTagByName(name.trim());
          if (tag) tags.push({
            ...tag,
            description: tag.description || undefined,
            post_count: tag.post_count || 0,
            created_at: tag.created_at || new Date().toISOString(),
            updated_at: tag.updated_at || new Date().toISOString()
          } as Tag);
        }
      }
      
      return tags;
    }, '处理标签失败');
  }
}
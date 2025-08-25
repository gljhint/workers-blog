import { BaseController } from './BaseController';
import { 
  getCategoriesWithPostCount, 
  findCategoryBySlug, 
  createCategory, 
  findCategoryById, 
  updateCategory as updateCategoryData, 
  deleteCategory as deleteCategoryData, 
  countCategoryPosts
} from '@/models/CategoryModel';
import { Category } from '@/lib/types';

/**
 * 分类控制器 - 处理分类相关的业务逻辑
 */
export class CategoryController extends BaseController {

  /**
   * 获取所有分类
   */
  async getAllCategories(): Promise<{ success: boolean; data?: Category[]; error?: string }> {
    return await this.handleAsync(
      async () => {
        const categories = await getCategoriesWithPostCount();
        return categories.map(cat => ({
          ...cat,
          description: cat.description || undefined,
          post_count: cat.post_count || 0,
          created_at: cat.created_at || new Date().toISOString(),
          updated_at: cat.updated_at || new Date().toISOString()
        })) as Category[];
      },
      '获取分类列表失败'
    );
  }

  /**
   * 根据 slug 获取分类
   */
  async getCategoryBySlug(slug: string): Promise<{ success: boolean; data?: Category; error?: string }> {
    return await this.handleAsync(async () => {
      const category = await findCategoryBySlug(slug);
      if (!category) {
        throw new Error('分类不存在');
      }
      return {
        ...category,
        description: category.description || undefined,
        post_count: category.post_count || 0,
        created_at: category.created_at || new Date().toISOString(),
        updated_at: category.updated_at || new Date().toISOString()
      } as Category;
    }, '获取分类失败');
  }

  /**
   * 创建分类
   */
  async createCategory(data: {
    name: string;
    description?: string;
    color?: string;
  }): Promise<{ success: boolean; data?: Category; error?: string }> {
    return await this.handleAsync(async () => {
      // 验证必填字段
      const validation = this.validateRequired(data, ['name']);
      if (!validation.isValid) {
        throw new Error(`缺少必填字段: ${validation.missingFields.join(', ')}`);
      }

      // 清理输入数据
      const sanitizedData = this.sanitizeInput(data);

      // 验证颜色格式（如果提供）
      if (sanitizedData.color && !this.isValidColor(sanitizedData.color)) {
        throw new Error('颜色格式无效');
      }

      const result = await createCategory({
        name: sanitizedData.name,
        description: sanitizedData.description
      });
      return result as Category;
    }, '创建分类失败');
  }

  /**
   * 更新分类
   */
  async updateCategory(
    id: number, 
    data: Partial<{
      name: string;
      description: string;
      color: string;
    }>
  ): Promise<{ success: boolean; data?: Category; error?: string }> {
    return await this.handleAsync(async () => {
      // 检查分类是否存在
      const existingCategory = await findCategoryById(id);
      if (!existingCategory) {
        throw new Error('分类不存在');
      }

      // 清理输入数据
      const sanitizedData = this.sanitizeInput(data);

      // 准备更新数据
      const updateData: Record<string, any> = {};

      if (sanitizedData.name) {
        updateData.name = sanitizedData.name;
        // 如果名称改变，重新生成 slug - 由 model 内部处理
      }

      if (sanitizedData.description !== undefined) {
        updateData.description = sanitizedData.description || null;
      }

      if (sanitizedData.color) {
        if (!this.isValidColor(sanitizedData.color)) {
          throw new Error('颜色格式无效');
        }
        updateData.color = sanitizedData.color;
      }

      const result = await updateCategoryData(id, updateData);
      return result as Category;
    }, '更新分类失败');
  }

  /**
   * 删除分类
   */
  async deleteCategory(id: number): Promise<{ success: boolean; error?: string }> {
    return await this.handleAsync(async () => {
      // 检查分类是否存在
      const existingCategory = await findCategoryById(id);
      if (!existingCategory) {
        throw new Error('分类不存在');
      }

      // 检查是否有文章使用此分类
      const postsCount = await countCategoryPosts(id);
      if (postsCount > 0) {
        throw new Error('无法删除：该分类下还有文章');
      }

      const deleted = await deleteCategoryData(id);
      if (!deleted) {
        throw new Error('删除分类失败');
      }

      return true;
    }, '删除分类失败');
  }

  /**
   * 根据 ID 获取分类
   */
  async getCategoryById(id: number): Promise<{ success: boolean; data?: Category; error?: string }> {
    return await this.handleAsync(async () => {
      const category = await findCategoryById(id);
      if (!category) {
        throw new Error('分类不存在');
      }
      return {
        ...category,
        description: category.description || undefined,
        post_count: category.post_count || 0,
        created_at: category.created_at || new Date().toISOString(),
        updated_at: category.updated_at || new Date().toISOString()
      } as Category;
    }, '获取分类失败');
  }

  /**
   * 验证颜色格式（简单的十六进制颜色验证）
   */
  private isValidColor(color: string): boolean {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
  }
}
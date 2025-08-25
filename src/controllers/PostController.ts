import { BaseController } from './BaseController';
import { 
  getAllPosts,
  getAllPostsWithDetails,
  getPublishedPosts,
  findPostBySlug,
  findPostById,
  createPost,
  updatePost,
  deletePost,
  generateUniquePostSlug,
  incrementPostViewCount,
  getPostsByCategorySlug,
  getPostsByTagSlug
} from '@/models/PostModel';
import { findOrCreateTagByName, updateTagPostCount } from '@/models/TagModel';
import { 
  addTagsToPost,
  removeAllTagsFromPost,
  updatePostTags,
  getTagIdsByPostId
} from '@/models/PostTagModel';
import { updateCategoryPostCount } from '@/models/CategoryModel';
import { BlogPost, PostMetadata, CreatePostData } from '@/lib/types';
import MarkdownIt from 'markdown-it';

/**
 * 文章控制器 - 处理文章相关的业务逻辑
 */
export class PostController extends BaseController {
  private md: MarkdownIt;

  constructor() {
    super();
    this.md = new MarkdownIt({
      html: true,
      linkify: true,
      typographer: true,
    });
  }

  /**
   * 获取已发布的文章（支持分页和过滤）
   */
  async getPublishedPosts(options?: {
    page?: number;
    limit?: number;
    category?: string;
    tag?: string;
  }): Promise<{ success: boolean; data?: any; error?: string }> {
    return await this.handleAsync(
      () => getPublishedPosts(),
      '获取文章列表失败'
    );
  }

  /**
   * 获取所有文章（包括草稿）- 管理后台使用
   */
  async getAllPosts(): Promise<{ success: boolean; data?: any[]; error?: string }> {
    return await this.handleAsync(
      () => getAllPostsWithDetails(),
      '获取文章列表失败'
    );
  }

  /**
   * 根据 slug 获取文章详情
   */
  async getPostBySlug(
    slug: string, 
    incrementView: boolean = false
  ): Promise<{ success: boolean; data?: BlogPost; error?: string }> {
    return await this.handleAsync(async () => {
      if (incrementView) {
        await incrementPostViewCount(slug);
      }
      
      const post = await findPostBySlug(slug);
      if (!post) {
        throw new Error('文章未找到');
      }
      
      // Transform database result to match BlogPost type
      return {
        ...post,
        description: post.description || undefined,
        is_published: Boolean(post.is_published),
        is_featured: Boolean(post.is_featured),
        allow_comments: Boolean(post.allow_comments),
        view_count: post.view_count || 0,
        like_count: post.like_count || 0,
        comment_count: post.comment_count || 0
      } as BlogPost;
    }, '获取文章详情失败');
  }

  /**
   * 根据分类获取文章
   */
  async getPostsByCategory(categorySlug: string): Promise<{ success: boolean; data?: PostMetadata[]; error?: string }> {
    return await this.handleAsync(async () => {
      const posts = await getPostsByCategorySlug(categorySlug);
      const result = [];
      
      for (const post of posts) {
        // 获取文章的标签
        const tagIds = await getTagIdsByPostId(post.id);
        const tags: any[] = [];
        
        if (tagIds.length > 0) {
          const { getAllTags } = await import('@/models/TagModel');
          const allTags = await getAllTags();
          tagIds.forEach(tagId => {
            const tag = allTags.find(t => t.id === tagId);
            if (tag) {
              tags.push(tag);
            }
          });
        }

        result.push({
          ...post,
          description: post.description || undefined,
          is_published: Boolean(post.is_published),
          is_featured: Boolean(post.is_featured),
          allow_comments: Boolean(post.allow_comments),
          view_count: post.view_count || 0,
          like_count: post.like_count || 0,
          comment_count: post.comment_count || 0,
          tags
        });
      }
      
      return result as PostMetadata[];
    }, '获取分类文章失败');
  }

  /**
   * 根据标签获取文章
   */
  async getPostsByTag(tagSlug: string): Promise<{ success: boolean; data?: PostMetadata[]; error?: string }> {
    return await this.handleAsync(async () => {
      const posts = await getPostsByTagSlug(tagSlug);
      const result = [];
      
      for (const post of posts) {
        // 获取文章的标签
        const tagIds = await getTagIdsByPostId(post.id);
        const tags: any[] = [];
        
        if (tagIds.length > 0) {
          const { getAllTags } = await import('@/models/TagModel');
          const allTags = await getAllTags();
          tagIds.forEach(tagId => {
            const tag = allTags.find(t => t.id === tagId);
            if (tag) {
              tags.push(tag);
            }
          });
        }

        result.push({
          ...post,
          description: post.description || undefined,
          is_published: Boolean(post.is_published),
          is_featured: Boolean(post.is_featured),
          allow_comments: Boolean(post.allow_comments),
          view_count: post.view_count || 0,
          like_count: post.like_count || 0,
          comment_count: post.comment_count || 0,
          tags
        });
      }
      
      return result as PostMetadata[];
    }, '获取标签文章失败');
  }

  /**
   * 创建文章
   */
  async createPost(data: CreatePostData): Promise<{ success: boolean; data?: BlogPost; error?: string }> {
    return await this.handleAsync(async () => {
      // 验证必填字段
      const validation = this.validateRequired(data, ['title']);
      if (!validation.isValid) {
        throw new Error(`缺少必填字段: ${validation.missingFields.join(', ')}`);
      }

      // 清理输入数据
      const sanitizedData = this.sanitizeInput(data);

      // 生成唯一的 slug
      const slug = await generateUniquePostSlug(sanitizedData.title);

      // 处理内容 - 使用富文本HTML内容
      const htmlContent = sanitizedData.content || '';

      // 创建文章数据
      const postData = {
        slug,
        title: sanitizedData.title,
        description: sanitizedData.description || '',
        content: htmlContent,
        is_published: Boolean(sanitizedData.is_published),
        is_featured: Boolean(sanitizedData.is_featured),
        published_at: sanitizedData.is_published ? new Date().toISOString() : undefined,
        category_id: sanitizedData.category_id || null,
        author_id: sanitizedData.author_id || null,
        cover_image: sanitizedData.cover_image || null,
        allow_comments: sanitizedData.allow_comments !== false
      };

      // 创建文章
      const post = await createPost(postData);
      
      if (!post) {
        throw new Error('文章创建失败');
      }

      // 处理标签
      if (data.tag_ids && data.tag_ids.length > 0) {
        await this.handlePostTagsByIds(post.id, data.tag_ids);
      }

      // 更新相关计数
      await this.updateRelatedCounts(post);

      // 返回完整的文章信息
      const createdPost = await findPostBySlug(slug);
      if (!createdPost) {
        throw new Error('无法获取创建的文章信息');
      }
      
      // Transform database result to match BlogPost type
      return {
        ...createdPost,
        description: createdPost.description || undefined,
        is_published: Boolean(createdPost.is_published),
        is_featured: Boolean(createdPost.is_featured),
        allow_comments: Boolean(createdPost.allow_comments),
        view_count: createdPost.view_count || 0,
        like_count: createdPost.like_count || 0,
        comment_count: createdPost.comment_count || 0
      } as BlogPost;
    }, '创建文章失败');
  }

  /**
   * 更新文章
   */
  async updatePost(
    id: number, 
    data: Partial<CreatePostData>
  ): Promise<{ success: boolean; data?: BlogPost; error?: string }> {
    return await this.handleAsync(async () => {
      // 检查文章是否存在
      const existingPost = await findPostById(id);
      if (!existingPost) {
        throw new Error('文章不存在');
      }

      // 清理输入数据
      const sanitizedData = this.sanitizeInput(data);

      // 准备更新数据
      const updateData: Record<string, any> = {};

      if (sanitizedData.title) {
        updateData.title = sanitizedData.title;
        // 如果标题改变，重新生成 slug
        if (sanitizedData.title !== existingPost.title) {
          updateData.slug = await generateUniquePostSlug(sanitizedData.title);
        }
      }

      if (sanitizedData.description) {
        updateData.description = sanitizedData.description;
      }

      // 处理内容 - 只处理HTML内容
      if (sanitizedData.content) {
        updateData.content = sanitizedData.content;
      }

      if (sanitizedData.is_published !== undefined) {
        updateData.is_published = Boolean(sanitizedData.is_published);
        updateData.published_at = Boolean(sanitizedData.is_published) ? new Date().toISOString() : null;
      }

      if (sanitizedData.is_featured !== undefined) {
        updateData.is_featured = Boolean(sanitizedData.is_featured);
      }

      if (sanitizedData.allow_comments !== undefined) {
        updateData.allow_comments = Boolean(sanitizedData.allow_comments);
      }

      if (sanitizedData.cover_image !== undefined) {
        updateData.cover_image = sanitizedData.cover_image || null;
      }

      if (sanitizedData.category_id !== undefined) {
        updateData.category_id = sanitizedData.category_id || null;
      }

      // 更新文章
      const updatedPost = await updatePost(id, updateData);

      // 处理标签
      if (data.tag_ids !== undefined) {
        await this.handlePostTagsByIds(id, data.tag_ids || []);
      }

      // 更新相关计数
      if (updatedPost) {
        await this.updateRelatedCounts(updatedPost);
        // 如果分类发生了变化，还需要更新原分类的计数
        if (existingPost.category_id && existingPost.category_id !== updatedPost.category_id) {
          await updateCategoryPostCount(existingPost.category_id);
        }
      }

      // Transform database result to match BlogPost type
      if (!updatedPost) {
        throw new Error('更新文章失败');
      }
      
      return {
        ...updatedPost,
        description: updatedPost.description || undefined,
        is_published: Boolean(updatedPost.is_published),
        is_featured: Boolean(updatedPost.is_featured),
        allow_comments: Boolean(updatedPost.allow_comments),
        view_count: updatedPost.view_count || 0,
        like_count: updatedPost.like_count || 0,
        comment_count: updatedPost.comment_count || 0
      } as BlogPost;
    }, '更新文章失败');
  }

  /**
   * 删除文章
   */
  async deletePost(id: number): Promise<{ success: boolean; error?: string }> {
    return await this.handleAsync(async () => {
      // 检查文章是否存在
      const existingPost = await findPostById(id);
      if (!existingPost) {
        throw new Error('文章不存在');
      }

      // 更新相关计数（在删除前更新，因为删除后就获取不到文章信息了）
      await this.updateRelatedCounts(existingPost);

      // 删除文章标签关联
      await removeAllTagsFromPost(id);

      // 删除文章
      const deleted = await deletePost(id);
      if (!deleted) {
        throw new Error('删除文章失败');
      }

      return true;
    }, '删除文章失败');
  }

  /**
   * 根据 ID 获取文章（管理后台使用）
   */
  async getPostById(id: number): Promise<{ success: boolean; data?: BlogPost; error?: string }> {
    return await this.handleAsync(async () => {
      const post = await findPostById(id);
      if (!post) {
        throw new Error('文章不存在');
      }

      // 获取文章的标签
      const tagIds = await getTagIdsByPostId(id);
      const tags: any[] = [];
      
      if (tagIds.length > 0) {
        const { getAllTags } = await import('@/models/TagModel');
        const allTags = await getAllTags();
        tagIds.forEach(tagId => {
          const tag = allTags.find(t => t.id === tagId);
          if (tag) {
            tags.push(tag);
          }
        });
      }

      return {
        ...post,
        tags
      } as BlogPost;
    }, '获取文章失败');
  }

  /**
   * 通过标签ID处理文章标签
   */
  private async handlePostTagsByIds(postId: number, tagIds: number[]): Promise<void> {
    // 使用更新方法，一次性处理所有标签关联
    await updatePostTags(postId, tagIds);
  }

  /**
   * 处理文章标签
   */
  private async handlePostTags(postId: number, tagNames: string[]): Promise<void> {
    const tagIds: number[] = [];

    // 为每个标签名称创建或查找标签
    for (const tagName of tagNames) {
      const tag = await findOrCreateTagByName(tagName.trim());
      if (tag) tagIds.push(tag.id);
    }

    // 设置文章的标签
    await updatePostTags(postId, tagIds);
  }

  /**
   * 更新相关计数（分类和标签的文章数量）
   */
  private async updateRelatedCounts(post: any): Promise<void> {
    try {
      // 更新分类的文章数量
      if (post.category_id) {
        await updateCategoryPostCount(post.category_id);
      }

      // 获取文章的所有标签并更新它们的文章数量
      const postTagIds = await getTagIdsByPostId(post.id);
      for (const tagId of postTagIds) {
        await updateTagPostCount(tagId);
      }
    } catch (error) {
      console.error('更新相关计数失败:', error);
      // 不抛出错误，避免影响主要操作
    }
  }
}
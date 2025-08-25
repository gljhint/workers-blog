import { PostController } from '@/controllers/PostController';
import { CategoryController } from '@/controllers/CategoryController';
import { TagController } from '@/controllers/TagController';

/**
 * 博客服务 - 整合多个控制器，提供高级业务逻辑
 */
export class BlogService {
  private postController: PostController;
  private categoryController: CategoryController;
  private tagController: TagController;

  constructor() {
    this.postController = new PostController();
    this.categoryController = new CategoryController();
    this.tagController = new TagController();
  }

  /**
   * 获取博客首页数据
   */
  async getHomePageData() {
    try {
      const [postsResult, categoriesResult, tagsResult] = await Promise.all([
        this.postController.getPublishedPosts(),
        this.categoryController.getAllCategories(),
        this.tagController.getActiveTags()
      ]);

      return {
        success: true,
        data: {
          posts: postsResult.data || [],
          categories: categoriesResult.data || [],
          tags: tagsResult.data || []
        }
      };
    } catch (error) {
      console.error('获取首页数据失败:', error);
      return {
        success: false,
        error: '获取首页数据失败'
      };
    }
  }

  /**
   * 获取文章详情页数据
   */
  async getPostPageData(slug: string, incrementView: boolean = false) {
    try {
      const [postResult, categoriesResult, tagsResult] = await Promise.all([
        this.postController.getPostBySlug(slug, incrementView),
        this.categoryController.getAllCategories(),
        this.tagController.getActiveTags()
      ]);

      if (!postResult.success) {
        return postResult;
      }

      return {
        success: true,
        data: {
          post: postResult.data,
          categories: categoriesResult.data || [],
          tags: tagsResult.data || []
        }
      };
    } catch (error) {
      console.error('获取文章页数据失败:', error);
      return {
        success: false,
        error: '获取文章页数据失败'
      };
    }
  }

  /**
   * 获取分类页面数据
   */
  async getCategoryPageData(categorySlug: string) {
    try {
      const [categoryResult, postsResult, allCategoriesResult] = await Promise.all([
        this.categoryController.getCategoryBySlug(categorySlug),
        this.postController.getPostsByCategory(categorySlug),
        this.categoryController.getAllCategories()
      ]);

      if (!categoryResult.success) {
        return categoryResult;
      }

      return {
        success: true,
        data: {
          category: categoryResult.data,
          posts: postsResult.data || [],
          allCategories: allCategoriesResult.data || []
        }
      };
    } catch (error) {
      console.error('获取分类页数据失败:', error);
      return {
        success: false,
        error: '获取分类页数据失败'
      };
    }
  }

  /**
   * 获取标签页面数据
   */
  async getTagPageData(tagSlug: string) {
    try {
      const [tagResult, postsResult, allTagsResult] = await Promise.all([
        this.tagController.getTagBySlug(tagSlug),
        this.postController.getPostsByTag(tagSlug),
        this.tagController.getActiveTags()
      ]);

      if (!tagResult.success) {
        return tagResult;
      }

      return {
        success: true,
        data: {
          tag: tagResult.data,
          posts: postsResult.data || [],
          allTags: allTagsResult.data || []
        }
      };
    } catch (error) {
      console.error('获取标签页数据失败:', error);
      return {
        success: false,
        error: '获取标签页数据失败'
      };
    }
  }

  /**
   * 获取管理后台数据
   */
  async getAdminDashboardData() {
    try {
      const [postsResult, categoriesResult, tagsResult] = await Promise.all([
        this.postController.getAllPosts(),
        this.categoryController.getAllCategories(),
        this.tagController.getActiveTags()
      ]);

      const posts = postsResult.data || [];
      const categories = categoriesResult.data || [];
      const tags = tagsResult.data || [];

      // 计算统计数据
      const stats = {
        totalPosts: posts.length,
        publishedPosts: posts.filter(p => p.is_published).length,
        draftPosts: posts.filter(p => !p.is_published).length,
        totalCategories: categories.length,
        totalTags: tags.length,
        totalViews: posts.reduce((sum, post) => sum + post.view_count, 0)
      };

      return {
        success: true,
        data: {
          posts,
          categories,
          tags,
          stats
        }
      };
    } catch (error) {
      console.error('获取管理后台数据失败:', error);
      return {
        success: false,
        error: '获取管理后台数据失败'
      };
    }
  }

  // 暴露各个控制器的方法，方便直接调用
  get posts() {
    return this.postController;
  }

  get categories() {
    return this.categoryController;
  }

  get tags() {
    return this.tagController;
  }
}
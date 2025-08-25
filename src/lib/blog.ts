import { format } from 'date-fns';
import { BlogPost, PostMetadata, Tag, Category, CreatePostData, Admin } from './types';
import { getPublishedPosts, findPostBySlug, incrementPostViewCount, generateUniquePostSlug, createPost as createPostData, getPostsByCategorySlug, getPostsByTagSlug } from '@/models/PostModel';
import { getAllTags as getTagsFromDB } from '@/models/TagModel';
import { getAllCategories as getCategoriesFromDB, findCategoryById } from '@/models/CategoryModel';
import { getTagIdsByPostId, addTagsToPost, removeAllTagsFromPost } from '@/models/PostTagModel';
import { findAdminById } from '@/models/AdminModel';

export async function getAllPosts(): Promise<PostMetadata[]> {
  try {
    const posts = await getPublishedPosts();
    const result = [];
    
    for (const post of posts) {
      // 获取文章的标签
      const tagIds = await getTagIdsByPostId(post.id);
      const tags: Tag[] = [];
      
      if (tagIds.length > 0) {
        const allTags = await getAllTags();
        tagIds.forEach(tagId => {
          const tag = allTags.find(t => t.id === tagId);
          if (tag) {
            tags.push(tag);
          }
        });
      }

      // 获取作者信息
      let author: Admin | undefined = undefined;
      if (post.author_id) {
        const authorData = await findAdminById(post.author_id);
        author = authorData ? {
          ...authorData,
          display_name: authorData.display_name || undefined,
          bio: authorData.bio || undefined,
          avatar: authorData.avatar || undefined,
          created_at: authorData.created_at || '',
          updated_at: authorData.updated_at || '',
          is_active: Boolean(authorData.is_active),
          last_login: authorData.last_login || undefined
        } : undefined;
      }

      // 获取分类信息
      let category: Category | undefined = undefined;
      if (post.category_id) {
        const categoryData = await findCategoryById(post.category_id);
        category = categoryData ? {
          ...categoryData,
          description: categoryData.description || undefined,
          created_at: categoryData.created_at || '',
          updated_at: categoryData.updated_at || '',
          post_count: categoryData.post_count || 0
        } : undefined;
      }

      result.push({
        id: post.id,
        slug: post.slug,
        title: post.title,
        description: post.description || '',
        is_published: Boolean(post.is_published),
        is_featured: Boolean(post.is_featured),
        view_count: post.view_count || 0,
        like_count: post.like_count || 0,
        comment_count: post.comment_count || 0,
        cover_image: post.cover_image || '',
        category_id: post.category_id || undefined,
        author_id: post.author_id || undefined,
        published_at: post.published_at || '',
        allow_comments: Boolean(post.allow_comments),
        created_at: post.created_at || '',
        updated_at: post.updated_at || '',
        tags,
        author,
        category
      });
    }
    
    return result;
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
}

export async function getPostBySlug(slug: string, incrementView = false): Promise<BlogPost | null> {
  try {
    const post = await findPostBySlug(slug);
    
    if (!post || !post.is_published) {
      return null;
    }

    // 如果需要增加浏览量，则调用增加浏览量的方法
    if (incrementView) {
      await incrementPostViewCount(slug);
    }

    // 获取文章的标签
    const tagIds = await getTagIdsByPostId(post.id);
    const tags: Tag[] = [];
    
    if (tagIds.length > 0) {
      const allTags = await getAllTags();
      tagIds.forEach(tagId => {
        const tag = allTags.find(t => t.id === tagId);
        if (tag) {
          tags.push(tag);
        }
      });
    }

    // 获取作者信息
    let author: Admin | undefined = undefined;
    if (post.author_id) {
      const authorData = await findAdminById(post.author_id);
      author = authorData ? {
        ...authorData,
        display_name: authorData.display_name || undefined,
        bio: authorData.bio || undefined,
        avatar: authorData.avatar || undefined,
        created_at: authorData.created_at || '',
        updated_at: authorData.updated_at || '',
        is_active: Boolean(authorData.is_active),
        last_login: authorData.last_login || undefined
      } : undefined;
    }

    // 获取分类信息
    let category: Category | undefined = undefined;
    if (post.category_id) {
      const categoryData = await findCategoryById(post.category_id);
      category = categoryData ? {
        ...categoryData,
        description: categoryData.description || undefined,
        created_at: categoryData.created_at || '',
        updated_at: categoryData.updated_at || '',
        post_count: categoryData.post_count || 0
      } : undefined;
    }

    return {
      id: post.id,
      slug: post.slug,
      title: post.title,
      description: post.description || '',
      content: post.content,
      is_published: Boolean(post.is_published),
      is_featured: Boolean(post.is_featured),
      view_count: post.view_count || 0,
      like_count: post.like_count || 0,
      comment_count: post.comment_count || 0,
      cover_image: post.cover_image || '',
      category_id: post.category_id || undefined,
      author_id: post.author_id || undefined,
      published_at: post.published_at || '',
      allow_comments: Boolean(post.allow_comments),
      created_at: post.created_at || '',
      updated_at: post.updated_at || '',
      tags,
      author,
      category
    };
  } catch (error) {
    console.error(`Error fetching post ${slug}:`, error);
    return null;
  }
}

export async function getPostsByTag(tagSlug: string): Promise<PostMetadata[]> {
  try {
    const posts = await getPostsByTagSlug(tagSlug);
    const result = [];
    
    for (const post of posts) {
      // 获取文章的标签
      const tagIds = await getTagIdsByPostId(post.id);
      const tags: Tag[] = [];
      
      if (tagIds.length > 0) {
        const allTags = await getAllTags();
        tagIds.forEach(tagId => {
          const tag = allTags.find(t => t.id === tagId);
          if (tag) {
            tags.push(tag);
          }
        });
      }

      // 获取作者信息
      let author: Admin | undefined = undefined;
      if (post.author_id) {
        const authorData = await findAdminById(post.author_id);
        author = authorData ? {
          ...authorData,
          display_name: authorData.display_name || undefined,
          bio: authorData.bio || undefined,
          avatar: authorData.avatar || undefined,
          created_at: authorData.created_at || '',
          updated_at: authorData.updated_at || '',
          is_active: Boolean(authorData.is_active),
          last_login: authorData.last_login || undefined
        } : undefined;
      }

      // 获取分类信息
      let category: Category | undefined = undefined;
      if (post.category_id) {
        const categoryData = await findCategoryById(post.category_id);
        category = categoryData ? {
          ...categoryData,
          description: categoryData.description || undefined,
          created_at: categoryData.created_at || '',
          updated_at: categoryData.updated_at || '',
          post_count: categoryData.post_count || 0
        } : undefined;
      }

      result.push({
        id: post.id,
        slug: post.slug,
        title: post.title,
        description: post.description || '',
        is_published: Boolean(post.is_published),
        is_featured: Boolean(post.is_featured),
        view_count: post.view_count || 0,
        like_count: post.like_count || 0,
        comment_count: post.comment_count || 0,
        cover_image: post.cover_image || '',
        category_id: post.category_id || undefined,
        author_id: post.author_id || undefined,
        published_at: post.published_at || '',
        allow_comments: Boolean(post.allow_comments),
        created_at: post.created_at || '',
        updated_at: post.updated_at || '',
        tags,
        author,
        category
      });
    }
    
    return result;
  } catch (error) {
    console.error('Error fetching posts by tag:', error);
    return [];
  }
}

export async function getAllTags(): Promise<Tag[]> {
  try {
    const tags = await getTagsFromDB();
    
    return tags.map(tag => ({
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
      post_count: tag.post_count || 0,
      created_at: tag.created_at || '',
      updated_at: tag.updated_at || ''
    }));
  } catch (error) {
    console.error('Error fetching tags:', error);
    return [];
  }
}

export async function getAllCategories(): Promise<Category[]> {
  try {
    const categories = await getCategoriesFromDB();
    
    return categories.map(category => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      post_count: category.post_count || 0,
      created_at: category.created_at || '',
      updated_at: category.updated_at || ''
    }));
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

export async function getPostsByCategory(categorySlug: string): Promise<PostMetadata[]> {
  try {
    const posts = await getPostsByCategorySlug(categorySlug);
    const result = [];
    
    for (const post of posts) {
      // 获取文章的标签
      const tagIds = await getTagIdsByPostId(post.id);
      const tags: Tag[] = [];
      
      if (tagIds.length > 0) {
        const allTags = await getAllTags();
        tagIds.forEach(tagId => {
          const tag = allTags.find(t => t.id === tagId);
          if (tag) {
            tags.push(tag);
          }
        });
      }

      // 获取作者信息
      let author: Admin | undefined = undefined;
      if (post.author_id) {
        const authorData = await findAdminById(post.author_id);
        author = authorData ? {
          ...authorData,
          display_name: authorData.display_name || undefined,
          bio: authorData.bio || undefined,
          avatar: authorData.avatar || undefined,
          created_at: authorData.created_at || '',
          updated_at: authorData.updated_at || '',
          is_active: Boolean(authorData.is_active),
          last_login: authorData.last_login || undefined
        } : undefined;
      }

      // 获取分类信息
      let category: Category | undefined = undefined;
      if (post.category_id) {
        const categoryData = await findCategoryById(post.category_id);
        category = categoryData ? {
          ...categoryData,
          description: categoryData.description || undefined,
          created_at: categoryData.created_at || '',
          updated_at: categoryData.updated_at || '',
          post_count: categoryData.post_count || 0
        } : undefined;
      }

      result.push({
        id: post.id,
        slug: post.slug,
        title: post.title,
        description: post.description || '',
        is_published: Boolean(post.is_published),
        is_featured: Boolean(post.is_featured),
        view_count: post.view_count || 0,
        like_count: post.like_count || 0,
        comment_count: post.comment_count || 0,
        cover_image: post.cover_image || '',
        category_id: post.category_id || undefined,
        author_id: post.author_id || undefined,
        published_at: post.published_at || '',
        allow_comments: Boolean(post.allow_comments),
        created_at: post.created_at || '',
        updated_at: post.updated_at || '',
        tags,
        author,
        category
      });
    }
    
    return result;
  } catch (error) {
    console.error('Error fetching posts by category:', error);
    return [];
  }
}

export async function createPost(data: CreatePostData): Promise<BlogPost | null> {
  try {
    const slug = await generateUniquePostSlug(data.title);
    
    const postData = await createPostData({
      title: data.title,
      slug,
      content: data.content || '',
      description: data.description,
      is_published: data.is_published || false,
      is_featured: data.is_featured || false,
      cover_image: data.cover_image,
      category_id: data.category_id,
      author_id: data.author_id,
      allow_comments: data.allow_comments !== false
    });

    if (!postData) return null;

    return await getPostBySlug(slug);
  } catch (error) {
    console.error('Error creating post:', error);
    return null;
  }
}

export function formatDate(dateString: string): string {
  // 处理从数据库返回的SQL函数字符串
  if (!dateString || dateString === "datetime('now')" || dateString.trim() === '') {
    return format(new Date(), 'yyyy年MM月dd日');
  }
  
  const date = new Date(dateString);
  
  // 检查日期是否有效
  if (isNaN(date.getTime())) {
    console.warn('Invalid date string:', dateString);
    return format(new Date(), 'yyyy年MM月dd日');
  }
  
  return format(date, 'yyyy年MM月dd日');
}

export function generateSlug(title: string): string {
  return title.toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .trim();
}
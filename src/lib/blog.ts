import { format } from 'date-fns';
import { BlogPost, PostMetadata, Tag, Category, CreatePostData, Admin } from './types';
import { getPublishedPosts, findPostBySlug, incrementPostViewCount, generateUniquePostSlug, createPost as createPostData, getPostsByCategorySlug, getPostsByTagSlug, type Post as DBPost } from '@/models/PostModel';
import { getAllTags as getTagsFromDB } from '@/models/TagModel';
import { getAllCategories as getCategoriesFromDB, findCategoryById, findCategoriesByIds } from '@/models/CategoryModel';
import { getTagIdsByPostId, addTagsToPost, removeAllTagsFromPost, getTagIdsByPostIds } from '@/models/PostTagModel';
import { findAdminById, findAdminsByIds } from '@/models/AdminModel';
import { getKVCache, CacheKeys } from '@/lib/kvCache';

async function mapPostsToMetadataBatch(posts: DBPost[]): Promise<PostMetadata[]> {
  if (!posts || posts.length === 0) return [];

  const postIds = posts.map(p => p.id);
  const authorIds = Array.from(new Set(posts.map(p => p.author_id).filter((v): v is number => typeof v === 'number')));
  const categoryIds = Array.from(new Set(posts.map(p => p.category_id).filter((v): v is number => typeof v === 'number')));

  const [tagIdMap, allTags, admins, categories] = await Promise.all([
    getTagIdsByPostIds(postIds),
    getAllTags(),
    authorIds.length ? findAdminsByIds(authorIds) : Promise.resolve([]),
    categoryIds.length ? findCategoriesByIds(categoryIds) : Promise.resolve([]),
  ]);

  const tagMap = new Map<number, Tag>();
  allTags.forEach(t => tagMap.set(t.id, t));

  const authorMap = new Map<number, Admin>();
  admins.forEach(a => authorMap.set(a.id, {
    id: a.id,
    username: a.username,
    email: a.email,
    display_name: a.display_name || undefined,
    bio: a.bio || undefined,
    avatar: a.avatar || undefined,
    is_active: Boolean((a as any).is_active),
    last_login: a.last_login || undefined,
    created_at: a.created_at || '',
    updated_at: a.updated_at || '',
  }));

  const categoryMap = new Map<number, Category>();
  categories.forEach(c => categoryMap.set(c.id, {
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description || undefined,
    post_count: c.post_count || 0,
    created_at: c.created_at || '',
    updated_at: c.updated_at || '',
  }));

  return posts.map(post => {
    const tags: Tag[] = (tagIdMap[post.id] || [])
      .map(id => tagMap.get(id))
      .filter(Boolean) as Tag[];
    const author = post.author_id ? authorMap.get(post.author_id) : undefined;
    const category = post.category_id ? categoryMap.get(post.category_id) : undefined;
    return {
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
      category,
    } as PostMetadata;
  });
}

export async function getAllPosts(): Promise<PostMetadata[]> {
  try {
    const kv = await getKVCache();
    if (kv) {
      const cached = await kv.get<PostMetadata[]>(CacheKeys.POSTS_ALL);
      if (cached) return cached;
    }
    const list = await getPublishedPosts();
    const mapped = await mapPostsToMetadataBatch(list as unknown as DBPost[]);
    if (kv) {
      await kv.set(CacheKeys.POSTS_ALL, mapped);
    }
    return mapped;
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
}

export async function getPostBySlug(slug: string, incrementView = false): Promise<BlogPost | null> {
  try {
    const kv = await getKVCache();
    if (kv) {
      const cached = await kv.get<BlogPost>(CacheKeys.POST_BY_SLUG(slug));
      if (cached) {
        if (incrementView) {
          await incrementPostViewCount(slug);
          const bumped = { ...cached, view_count: (cached.view_count || 0) + 1 } as BlogPost;
          await kv.set(CacheKeys.POST_BY_SLUG(slug), bumped);
          return bumped;
        }
        return cached;
      }
    }
    const post = await findPostBySlug(slug);
    
    if (!post || !post.is_published) {
      return null;
    }

    // 濡傛灉闇€瑕佸鍔犳祻瑙堥噺锛屽垯璋冪敤澧炲姞娴忚閲忕殑鏂规硶
    if (incrementView) {
      await incrementPostViewCount(slug);
    }

    // 鑾峰彇鏂囩珷鐨勬爣绛?
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

    // 鑾峰彇浣滆€呬俊鎭?
    let author: Admin | undefined = undefined;
    if (post.author_id) {
      const authorData = await findAdminById(post.author_id as number);
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

    // 鑾峰彇鍒嗙被淇℃伅
    let category: Category | undefined = undefined;
    if (post.category_id) {
      const categoryData = await findCategoryById(post.category_id as number);
      category = categoryData ? {
        ...categoryData,
        description: categoryData.description || undefined,
        created_at: categoryData.created_at || '',
        updated_at: categoryData.updated_at || '',
        post_count: categoryData.post_count || 0
      } : undefined;
    }

    const fullPost: BlogPost = {
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
    if (kv) {
      await kv.set(CacheKeys.POST_BY_SLUG(slug), fullPost);
    }
    return fullPost;
  } catch (error) {
    console.error(`Error fetching post ${slug}:`, error);
    return null;
  }
}

export async function getPostsByTag(tagSlug: string): Promise<PostMetadata[]> {
  try {
    const posts = await getPostsByTagSlug(tagSlug);
    return await mapPostsToMetadataBatch(posts as unknown as DBPost[]);
    /* legacy N+1 implementation (commented out)
    
    for (const post of posts) {
      // 鑾峰彇鏂囩珷鐨勬爣绛?
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

      // 鑾峰彇浣滆€呬俊鎭?
      let author: Admin | undefined = undefined;
      if (post.author_id) {
        const authorData = await findAdminById(post.author_id as number);
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

      // 鑾峰彇鍒嗙被淇℃伅
      let category: Category | undefined = undefined;
      if (post.category_id) {
        const categoryData = await findCategoryById(post.category_id as number);
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
    
    */ return [] as PostMetadata[];
  } catch (error) {
    console.error('Error fetching posts by tag:', error);
    return [];
  }
}

export async function getAllTags(): Promise<Tag[]> {
  try {
    const kv = await getKVCache();
    if (kv) {
      const cached = await kv.get<Tag[]>(CacheKeys.TAGS);
      if (cached) return cached;
    }

    const rows = await getTagsFromDB();
    const mapped = rows.map(tag => ({
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
      description: tag.description || undefined,
      post_count: tag.post_count || 0,
      created_at: tag.created_at || '',
      updated_at: tag.updated_at || ''
    }));

    if (kv) {
      await kv.set(CacheKeys.TAGS, mapped);
    }

    return mapped;
  } catch (error) {
    console.error('Error fetching tags:', error);
    return [];
  }
}

export async function getAllCategories(): Promise<Category[]> {
  try {
  const kv = await getKVCache();
    if (kv) {
      const cached = await kv.get<Category[]>(CacheKeys.CATEGORIES);
      if (cached) return cached;
    }

    const rows = await getCategoriesFromDB();
    const mapped = rows.map(category => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description || undefined,
      post_count: category.post_count || 0,
      created_at: category.created_at || '',
      updated_at: category.updated_at || ''
    }));

    if (kv) {
      await kv.set(CacheKeys.CATEGORIES, mapped);
    }

    return mapped;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

export interface PostsPageResult {
  items: PostMetadata[];
  total: number;
  totalPages: number;
  years: number[];
  archiveStats: { year: number; count: number }[];
}

function buildPostsQueryKey(params: {
  page: number; perPage: number; category?: string; tag?: string; year?: string; search?: string;
}): string {
  const page = params.page || 1;
  const perPage = params.perPage || 10;
  const category = params.category || 'all';
  const tag = params.tag || 'all';
  const year = params.year || 'all';
  const search = params.search ? encodeURIComponent(params.search) : 'none';
  return `posts:q:${page}:${perPage}:${category}:${tag}:${year}:${search}`;
}

export async function getPaginatedPosts(params: {
  page: number;
  perPage: number;
  category?: string;
  tag?: string;
  year?: string;
  search?: string;
}): Promise<PostsPageResult> {
  const kv = await getKVCache();
  const key = buildPostsQueryKey(params);
  if (kv) {
    const cached = await kv.get<PostsPageResult>(key);
    if (cached) return cached;
  }

  const allPosts = await getAllPosts();

  // Derive years and archive stats from all posts (unfiltered), same as previous UI
  const years = Array.from(new Set(allPosts.map(p => new Date(p.created_at).getFullYear()))).sort((a, b) => b - a);
  const archiveStats = years.map(year => ({
    year,
    count: allPosts.filter(p => new Date(p.created_at).getFullYear() === year).length,
  }));

  // Apply filters
  const searchLower = (params.search || '').toLowerCase();
  let filtered = allPosts.filter(post => {
    if (searchLower) {
      const t = post.title.toLowerCase();
      const d = (post.description || '').toLowerCase();
      if (!t.includes(searchLower) && !d.includes(searchLower)) return false;
    }
    if (params.category && post.category?.slug !== params.category) return false;
    if (params.tag && !post.tags?.some(t => t.slug === params.tag)) return false;
    if (params.year) {
      const y = new Date(post.created_at).getFullYear().toString();
      if (y !== params.year) return false;
    }
    return true;
  });

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / params.perPage));
  const page = Math.min(Math.max(1, params.page), totalPages);
  const offset = (page - 1) * params.perPage;
  const items = filtered.slice(offset, offset + params.perPage);

  const result: PostsPageResult = { items, total, totalPages, years, archiveStats };
  if (kv) {
    await kv.set(key, result);
  }
  return result;
}

export async function getPostsByCategory(categorySlug: string): Promise<PostMetadata[]> {
  try {
    const posts = await getPostsByCategorySlug(categorySlug);
    return await mapPostsToMetadataBatch(posts as unknown as DBPost[]);
    /* legacy N+1 implementation (commented out)
    
    for (const post of posts) {
      // 鑾峰彇鏂囩珷鐨勬爣绛?
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

      // 鑾峰彇浣滆€呬俊鎭?
      let author: Admin | undefined = undefined;
      if (post.author_id) {
        const authorData = await findAdminById(post.author_id as number);
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

      // 鑾峰彇鍒嗙被淇℃伅
      let category: Category | undefined = undefined;
      if (post.category_id) {
        const categoryData = await findCategoryById(post.category_id as number);
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
    
    */ return [] as PostMetadata[];
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
  if (!dateString || dateString === "datetime('now')" || dateString.trim() === '') {
    return format(new Date(), 'yyyy-MM-dd');
  }
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    console.warn('Invalid date string:', dateString);
    return format(new Date(), 'yyyy-MM-dd');
  }
  return format(date, 'yyyy-MM-dd');
}export function generateSlug(title: string): string {
  return title.toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .trim();
}

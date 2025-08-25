export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  post_count: number;
  created_at: string;
  updated_at: string;
}

export interface BlogPost {
  id: number;
  slug: string;
  title: string;
  description?: string;
  content: string; // 富文本HTML内容
  is_published: boolean;
  is_featured: boolean;
  view_count: number;
  like_count: number;
  comment_count: number;
  cover_image?: string;
  category_id?: number;
  author_id?: number;
  published_at?: string;
  allow_comments: boolean;
  created_at: string;
  updated_at: string;
  category?: Category;
  author?: Admin;
  tags?: Tag[];
}

export interface PostMetadata {
  id: number;
  slug: string;
  title: string;
  description?: string;
  is_published: boolean;
  is_featured: boolean;
  view_count: number;
  like_count: number;
  comment_count: number;
  cover_image?: string;
  category_id?: number;
  author_id?: number;
  published_at?: string;
  allow_comments: boolean;
  created_at: string;
  updated_at: string;
  category?: Category;
  author?: Admin;
  tags: Tag[];
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
  description?: string;
  post_count: number;
  created_at: string;
  updated_at: string;
}

export interface PostTag {
  post_id: number;
  tag_id: number;
  created_at: string;
}

export interface Admin {
  id: number;
  username: string;
  email: string;
  display_name?: string;
  bio?: string;
  avatar?: string;
  is_active: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface Page {
  id: number;
  slug: string;
  title: string;
  content: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreatePostData {
  slug: string;
  title: string;
  description?: string;
  content?: string; // 富文本HTML内容
  is_published?: boolean;
  is_featured?: boolean;
  cover_image?: string;
  category_id?: number;
  author_id?: number;
  allow_comments?: boolean;
  tag_ids?: number[];
}
import {
  integer,
  sqliteTable,
  text,
  uniqueIndex,
  index,
  real,
  primaryKey,
} from "drizzle-orm/sqlite-core";

// 分类表
export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  post_count: integer('post_count').default(0), // 缓存文章数量
  created_at: text('created_at'),
  updated_at: text('updated_at'),
}, (table) => ({
  slugIdx: uniqueIndex('categories_slug_idx').on(table.slug)
}));

// 标签表
export const tags = sqliteTable('tags', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  post_count: integer('post_count').default(0), // 缓存文章数量
  created_at: text('created_at'),
  updated_at: text('updated_at'),
}, (table) => ({
  slugIdx: uniqueIndex('tags_slug_idx').on(table.slug)
}));

// 管理员表
export const admins = sqliteTable('admins', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  password_hash: text('password_hash').notNull(),
  display_name: text('display_name'),
  bio: text('bio'),
  avatar: text('avatar'),
  is_active: integer('is_active', { mode: 'boolean' }).default(true),
  last_login: text('last_login'),
  created_at: text('created_at'),
  updated_at: text('updated_at'),
}, (table) => ({
  emailIdx: uniqueIndex('admins_email_idx').on(table.email)
}));

// 文章表
export const posts = sqliteTable('posts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  content: text('content').notNull(), // 富文本HTML内容
  description: text('description'),
  is_published: integer('is_published', { mode: 'boolean' }).default(false),
  is_featured: integer('is_featured', { mode: 'boolean' }).default(false),
  view_count: integer('view_count').default(0),
  like_count: integer('like_count').default(0),
  comment_count: integer('comment_count').default(0),
  cover_image: text('cover_image'),
  category_id: integer('category_id').references(() => categories.id, { onDelete: 'set null' }),
  author_id: integer('author_id').references(() => admins.id, { onDelete: 'set null' }),
  published_at: text('published_at'),
  allow_comments: integer('allow_comments', { mode: 'boolean' }).default(true),
  created_at: text('created_at').notNull(),
  updated_at: text('updated_at').notNull(),
}, (table) => ({
  slugIdx: uniqueIndex('posts_slug_idx').on(table.slug),
  publishedIdx: index('posts_published_idx').on(table.is_published),
  featuredIdx: index('posts_featured_idx').on(table.is_featured),
  publishedAtIdx: index('posts_published_at_idx').on(table.published_at),
  // 复合索引用于常见查询
  publishedCategoryIdx: index('posts_published_category_idx').on(table.is_published, table.category_id),
  publishedAuthorIdx: index('posts_published_author_idx').on(table.is_published, table.author_id),
  publishedFeaturedIdx: index('posts_published_featured_idx').on(table.is_published, table.is_featured),
  publishedDateIdx: index('posts_published_date_idx').on(table.is_published, table.published_at),
}));

// 文章标签关联表
export const post_tags = sqliteTable('post_tags', {
  post_id: integer('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  tag_id: integer('tag_id').notNull().references(() => tags.id, { onDelete: 'cascade' }),
  created_at: text('created_at').notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.post_id, table.tag_id] })
}));

// 评论表
export const comments: any = sqliteTable('comments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  post_id: integer('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  parent_id: integer('parent_id').references(() => comments.id, { onDelete: 'cascade' }),
  author_name: text('author_name').notNull(),
  author_email: text('author_email').notNull(),
  author_website: text('author_website'),
  author_ip: text('author_ip'),
  user_agent: text('user_agent'),
  content: text('content').notNull(),
  is_approved: integer('is_approved', { mode: 'boolean' }).default(false),
  reply_count: integer('reply_count').default(0), // 回复数量缓存
  created_at: text('created_at').notNull(),
  updated_at: text('updated_at').notNull(),
}, (table) => ({
  // 复合索引用于评论列表查询
  postApprovedIdx: index('comments_post_approved_idx').on(table.post_id, table.is_approved),
  postCreatedIdx: index('comments_post_created_idx').on(table.post_id, table.created_at),
}));

// 页面表
export const pages = sqliteTable('pages', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  content: text('content').notNull(), // 富文本HTML内容
  meta_title: text('meta_title'),
  meta_description: text('meta_description'),
  meta_keywords: text('meta_keywords'),
  is_published: integer('is_published', { mode: 'boolean' }).default(false),
  created_at: text('created_at').notNull(),
  updated_at: text('updated_at').notNull(),
}, (table) => ({
  slugIdx: uniqueIndex('pages_slug_idx').on(table.slug),
  publishedIdx: index('pages_published_idx').on(table.is_published),
}));

// 站点设置表
export const site_settings = sqliteTable('site_settings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  site_name: text('site_name'),
  site_title: text('site_title'),
  site_description: text('site_description'),
  site_email: text('site_email'),
  site_url: text('site_url'),
  posts_per_page: integer('posts_per_page'),
  introduction: text('introduction'),
  site_footer: text('site_footer'),
});

// 菜单表
export const menus: any = sqliteTable('menus', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  url: text('url').notNull(),
  target: text('target').default('_self'), // '_self', '_blank'
  icon: text('icon'),
  description: text('description'),
  parent_id: integer('parent_id').references(() => menus.id, { onDelete: 'cascade' }),
  menu_order: integer('menu_order').default(0),
  is_active: integer('is_active', { mode: 'boolean' }).default(true),
  level: integer('level').default(0), // 菜单层级
  path: text('path'), // 层级路径，如 "1.2.3"
  created_at: text('created_at').notNull(),
  updated_at: text('updated_at').notNull(),
}, (table) => ({
  parentIdx: index('menus_parent_idx').on(table.parent_id),
  menuOrderIdx: index('menus_menu_order_idx').on(table.menu_order),
  isActiveIdx: index('menus_is_active_idx').on(table.is_active),
  levelIdx: index('menus_level_idx').on(table.level),
  pathIdx: index('menus_path_idx').on(table.path),
  // 复合索引用于菜单树查询
  activeParentIdx: index('menus_active_parent_idx').on(table.is_active, table.parent_id, table.menu_order),
}));
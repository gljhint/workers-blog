CREATE TABLE `admins` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`username` text NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`display_name` text,
	`bio` text,
	`avatar` text,
	`is_active` integer DEFAULT true,
	`last_login` text,
	`created_at` text,
	`updated_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `admins_username_unique` ON `admins` (`username`);--> statement-breakpoint
CREATE UNIQUE INDEX `admins_email_unique` ON `admins` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `admins_email_idx` ON `admins` (`email`);--> statement-breakpoint
CREATE TABLE `categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`description` text,
	`post_count` integer DEFAULT 0,
	`created_at` text,
	`updated_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `categories_slug_unique` ON `categories` (`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `categories_slug_idx` ON `categories` (`slug`);--> statement-breakpoint
CREATE TABLE `comments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`post_id` integer NOT NULL,
	`parent_id` integer,
	`author_name` text NOT NULL,
	`author_email` text NOT NULL,
	`author_website` text,
	`author_ip` text,
	`user_agent` text,
	`content` text NOT NULL,
	`is_approved` integer DEFAULT false,
	`reply_count` integer DEFAULT 0,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`parent_id`) REFERENCES `comments`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `comments_post_approved_idx` ON `comments` (`post_id`,`is_approved`);--> statement-breakpoint
CREATE INDEX `comments_post_created_idx` ON `comments` (`post_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `menus` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`url` text NOT NULL,
	`target` text DEFAULT '_self',
	`icon` text,
	`description` text,
	`parent_id` integer,
	`menu_order` integer DEFAULT 0,
	`is_active` integer DEFAULT true,
	`level` integer DEFAULT 0,
	`path` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`parent_id`) REFERENCES `menus`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `menus_parent_idx` ON `menus` (`parent_id`);--> statement-breakpoint
CREATE INDEX `menus_menu_order_idx` ON `menus` (`menu_order`);--> statement-breakpoint
CREATE INDEX `menus_is_active_idx` ON `menus` (`is_active`);--> statement-breakpoint
CREATE INDEX `menus_level_idx` ON `menus` (`level`);--> statement-breakpoint
CREATE INDEX `menus_path_idx` ON `menus` (`path`);--> statement-breakpoint
CREATE INDEX `menus_active_parent_idx` ON `menus` (`is_active`,`parent_id`,`menu_order`);--> statement-breakpoint
CREATE TABLE `pages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`content` text NOT NULL,
	`meta_title` text,
	`meta_description` text,
	`meta_keywords` text,
	`is_published` integer DEFAULT false,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `pages_slug_unique` ON `pages` (`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `pages_slug_idx` ON `pages` (`slug`);--> statement-breakpoint
CREATE INDEX `pages_published_idx` ON `pages` (`is_published`);--> statement-breakpoint
CREATE TABLE `post_tags` (
	`post_id` integer NOT NULL,
	`tag_id` integer NOT NULL,
	`created_at` text NOT NULL,
	PRIMARY KEY(`post_id`, `tag_id`),
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `posts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`content` text NOT NULL,
	`description` text,
	`is_published` integer DEFAULT false,
	`is_featured` integer DEFAULT false,
	`view_count` integer DEFAULT 0,
	`like_count` integer DEFAULT 0,
	`comment_count` integer DEFAULT 0,
	`cover_image` text,
	`category_id` integer,
	`author_id` integer,
	`published_at` text,
	`allow_comments` integer DEFAULT true,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`author_id`) REFERENCES `admins`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `posts_slug_unique` ON `posts` (`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `posts_slug_idx` ON `posts` (`slug`);--> statement-breakpoint
CREATE INDEX `posts_published_idx` ON `posts` (`is_published`);--> statement-breakpoint
CREATE INDEX `posts_featured_idx` ON `posts` (`is_featured`);--> statement-breakpoint
CREATE INDEX `posts_published_at_idx` ON `posts` (`published_at`);--> statement-breakpoint
CREATE INDEX `posts_published_category_idx` ON `posts` (`is_published`,`category_id`);--> statement-breakpoint
CREATE INDEX `posts_published_author_idx` ON `posts` (`is_published`,`author_id`);--> statement-breakpoint
CREATE INDEX `posts_published_featured_idx` ON `posts` (`is_published`,`is_featured`);--> statement-breakpoint
CREATE INDEX `posts_published_date_idx` ON `posts` (`is_published`,`published_at`);--> statement-breakpoint
CREATE TABLE `site_settings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`site_name` text,
	`site_title` text,
	`site_description` text,
	`site_email` text,
	`site_url` text,
	`posts_per_page` integer,
	`introduction` text,
	`site_footer` text
);
--> statement-breakpoint
CREATE TABLE `tags` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`description` text,
	`post_count` integer DEFAULT 0,
	`created_at` text,
	`updated_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tags_name_unique` ON `tags` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `tags_slug_unique` ON `tags` (`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `tags_slug_idx` ON `tags` (`slug`);
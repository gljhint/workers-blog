import { MetadataRoute } from 'next';
import { getAllPosts, getAllTags } from '@/lib/blog';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://my-blog.pages.dev';
  
  // 获取所有文章和标签
  const posts = await getAllPosts();
  const tags = await getAllTags();
  
  // 静态页面
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/posts`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/tags`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    },
  ];
  
  // 文章页面
  const postPages = posts.map((post) => ({
    url: `${baseUrl}/posts/${post.slug}`,
    lastModified: new Date(post.published_at || post.created_at),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));
  
  // 标签页面
  const tagPages = tags.map((tag) => ({
    url: `${baseUrl}/tags/${tag.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.5,
  }));
  
  return [...staticPages, ...postPages, ...tagPages];
}
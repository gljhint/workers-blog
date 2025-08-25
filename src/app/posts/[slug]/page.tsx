import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getPostBySlug, getAllPosts } from '@/lib/blog';
import { formatDate } from '@/lib/blog';
import { SiteSettingsService } from '@/services/SiteSettingsService';
import Comments from '@/components/Comments';
import TableOfContents from '@/components/TableOfContents';
import RelatedPosts from '@/components/RelatedPosts';
import '@/components/editor/style.css';

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  const siteSettingsService = SiteSettingsService.getInstance();
  const siteSettings = await siteSettingsService.getAllSettings();
  
  if (!post) {
    return {
      title: `文章未找到 - ${siteSettings.site_title}`,
    };
  }

  return {
    title: `${post.title} - ${siteSettings.site_title}`,
    description: post.description,
    authors: post.author ? [{ name: post.author.display_name || post.author.username }] : undefined,
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.published_at || post.created_at,
      authors: post.author ? [post.author.display_name || post.author.username] : undefined,
      images: post.cover_image ? [post.cover_image] : undefined,
      siteName: siteSettings.site_title,
      url: `${siteSettings.site_url}/posts/${post.slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: post.cover_image ? [post.cover_image] : undefined,
    },
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug, true);
  
  if (!post) {
    notFound();
  }

  const allPosts = await getAllPosts();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
        <nav className="mb-8">
          <Link 
            href="/"
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
          >
            <svg className="mr-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            返回首页
          </Link>
        </nav>

        {/* 两栏布局容器 */}
        <div className="flex flex-col lg:flex-row lg:gap-8">
          {/* 左栏：主要内容 */}
          <main className="flex-1 lg:w-2/3">
            <article className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
              {post.cover_image && (
                <div className="relative h-64 md:h-96 w-full">
                  <Image
                    src={post.cover_image}
                    alt={post.title}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              )}
              
              <div className="p-8">
                <header className="mb-8">
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                    {post.title}
                  </h1>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-6">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <time dateTime={post.published_at || post.created_at}>
                        发布于 {formatDate(post.published_at || post.created_at)}
                      </time>
                    </div>
                    
                    {post.author && (
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>作者: {post.author.display_name || post.author.username}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span>{post.view_count} 次浏览</span>
                    </div>
                  </div>
                  
                  {post.description && (
                    <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                      {post.description}
                    </p>
                  )}
                </header>

                <div 
                  className="tiptap max-w-none"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
              </div>
            </article>

            {/* 标签和分享区域 */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-between items-start">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">标签:</span>
                {post.tags && post.tags.length > 0 ? (
                  post.tags.map((tag) => (
                    <Link
                      key={tag.id}
                      href={`/tags/${tag.slug}`}
                      className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition-all duration-200 hover:scale-105"
                    >
                      {tag.name}
                    </Link>
                  ))
                ) : (
                  <span className="text-sm text-gray-400 dark:text-gray-500">暂无标签</span>
                )}
              </div>
              
              <div className="flex gap-4">
                {/* 分享功能需要在客户端组件中实现 */}
                <span className="text-sm text-gray-500 dark:text-gray-400">分享至:</span>
                <button className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* 评论区 - 根据文章设置决定是否显示 */}
            {post.allow_comments && <Comments postId={post.id} enabled={true} />}
          </main>

          {/* 右栏：侧边栏 */}
          <aside className="w-full lg:w-1/3 mt-8 lg:mt-0">
            <div className="space-y-6">
              {/* 目录导航 */}
              <TableOfContents content={post.content} />
              
              {/* 相关文章推荐 */}
              <RelatedPosts posts={allPosts} currentPostId={post.id} />
            </div>
          </aside>
        </div>
      </div>
  );
}
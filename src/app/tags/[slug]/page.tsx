import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPostsByTag, getAllTags } from '@/lib/blog';
import PostCard from '@/components/PostCard';

interface TagPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const tags = await getAllTags();
  return tags.map((tag) => ({
    slug: tag.slug,
  }));
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const tags = await getAllTags();
  const tag = tags.find(t => t.slug === resolvedParams.slug);
  
  if (!tag) {
    return {
      title: '标签未找到',
    };
  }

  const posts = await getPostsByTag(resolvedParams.slug);

  return {
    title: `${tag.name} - 标签`,
    description: tag.description || `查看所有关于 ${tag.name} 的文章，共 ${posts.length} 篇文章。`,
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/tags/${tag.slug}`,
    },
  };
}

export default async function TagPage({ params }: TagPageProps) {
  const resolvedParams = await params;
  const tags = await getAllTags();
  const tag = tags.find(t => t.slug === resolvedParams.slug);
  
  if (!tag) {
    notFound();
  }

  const posts = await getPostsByTag(resolvedParams.slug);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
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

        <header className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              {tag.name}
            </h1>
          </div>
          
          {tag.description && (
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">
              {tag.description}
            </p>
          )}
          
          <p className="text-lg text-gray-500 dark:text-gray-400">
            共 {posts.length} 篇文章
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <main className="lg:col-span-3">
            <div className="grid gap-6">
              {posts.length > 0 ? (
                posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="max-w-md mx-auto">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                      暂无相关文章
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      还没有标记为"{tag.name}"的文章
                    </p>
                    <div className="mt-6">
                      <Link
                        href="/posts"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800"
                      >
                        浏览所有文章
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </main>

          <aside className="lg:col-span-1">
            <div className="sticky top-8 space-y-8">
              <section>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  相关标签
                </h3>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
                  <div className="flex flex-wrap gap-2">
                    {tags
                      .filter(t => t.slug !== tag.slug)
                      .slice(0, 8)
                      .map((relatedTag) => (
                        <Link
                          key={relatedTag.id}
                          href={`/tags/${relatedTag.slug}`}
                          className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                          {relatedTag.name}
                        </Link>
                      ))}
                  </div>
                  <div className="mt-4">
                    <Link
                      href="/tags"
                      className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                    >
                      查看所有标签 →
                    </Link>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  标签统计
                </h3>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">文章数量:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{posts.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">总浏览量:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {posts.reduce((sum, post) => sum + post.view_count, 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">平均浏览:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {posts.length > 0 ? Math.round(posts.reduce((sum, post) => sum + post.view_count, 0) / posts.length) : 0}
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  快速操作
                </h3>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md space-y-3">
                  <Link
                    href="/posts"
                    className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    浏览所有文章
                  </Link>
                  <Link
                    href="/tags"
                    className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    查看所有标签
                  </Link>
                </div>
              </section>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
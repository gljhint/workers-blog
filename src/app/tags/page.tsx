import { Metadata } from 'next';
import Link from 'next/link';
import { getAllTags, getAllPosts } from '@/lib/blog';

export const metadata: Metadata = {
  title: '所有标签',
  description: '浏览我的博客的所有文章标签，按主题快速找到感兴趣的内容。',
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/tags`,
  },
};

export default async function TagsPage() {
  const tags = await getAllTags();
  const posts = await getAllPosts();

  // 计算每个标签的文章数量
  const tagsWithCount = await Promise.all(
    tags.map(async (tag) => {
      const tagPosts = posts.filter(post => 
        post.tags.some(postTag => postTag.slug === tag.slug)
      );
      return {
        ...tag,
        postCount: tagPosts.length,
        totalViews: tagPosts.reduce((sum, post) => sum + post.view_count, 0)
      };
    })
  );

  // 按文章数量排序
  const sortedTags = tagsWithCount.sort((a, b) => b.postCount - a.postCount);

  // 获取最热门的标签
  const popularTags = tagsWithCount
    .sort((a, b) => b.totalViews - a.totalViews)
    .slice(0, 5);

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
            <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              所有标签
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            共 {tags.length} 个标签，按主题浏览文章
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <main className="lg:col-span-3">
            {sortedTags.length > 0 ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sortedTags.map((tag) => (
                    <Link
                      key={tag.id}
                      href={`/tags/${tag.slug}`}
                      className="group bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {tag.name}
                        </h3>
                        <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          {tag.postCount}
                        </div>
                      </div>
                      
                      {tag.description && (
                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
                          {tag.description || ''}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>{tag.postCount} 篇文章</span>
                        <span>{tag.totalViews} 次浏览</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="max-w-md mx-auto">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">暂无标签</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    还没有创建任何标签
                  </p>
                </div>
              </div>
            )}
          </main>

          <aside className="lg:col-span-1">
            <div className="sticky top-8 space-y-8">
              {popularTags.length > 0 && (
                <section>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                    热门标签
                  </h3>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
                    <div className="space-y-3">
                      {popularTags.map((tag, index) => (
                        <Link
                          key={tag.id}
                          href={`/tags/${tag.slug}`}
                          className="flex items-center justify-between hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 w-4">
                              #{index + 1}
                            </span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {tag.name}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {tag.totalViews} 浏览
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </section>
              )}

              <section>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  标签统计
                </h3>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">标签总数:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{tags.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">文章总数:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{posts.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">平均标签/文章:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {posts.length > 0 ? (posts.reduce((sum, post) => sum + post.tags.length, 0) / posts.length).toFixed(1) : 0}
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  标签云
                </h3>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
                  <div className="flex flex-wrap gap-2">
                    {sortedTags.map((tag) => {
                      const size = Math.max(12, Math.min(20, 12 + (tag.postCount * 2)));
                      return (
                        <Link
                          key={tag.id}
                          href={`/tags/${tag.slug}`}
                          className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          style={{ fontSize: `${size}px` }}
                        >
                          {tag.name}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </section>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
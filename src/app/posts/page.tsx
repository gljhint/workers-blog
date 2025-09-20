import { Metadata } from 'next';
import Link from 'next/link';
import { getPaginatedPosts, getAllTags, getAllCategories } from '@/lib/blog';
import PostCard from '@/components/PostCard';
import SearchAndFilter from '@/components/SearchAndFilter';
import { SiteSettingsService } from '@/services/SiteSettingsService';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const siteSettingsService = SiteSettingsService.getInstance();
  const siteSettings = await siteSettingsService.getAllSettings();
  
  return {
    title: `所有文章 - ${siteSettings.site_title}`,
    description: `浏览我的所有博客文章，包含信仰分享、学习笔记和生活感悟。`,
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/posts`,
    },
  };
}

interface PostsPageProps {
  searchParams: Promise<{ 
    page?: string;
    search?: string;
    category?: string;
    tag?: string;
    year?: string;
  }>;
}

export default async function PostsPage({ searchParams }: PostsPageProps) {
  const siteSettingsService = SiteSettingsService.getInstance();
  const postsPerPage = await siteSettingsService.getPostsPerPage();
  
  const params = await searchParams;
  const currentPage = parseInt(params.page || '1', 10);
  const searchQuery = params.search || '';
  const categoryFilter = params.category || '';
  const tagFilter = params.tag || '';
  const yearFilter = params.year || '';
  
  // 使用缓存的分页功能获取数据
  const [paginatedResult, tags, categories] = await Promise.all([
    getPaginatedPosts({
      page: currentPage,
      perPage: postsPerPage,
      category: categoryFilter || undefined,
      tag: tagFilter || undefined,
      year: yearFilter || undefined,
      search: searchQuery || undefined
    }),
    getAllTags(),
    getAllCategories()
  ]);

  const { items: posts, total: totalPosts, totalPages, years, archiveStats } = paginatedResult;

  // 构建查询参数
  const buildQueryString = (params: Record<string, string>) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) query.set(key, value);
    });
    return query.toString();
  };

  const currentFilters = {
    search: searchQuery,
    category: categoryFilter,
    tag: tagFilter,
    year: yearFilter
  };

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

      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          所有文章
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          {totalPosts > 0 ? (
            <>共 {totalPosts} 篇文章，探索技术与思考的旅程</>
          ) : (
            <>暂无符合条件的文章</>
          )}
        </p>
      </header>

      {/* 搜索和筛选组件 */}
      <SearchAndFilter 
        categories={categories}
        tags={tags}
        years={years}
        currentFilters={currentFilters}
      />

      {/* 当前筛选条件显示 */}
      {(searchQuery || categoryFilter || tagFilter || yearFilter) && (
        <div className="mb-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                当前筛选:
              </span>
              {searchQuery && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200">
                  搜索: {searchQuery}
                </span>
              )}
              {categoryFilter && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200">
                  分类: {categories.find(c => c.slug === categoryFilter)?.name}
                </span>
              )}
              {tagFilter && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-200">
                  标签: {tags.find(t => t.slug === tagFilter)?.name}
                </span>
              )}
              {yearFilter && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-200">
                  年份: {yearFilter}
                </span>
              )}
            </div>
            <Link 
              href="/posts"
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
            >
              清除筛选
            </Link>
          </div>
        </div>
      )}

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
                    {searchQuery || categoryFilter || tagFilter || yearFilter ? '没有找到符合条件的文章' : '暂无文章'}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {searchQuery || categoryFilter || tagFilter || yearFilter ? 
                      '尝试调整筛选条件或清除所有筛选' : 
                      '还没有发布任何文章，敬请期待...'
                    }
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* 分页功能 */}
          {totalPages > 1 && (
            <div className="mt-12">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  显示第 {(currentPage - 1) * postsPerPage + 1} 到 {Math.min(currentPage * postsPerPage, totalPosts)} 项，共 {totalPosts} 项
                </p>
                <nav className="flex space-x-2">
                  {currentPage > 1 && (
                    <Link
                      href={`/posts?${buildQueryString({...currentFilters, page: (currentPage - 1).toString()})}`}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                    >
                      上一页
                    </Link>
                  )}
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => {
                      return page === 1 || 
                             page === totalPages || 
                             (page >= currentPage - 2 && page <= currentPage + 2);
                    })
                    .map((page, index, array) => {
                      const prevPage = index > 0 ? array[index - 1] : 0;
                      const showEllipsis = page - prevPage > 1;
                      
                      return (
                        <div key={page} className="flex items-center space-x-2">
                          {showEllipsis && (
                            <span className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                              ...
                            </span>
                          )}
                          <Link
                            href={`/posts?${buildQueryString({...currentFilters, page: page.toString()})}`}
                            className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                              page === currentPage
                                ? 'text-white bg-blue-600 border border-transparent hover:bg-blue-700'
                                : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
                            }`}
                          >
                            {page}
                          </Link>
                        </div>
                      );
                    })
                  }
                  
                  {currentPage < totalPages && (
                    <Link
                      href={`/posts?${buildQueryString({...currentFilters, page: (currentPage + 1).toString()})}`}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                    >
                      下一页
                    </Link>
                  )}
                </nav>
              </div>
            </div>
          )}
        </main>

        <aside className="lg:col-span-1">
          <div className="sticky top-8 space-y-8">
            {/* 统计信息 */}
            <section>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                博客统计
              </h3>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">总文章数</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">{totalPosts}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">总分类数</span>
                    <span className="font-bold text-green-600 dark:text-green-400">{categories.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">总标签数</span>
                    <span className="font-bold text-purple-600 dark:text-purple-400">{tags.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">总浏览量</span>
                    <span className="font-bold text-orange-600 dark:text-orange-400">
                      {posts.reduce((sum, post) => sum + post.view_count, 0)}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* 文章分类 */}
            {categories.length > 0 && (
              <section>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  文章分类
                </h3>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
                  <div className="space-y-2">
                    {categories.map((category) => {
                      const count = category.post_count || 0;
                      return (
                        <Link
                          key={category.id}
                          href={`/posts?category=${category.slug}`}
                          className="flex items-center justify-between p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <span className="text-sm text-gray-900 dark:text-white">{category.name}</span>
                          <span className="text-xs bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full">
                            {count}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </section>
            )}

            {/* 热门标签 */}
            {tags.length > 0 && (
              <section>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  热门标签
                </h3>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
                  <div className="flex flex-wrap gap-2">
                    {tags.slice(0, 20).map((tag) => (
                      <Link
                        key={tag.id}
                        href={`/posts?tag=${tag.slug}`}
                        className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        {tag.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* 文章归档 */}
            <section>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                文章归档
              </h3>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
                <div className="space-y-2">
                  {archiveStats.map(({ year, count }) => (
                    <Link
                      key={year}
                      href={`/posts?year=${year}`}
                      className="flex items-center justify-between p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <span className="text-sm text-gray-600 dark:text-gray-400">{year}年</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{count}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </section>

            {/* 热门文章 */}
            <section>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                热门文章
              </h3>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
                <div className="space-y-3">
                  {posts
                    .sort((a, b) => b.view_count - a.view_count)
                    .slice(0, 5)
                    .map((post) => (
                      <Link
                        key={post.id}
                        href={`/posts/${post.slug}`}
                        className="block hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                          {post.title}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {post.view_count} 次浏览
                        </p>
                      </Link>
                    ))}
                </div>
              </div>
            </section>
          </div>
        </aside>
      </div>
    </div>
  );
}

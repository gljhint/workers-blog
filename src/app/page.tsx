import { Metadata } from 'next';
import Link from 'next/link';
import { getAllPosts, getAllTags, getAllCategories } from '@/lib/blog';
import PostCard from '@/components/PostCard';
import { SiteSettingsService } from '@/services/SiteSettingsService';
import { generateCategoryColor } from '@/lib/colors';

export async function generateMetadata(): Promise<Metadata> {
  const siteSettingsService = SiteSettingsService.getInstance();
  const siteSettings = await siteSettingsService.getAllSettings();
  
  return {
    title: siteSettings.site_title,
    description: siteSettings.site_description,
    openGraph: {
      title: siteSettings.site_title,
      description: siteSettings.site_description,
      type: 'website',
      url: siteSettings.site_url,
    },
    twitter: {
      card: 'summary_large_image',
      title: siteSettings.site_title,
      description: siteSettings.site_description,
    },
  };
}

export default async function Home() {
  // 并行获取数据以减少总等待时间
  const [siteSettings, posts, tags, categories] = await Promise.all([
    SiteSettingsService.getInstance().getAllSettings(),
    getAllPosts(),
    getAllTags(),
    getAllCategories()
  ]);
  
  // 首页显示的文章数量使用设置的一半，至少3篇
  const homePostsCount = Math.max(3, Math.floor(siteSettings.posts_per_page / 2));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {siteSettings.site_title}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {siteSettings.site_description}
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <main className="lg:col-span-3">
            <section className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  最新文章
                </h2>
                <Link
                  href="/posts"
                  prefetch={true}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-all duration-200 hover:translate-x-1"
                >
                  查看全部 →
                </Link>
              </div>
              
              <div className="grid gap-6">
                {posts.length > 0 ? (
                  posts.slice(0, homePostsCount).map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500 dark:text-gray-400 text-lg">
                      暂无文章，敬请期待...
                    </p>
                  </div>
                )}
              </div>
            </section>
          </main>

          <aside className="lg:col-span-1">
            <div className="sticky top-8 space-y-8">
              <section>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  关于网站
                </h3>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {siteSettings.introduction}
                  </p>
                  <div className="flex gap-4">
                    <Link
                      href="/pages/about"
                      prefetch={true}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm transition-all duration-200 hover:translate-x-1"
                    >
                      了解更多
                    </Link>
                  </div>
                </div>
              </section>

              {categories.length > 0 && (
                <section>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                    分类
                  </h3>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
                    <div className="space-y-2">
                      {categories.map((category) => (
                        <Link
                          key={category.id}
                          href={`/categories/${category.slug}`}
                          prefetch={true}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                        >
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: generateCategoryColor(category.id) }}
                          ></div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {category.name}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </section>
              )}

              {tags.length > 0 && (
                <section>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                    标签
                  </h3>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <Link
                          key={tag.id}
                          href={`/tags/${tag.slug}`}
                          prefetch={true}
                          className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 hover:scale-105"
                        >
                          {tag.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </section>
              )}

              <section>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  统计信息
                </h3>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">文章总数:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{posts.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">分类数量:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{categories.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">标签数量:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{tags.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">总浏览量:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {posts.reduce((sum, post) => sum + post.view_count, 0)}
                      </span>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </aside>
        </div>
      </div>
  );
}

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPostsByCategory, getAllCategories } from '@/lib/blog';
import PostCard from '@/components/PostCard';
import { generateCategoryColor } from '@/lib/colors';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const categories = await getAllCategories();
  return categories.map((category) => ({
    slug: category.slug,
  }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const categories = await getAllCategories();
  const category = categories.find(c => c.slug === resolvedParams.slug);
  
  if (!category) {
    return {
      title: '分类未找到',
    };
  }

  const posts = await getPostsByCategory(resolvedParams.slug);

  return {
    title: `${category.name} - 分类页面`,
    description: category.description || `查看所有 ${category.name} 分类的文章，共 ${posts.length} 篇文章。`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const resolvedParams = await params;
  const categories = await getAllCategories();
  const category = categories.find(c => c.slug === resolvedParams.slug);
  
  if (!category) {
    notFound();
  }

  const posts = await getPostsByCategory(resolvedParams.slug);
  const categoryColor = generateCategoryColor(category.id);

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
          <div className="inline-flex items-center gap-3 mb-4">
            <div 
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: categoryColor }}
            ></div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              {category.name}
            </h1>
          </div>
          
          {category.description && (
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">
              {category.description}
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
                    <div 
                      className="mx-auto h-12 w-12 rounded-full flex items-center justify-center mb-4"
                      style={{ backgroundColor: categoryColor + '20' }}
                    >
                      <svg 
                        className="h-6 w-6" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                        style={{ color: categoryColor }}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                      暂无相关文章
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      还没有"{category.name}"分类的文章
                    </p>
                    <div className="mt-6">
                      <Link
                        href="/posts"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white hover:opacity-90"
                        style={{ backgroundColor: categoryColor }}
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
                  其他分类
                </h3>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
                  <div className="space-y-3">
                    {categories
                      .filter(c => c.slug !== category.slug)
                      .map((relatedCategory) => (
                        <Link
                          key={relatedCategory.id}
                          href={`/categories/${relatedCategory.slug}`}
                          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                        >
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: generateCategoryColor(relatedCategory.id) }}
                          ></div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {relatedCategory.name}
                          </span>
                        </Link>
                      ))}
                  </div>
                  <div className="mt-4">
                    <Link
                      href="/categories"
                      className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                    >
                      查看所有分类 →
                    </Link>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  分类统计
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
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
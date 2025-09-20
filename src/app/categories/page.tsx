import { Metadata } from 'next';
import Link from 'next/link';
import { getAllCategories } from '@/lib/blog';
import { generateCategoryColor } from '@/lib/colors';

export const metadata: Metadata = {
  title: '文章分类',
  description: '浏览所有文章分类，查找你感兴趣的内容。',
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/categories`,
  },
};

export const dynamic = 'force-dynamic';

export default async function CategoriesPage() {
  const categories = await getAllCategories();

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
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            文章分类
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            浏览所有分类，发现你感兴趣的内容
          </p>
        </header>

        {categories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => {
              const categoryColor = generateCategoryColor(category.id);
              
              return (
                <Link
                  key={category.id}
                  href={`/categories/${category.slug}`}
                  className="group bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: categoryColor }}
                        ></div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {category.name}
                        </h2>
                      </div>
                      <svg 
                        className="w-5 h-5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-all duration-300 group-hover:translate-x-1" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                    
                    {category.description && (
                      <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                        {category.description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {category.post_count} 篇文章
                        </span>
                      </div>
                      
                      <div 
                        className="px-3 py-1 rounded-full text-xs font-medium"
                        style={{ backgroundColor: categoryColor + '20', color: categoryColor }}
                      >
                        查看文章
                      </div>
                    </div>
                  </div>
                  
                  <div 
                    className="h-1 w-full transition-all duration-300 group-hover:h-2"
                    style={{ backgroundColor: categoryColor }}
                  ></div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                暂无分类
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                还没有创建任何文章分类
              </p>
              <Link
                href="/posts"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                浏览所有文章
              </Link>
            </div>
          </div>
        )}

        {/* 统计信息 */}
        {categories.length > 0 && (
          <div className="mt-12 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              分类统计
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {categories.length}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  总分类数
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {categories.reduce((sum, cat) => sum + cat.post_count, 0)}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  总文章数
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {categories.length > 0 ? Math.round(categories.reduce((sum, cat) => sum + cat.post_count, 0) / categories.length) : 0}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  平均文章数
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

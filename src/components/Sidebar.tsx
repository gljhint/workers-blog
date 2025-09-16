import Link from 'next/link';
import { generateCategoryColor } from '@/lib/colors';

interface SidebarProps {
  categories: Array<{id: number; name: string; slug: string}>;
  tags: Array<{id: number; name: string; slug: string}>;
  totalPosts: number;
  totalViews: number;
  introduction: string;
}

export default function Sidebar({ categories, tags, totalPosts, totalViews, introduction }: SidebarProps) {
  return (
    <aside className="lg:col-span-1">
      <div className="sticky top-8 space-y-8">
        <section>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            关于网站
          </h3>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {introduction}
            </p>
            <div className="flex gap-4">
              <Link
                href="/pages/about"
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
                <span className="font-medium text-gray-900 dark:text-white">{totalPosts}</span>
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
                <span className="font-medium text-gray-900 dark:text-white">{totalViews}</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </aside>
  );
}
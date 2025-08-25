'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Tag {
  id: number;
  name: string;
  slug: string;
}

interface SearchAndFilterProps {
  categories: Category[];
  tags: Tag[];
  years: number[];
  currentFilters: {
    search: string;
    category: string;
    tag: string;
    year: string;
  };
}

export default function SearchAndFilter({ 
  categories, 
  tags, 
  years, 
  currentFilters 
}: SearchAndFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchInput, setSearchInput] = useState(currentFilters.search);
  const [showAdvanced, setShowAdvanced] = useState(
    !!(currentFilters.category || currentFilters.tag || currentFilters.year)
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilter('search', searchInput);
  };

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    
    // 重置页码
    params.delete('page');
    
    const queryString = params.toString();
    const url = queryString ? `/posts?${queryString}` : '/posts';
    router.push(url);
  };

  const clearAllFilters = () => {
    setSearchInput('');
    router.push('/posts');
  };

  return (
    <div className="mb-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        {/* 搜索框 */}
        <form onSubmit={handleSearch} className="mb-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="搜索文章标题、内容..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                搜索
              </button>
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex-1 sm:flex-none px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <span className="hidden sm:inline">{showAdvanced ? '隐藏筛选' : '高级筛选'}</span>
                <span className="sm:hidden">筛选</span>
              </button>
            </div>
          </div>
        </form>

        {/* 高级筛选 */}
        {showAdvanced && (
          <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* 分类筛选 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  按分类筛选
                </label>
                <select
                  value={currentFilters.category}
                  onChange={(e) => updateFilter('category', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">全部分类</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.slug}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 标签筛选 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  按标签筛选
                </label>
                <select
                  value={currentFilters.tag}
                  onChange={(e) => updateFilter('tag', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">全部标签</option>
                  {tags.map((tag) => (
                    <option key={tag.id} value={tag.slug}>
                      {tag.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 年份筛选 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  按年份筛选
                </label>
                <select
                  value={currentFilters.year}
                  onChange={(e) => updateFilter('year', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">全部年份</option>
                  {years.map((year) => (
                    <option key={year} value={year.toString()}>
                      {year}年
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 清除筛选按钮 */}
            {(currentFilters.search || currentFilters.category || currentFilters.tag || currentFilters.year) && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors"
                >
                  清除所有筛选条件
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
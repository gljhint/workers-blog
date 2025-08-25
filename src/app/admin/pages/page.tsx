'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

interface Page {
  id: number;
  slug: string;
  title: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

interface PageListResult {
  data: Page[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export default function PagesManagement() {
  const { isAuthenticated, loading, requireAuth } = useAuth();
  const [pages, setPages] = useState<Page[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNext: false,
    hasPrev: false
  });
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [publishedFilter, setPublishedFilter] = useState('all');
  // 移除菜单过滤器，因为数据库中没有相关字段
  const [searchKeyword, setSearchKeyword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    if (!loading && !requireAuth()) {
      return;
    }
  }, [loading, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      loadPages();
    }
  }, [isAuthenticated, currentPage, publishedFilter, searchKeyword]);

  const loadPages = async () => {
    setPageLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20'
      });

      if (publishedFilter === 'published') {
        params.append('is_published', 'true');
      } else if (publishedFilter === 'draft') {
        params.append('is_published', 'false');
      }

      // 移除菜单过滤逻辑

      if (searchKeyword) {
        params.append('keyword', searchKeyword);
      }

      const response = await fetch(`/api/admin/pages?${params}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const result: { success: boolean; data: Page[]; pagination: { currentPage: number, totalPages: number, totalCount: number, hasNext: boolean, hasPrev: boolean } } = await response.json();
        if (result.success) {
          setPages(result.data);
          setPagination(result.pagination);
        }
      }
    } catch (error) {
      console.error('加载页面失败:', error);
      setError('加载页面失败');
    } finally {
      setPageLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadPages();
  };

  const handleSelectPage = (pageId: number) => {
    setSelectedPages(prev => 
      prev.includes(pageId) 
        ? prev.filter(id => id !== pageId)
        : [...prev, pageId]
    );
  };

  const handleSelectAll = () => {
    if (selectedPages.length === pages.length) {
      setSelectedPages([]);
    } else {
      setSelectedPages(pages.map(p => p.id));
    }
  };

  const handleBatchDelete = async () => {
    if (selectedPages.length === 0) {
      setError('请选择要删除的页面');
      return;
    }

    if (!confirm(`确定要删除 ${selectedPages.length} 个页面吗？此操作不可撤销。`)) {
      return;
    }

    try {
      const response = await fetch('/api/admin/pages', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ids: selectedPages })
      });

      const result = await response.json() as { success: boolean, message: string, error: string };
      if (result.success) {
        setMessage(result.message);
        setSelectedPages([]);
        loadPages();
      } else {
        setError(result.error);
      }
    } catch (error) {
      console.error('批量删除页面失败:', error);
      setError('删除失败，请稍后重试');
    }
  };

  const handleDelete = async (page: Page) => {
    if (!confirm(`确定要删除页面"${page.title}"吗？`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/pages/${page.id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      const result = await response.json() as { success: boolean, message: string, error: string };
      if (result.success) {
        setMessage(result.message);
        loadPages();
      } else {
        setError(result.error);
      }
    } catch (error) {
      console.error('删除页面失败:', error);
      setError('删除失败，请稍后重试');
    }
  };

  const getStatusBadge = (page: Page) => {
    if (page.is_published) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          已发布
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
          草稿
        </span>
      );
    }
  };

  // 移除getMenuBadge函数，因为数据库中没有show_in_menu字段

  if (loading || pageLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">加载中...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <nav className="mb-8">
          <Link 
            href="/admin"
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
          >
            <svg className="mr-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            返回管理后台
          </Link>
        </nav>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              页面管理
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              管理自定义页面，创建独立的内容页面
            </p>
          </div>
          <Link
            href="/admin/pages/new"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="mr-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            新建页面
          </Link>
        </div>
      </div>

      {message && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md text-sm">
          {message}
        </div>
      )}

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* 筛选和搜索 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex gap-2">
            {[
              { value: 'all', label: '全部' },
              { value: 'published', label: '已发布' },
              { value: 'draft', label: '草稿' }
            ].map(option => (
              <button
                key={option.value}
                onClick={() => {
                  setPublishedFilter(option.value);
                  setCurrentPage(1);
                }}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  publishedFilter === option.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="text-sm text-gray-500 dark:text-gray-400">
            页面管理
          </div>

          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="搜索页面标题或内容..."
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              搜索
            </button>
          </form>
        </div>

        {/* 批量操作 */}
        {selectedPages.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex gap-2 items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                已选择 {selectedPages.length} 个页面：
              </span>
              <button
                onClick={handleBatchDelete}
                className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
              >
                删除
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 页面列表 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedPages.length === pages.length && pages.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  标题
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  URL别名
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  状态
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  描述
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  创建时间
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {pages.map((page) => (
                <tr key={page.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedPages.includes(page.id)}
                      onChange={() => handleSelectPage(page.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {page.title}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-white font-mono">
                      /{page.slug}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(page)}
                  </td>
                  <td className="px-6 py-4">
                    {page.meta_description ? (
                      <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                        {page.meta_description}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">无描述</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {new Date(page.created_at).toLocaleDateString('zh-CN')}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <Link
                      href={`/admin/pages/${page.id}/edit`}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4"
                    >
                      编辑
                    </Link>
                    {page.is_published && (
                      <Link
                        href={`/pages/${page.slug}`}
                        target="_blank"
                        className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 mr-4"
                      >
                        预览
                      </Link>
                    )}
                    <button
                      onClick={() => handleDelete(page)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                    >
                      删除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pages.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">没有页面</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">开始创建你的第一个页面吧。</p>
            <div className="mt-6">
              <Link
                href="/admin/pages/new"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <svg className="mr-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                新建页面
              </Link>
            </div>
          </div>
        )}

        {/* 分页 */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                第 {pagination.currentPage} 页，共 {pagination.totalPages} 页，总共 {pagination.totalCount} 个页面
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  上一页
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(pagination.totalPages, currentPage + 1))}
                  disabled={currentPage === pagination.totalPages}
                  className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  下一页
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
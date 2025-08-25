'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

interface SiteSetting {
  id: number;
  site_name?: string;
  site_title?: string;
  site_description?: string;
  site_email?: string;
  site_url?: string;
  posts_per_page?: number;
  introduction?: string;
  site_footer?: string;
}

interface SettingFormData {
  site_name: string;
  site_title: string;
  site_description: string;
  site_email: string;
  site_url: string;
  posts_per_page: string;
  introduction: string;
  site_footer: string;
}

export default function SiteSettings() {
  const { isAuthenticated, loading, requireAuth } = useAuth();
  const [settings, setSettings] = useState<SiteSetting | null>(null);
  const [formData, setFormData] = useState<SettingFormData>({
    site_name: '',
    site_title: '',
    site_description: '',
    site_email: '',
    site_url: '',
    posts_per_page: '10',
    introduction: '',
    site_footer: ''
  });
  const [formLoading, setFormLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && !requireAuth()) {
      return;
    }
  }, [loading, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      loadSettings();
    }
  }, [isAuthenticated]);

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const result = await response.json() as { success: boolean, data: SiteSetting | null };
        if (result.success && result.data) {
          setSettings(result.data);
          
          // 直接设置表单数据
          setFormData({
            site_name: result.data.site_name || '',
            site_title: result.data.site_title || '',
            site_description: result.data.site_description || '',
            site_email: result.data.site_email || '',
            site_url: result.data.site_url || '',
            posts_per_page: result.data.posts_per_page ? result.data.posts_per_page.toString() : '10',
            introduction: result.data.introduction || '',
            site_footer: result.data.site_footer || ''
          });
        }
      }
    } catch (error) {
      console.error('加载站点设置失败:', error);
      setError('加载站点设置失败');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
    setMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');
    setMessage('');

    // 验证表单
    if (!formData.site_name.trim()) {
      setError('网站名称不能为空');
      setFormLoading(false);
      return;
    }

    if (!formData.site_email.trim() || !/\S+@\S+\.\S+/.test(formData.site_email)) {
      setError('请输入有效的邮箱地址');
      setFormLoading(false);
      return;
    }

    const postsPerPage = parseInt(formData.posts_per_page);
    if (isNaN(postsPerPage) || postsPerPage < 1 || postsPerPage > 100) {
      setError('每页文章数必须是1-100之间的数字');
      setFormLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          settings: {
            ...formData,
            posts_per_page: parseInt(formData.posts_per_page)
          }
        }),
      });

      const result = await response.json() as { success: boolean, data: SiteSetting | null, error: string };

      if (result.success) {
        setMessage('站点设置更新成功');
        if (result.data) {
          setSettings(result.data);
        }
      } else {
        setError(result.error || '更新失败');
      }
    } catch (error) {
      console.error('更新站点设置失败:', error);
      setError('更新请求失败，请稍后重试');
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) {
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            站点设置
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            配置你的博客网站基本信息
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {message && (
            <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md text-sm">
              {message}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* 基本信息 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-3 mb-6">
              基本信息
            </h2>
            <div className="space-y-6">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="site_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    网站名称 *
                  </label>
                  <input
                    type="text"
                    id="site_name"
                    name="site_name"
                    value={formData.site_name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="我的博客"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="site_title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    网站标题
                  </label>
                  <input
                    type="text"
                    id="site_title"
                    name="site_title"
                    value={formData.site_title}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="技术与生活分享"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="site_description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    网站描述
                  </label>
                  <textarea
                    id="site_description"
                    name="site_description"
                    value={formData.site_description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="分享技术与生活"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="introduction" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    网站介绍
                  </label>
                  <textarea
                    id="introduction"
                    name="introduction"
                    value={formData.introduction}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="欢迎来到我的博客，这里分享技术、生活和思考..."
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">将显示在网站主页的介绍区域</p>
                </div>
              </div>
            </div>
          </div>

          {/* 联系信息 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-3 mb-6">
              联系信息
            </h2>
            <div className="space-y-6">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="site_email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    联系邮箱 *
                  </label>
                  <input
                    type="email"
                    id="site_email"
                    name="site_email"
                    value={formData.site_email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="admin@blog.com"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="site_url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    网站地址
                  </label>
                  <input
                    type="url"
                    id="site_url"
                    name="site_url"
                    value={formData.site_url}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="https://myblog.com"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 显示设置 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-3 mb-6">
              显示设置
            </h2>
            <div className="space-y-6">

              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label htmlFor="posts_per_page" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    每页文章数
                  </label>
                  <input
                    type="number"
                    id="posts_per_page"
                    name="posts_per_page"
                    value={formData.posts_per_page}
                    onChange={handleInputChange}
                    min="1"
                    max="100"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">设置每页显示的文章数量（1-100）</p>
                </div>
              </div>
            </div>
          </div>

          {/* 其他设置 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-3 mb-6">
              其他设置
            </h2>
              <div>
                <label htmlFor="site_footer" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  网站页脚
                </label>
                <textarea
                  id="site_footer"
                  name="site_footer"
                  value={formData.site_footer}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="© 2024 我的博客. 保留所有权利。"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">显示在网站底部的版权信息</p>
              </div>
          </div>

          {/* 提交按钮 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={formLoading}
                className="px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {formLoading ? '保存中...' : '保存设置'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
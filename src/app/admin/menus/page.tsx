'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

interface Menu {
  id: number;
  title: string;
  url: string;
  icon?: string;
  description?: string;
  parent_id?: number;
  menu_order: number;
  target: '_self' | '_blank';
  is_active: boolean;
  level: number;
  path?: string;
  created_at: string;
  updated_at: string;
}

interface MenuFormData {
  title: string;
  url: string;
  icon: string;
  description: string;
  parent_id: number | '';
  menu_order: number;
  target: '_self' | '_blank';
  is_active: boolean;
}

const iconOptions = [
  { value: 'home', label: '首页' },
  { value: 'document-text', label: '文档' },
  { value: 'folder', label: '文件夹' },
  { value: 'tag', label: '标签' },
  { value: 'user', label: '用户' },
  { value: 'cog', label: '设置' },
  { value: 'information-circle', label: '信息' },
  { value: 'link', label: '链接' },
  { value: 'photograph', label: '图片' },
  { value: 'chat', label: '聊天' },
];

export default function MenusManagement() {
  const { isAuthenticated, loading, requireAuth } = useAuth();
  const [menus, setMenus] = useState<Menu[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
  const [formData, setFormData] = useState<MenuFormData>({
    title: '',
    url: '',
    icon: '',
    description: '',
    parent_id: '',
    menu_order: 0,
    target: '_self',
    is_active: true
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
      loadMenus();
    }
  }, [isAuthenticated]);

  const loadMenus = async () => {
    try {
      const response = await fetch('/api/admin/menus', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const result = await response.json() as { success: boolean, data: Menu[] };
        if (result.success) {
          setMenus(result.data);
        }
      }
    } catch (error) {
      console.error('加载菜单失败:', error);
      setError('加载菜单失败');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : 
              name === 'parent_id' ? (value === '' ? '' : parseInt(value)) :
              name === 'menu_order' ? parseInt(value) || 0 : value
    }));

    setError('');
    setMessage('');
  };

  const resetForm = () => {
    setFormData({
      title: '',
      url: '',
      icon: '',
      description: '',
      parent_id: '',
      menu_order: 0,
      target: '_self',
      is_active: true
    });
    setEditingMenu(null);
    setShowForm(false);
    setError('');
    setMessage('');
  };

  const handleEdit = (menu: Menu) => {
    setEditingMenu(menu);
    setFormData({
      title: menu.title,
      url: menu.url,
      icon: menu.icon || '',
      description: menu.description || '',
      parent_id: menu.parent_id || '',
      menu_order: menu.menu_order,
      target: menu.target,
      is_active: menu.is_active
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');
    setMessage('');

    if (!formData.title.trim() || !formData.url.trim()) {
      setError('菜单标题和链接不能为空');
      setFormLoading(false);
      return;
    }

    try {
      const url = editingMenu 
        ? `/api/admin/menus/${editingMenu.id}`
        : '/api/admin/menus';
      
      const method = editingMenu ? 'PUT' : 'POST';

      const submitData = {
        ...formData,
        parent_id: formData.parent_id === '' ? null : formData.parent_id
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(submitData),
      });

      const result = await response.json() as { success: boolean, message: string, error: string };

      if (result.success) {
        setMessage(editingMenu ? '菜单更新成功' : '菜单创建成功');
        resetForm();
        loadMenus();
      } else {
        setError(result.error || '操作失败');
      }
    } catch (error) {
      console.error('提交菜单失败:', error);
      setError('请求失败，请稍后重试');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (menu: Menu) => {
    if (!confirm(`确定要删除菜单"${menu.title}"吗？此操作不可撤销。`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/menus/${menu.id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      const result = await response.json() as { success: boolean, message: string, error: string };

      if (result.success) {
        setMessage('菜单删除成功');
        loadMenus();
      } else {
        setError(result.error || '删除失败');
      }
    } catch (error) {
      console.error('删除菜单失败:', error);
      setError('删除请求失败，请稍后重试');
    }
  };

  const getParentMenus = () => {
    return menus.filter(menu => !menu.parent_id);
  };

  const getMenuLevel = (menu: Menu): number => {
    if (!menu.parent_id) return 0;
    const parent = menus.find(m => m.id === menu.parent_id);
    return parent ? getMenuLevel(parent) + 1 : 0;
  };

  const sortedMenus = [...menus].sort((a, b) => {
    if (a.parent_id !== b.parent_id) {
      if (!a.parent_id) return -1;
      if (!b.parent_id) return 1;
      return (a.parent_id || 0) - (b.parent_id || 0);
    }
    return a.menu_order - b.menu_order;
  });

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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              菜单管理
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              管理你的网站导航菜单
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="mr-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            添加菜单
          </button>
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

        {/* 菜单表单 */}
        {showForm && (
          <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {editingMenu ? '编辑菜单' : '添加菜单'}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    菜单标题 *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="首页"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    描述
                  </label>
                  <input
                    type="text"
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="菜单描述（可选）"
                  />
                </div>

                <div>
                  <label htmlFor="url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    链接地址 *
                  </label>
                  <input
                    type="text"
                    id="url"
                    name="url"
                    value={formData.url}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="/"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="icon" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    图标
                  </label>
                  <select
                    id="icon"
                    name="icon"
                    value={formData.icon}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">无图标</option>
                    {iconOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="parent_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    父菜单
                  </label>
                  <select
                    id="parent_id"
                    name="parent_id"
                    value={formData.parent_id}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">顶级菜单</option>
                    {getParentMenus().map(menu => (
                      <option key={menu.id} value={menu.id}>
                        {menu.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="menu_order" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    排序
                  </label>
                  <input
                    type="number"
                    id="menu_order"
                    name="menu_order"
                    value={formData.menu_order}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label htmlFor="target" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    打开方式
                  </label>
                  <select
                    id="target"
                    name="target"
                    value={formData.target}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="_self">当前页面</option>
                    <option value="_blank">新标签页</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    启用菜单
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {formLoading ? '保存中...' : (editingMenu ? '更新' : '创建')}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 菜单列表 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    菜单
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    链接
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    排序
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    状态
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {sortedMenus.map((menu: Menu) => {
                  const level = getMenuLevel(menu);
                  return (
                    <tr key={menu.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center" style={{ paddingLeft: `${level * 20}px` }}>
                          {level > 0 && (
                            <span className="text-gray-400 mr-2">└─</span>
                          )}
                          {menu.icon && (
                            <span className="mr-2 text-gray-500">📦</span>
                          )}
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {menu.title}
                            </div>
                            {menu.description && (
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {menu.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <code className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-sm rounded">
                          {menu.url}
                        </code>
                        {menu.target === '_blank' && (
                          <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">新窗口</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {menu.menu_order}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {menu.is_active ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            启用
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                            禁用
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(menu)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4"
                        >
                          编辑
                        </button>
                        <button
                          onClick={() => handleDelete(menu)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          删除
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {menus.length === 0 && (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">没有菜单</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">开始创建你的第一个菜单吧。</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
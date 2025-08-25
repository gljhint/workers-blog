'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

interface ImportOptions {
  overwrite: boolean;
  skipExisting: boolean;
  importCategories: boolean;
  importTags: boolean;
  importPosts: boolean;
  importPages: boolean;
  importMenus: boolean;
  importComments: boolean;
  importSettings: boolean;
}

export default function BackupPage() {
  const { isAuthenticated, loading, requireAuth } = useAuth();
  const [exportLoading, setExportLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importOptions, setImportOptions] = useState<ImportOptions>({
    overwrite: false,
    skipExisting: true,
    importCategories: true,
    importTags: true,
    importPosts: true,
    importPages: true,
    importMenus: true,
    importComments: false, // 默认不导入评论
    importSettings: false  // 默认不导入设置
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useState(() => {
    if (!loading && !requireAuth()) {
      return;
    }
  });

  const handleExport = async (type: string) => {
    setExportLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch(`/api/admin/export?type=${type}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        
        // 从响应头获取文件名
        const contentDisposition = response.headers.get('content-disposition');
        const filename = contentDisposition?.match(/filename="(.+)"/)?.[1] || 
          `blog-backup-${type}-${new Date().toISOString().split('T')[0]}.json`;
        
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        setMessage(`${type === 'all' ? '全部数据' : type} 导出成功！`);
      } else {
        const result = await response.json() as { success: boolean, error: string };
        setError(result.error || '导出失败');
      }
    } catch (error) {
      console.error('导出失败:', error);
      setError('导出失败，请稍后重试');
    } finally {
      setExportLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === 'application/json' || file.name.endsWith('.json')) {
        setImportFile(file);
        setError('');
      } else {
        setError('请选择 JSON 格式的备份文件');
        setImportFile(null);
      }
    }
  };

  const handleImport = async () => {
    if (!importFile) {
      setError('请选择要导入的文件');
      return;
    }

    setImportLoading(true);
    setError('');
    setMessage('');

    try {
      const fileContent = await importFile.text();
      const data = JSON.parse(fileContent);

      const response = await fetch('/api/admin/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          data,
          options: importOptions
        })
      });

      const result = await response.json() as { success: boolean, summary: { total_imported: number, total_skipped: number, total_errors: number }, error: string };

      if (result.success) {
        setMessage(`导入完成！导入 ${result.summary.total_imported} 条记录，跳过 ${result.summary.total_skipped} 条，错误 ${result.summary.total_errors} 条`);
        setImportFile(null);
        // 重置文件输入
        const fileInput = document.getElementById('import-file') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        setError(result.error || '导入失败');
      }
    } catch (error) {
      console.error('导入失败:', error);
      setError('导入失败，请检查文件格式');
    } finally {
      setImportLoading(false);
    }
  };

  const handleOptionChange = (key: keyof ImportOptions, value: boolean) => {
    setImportOptions(prev => ({
      ...prev,
      [key]: value
    }));
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
          数据备份与恢复
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          导出网站数据进行备份，或从备份文件恢复数据
        </p>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 数据导出 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            数据导出
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            将网站数据导出为 JSON 格式的备份文件，支持按类型导出或全量导出。
          </p>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleExport('posts')}
                disabled={exportLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                导出文章
              </button>
              <button
                onClick={() => handleExport('pages')}
                disabled={exportLoading}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                导出页面
              </button>
              <button
                onClick={() => handleExport('categories')}
                disabled={exportLoading}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                导出分类
              </button>
              <button
                onClick={() => handleExport('tags')}
                disabled={exportLoading}
                className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                导出标签
              </button>
              <button
                onClick={() => handleExport('comments')}
                disabled={exportLoading}
                className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                导出评论
              </button>
              <button
                onClick={() => handleExport('settings')}
                disabled={exportLoading}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                导出设置
              </button>
            </div>

            <button
              onClick={() => handleExport('all')}
              disabled={exportLoading}
              className="w-full px-4 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
            >
              {exportLoading ? '导出中...' : '导出全部数据'}
            </button>
          </div>

          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
              导出说明
            </h3>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• 文章数据包含分类和标签关联</li>
              <li>• 页面数据包含自定义 CSS/JS</li>
              <li>• 评论数据包含层级关系</li>
              <li>• 全部导出包含所有数据类型</li>
            </ul>
          </div>
        </div>

        {/* 数据导入 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            数据导入
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            从备份文件恢复数据，支持选择性导入和覆盖设置。
          </p>

          {/* 文件选择 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              选择备份文件
            </label>
            <input
              id="import-file"
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-200"
            />
            {importFile && (
              <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                已选择: {importFile.name}
              </p>
            )}
          </div>

          {/* 导入选项 */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              导入选项
            </h3>
            
            <div className="space-y-3">
              {/* 覆盖选项 */}
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-600 dark:text-gray-400">
                  覆盖现有数据
                </label>
                <input
                  type="checkbox"
                  checked={importOptions.overwrite}
                  onChange={(e) => handleOptionChange('overwrite', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>

              {/* 数据类型选择 */}
              <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  选择导入的数据类型
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: 'importCategories', label: '分类' },
                    { key: 'importTags', label: '标签' },
                    { key: 'importPosts', label: '文章' },
                    { key: 'importPages', label: '页面' },
                    { key: 'importMenus', label: '菜单' },
                    { key: 'importComments', label: '评论' },
                    { key: 'importSettings', label: '设置' }
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={importOptions[key as keyof ImportOptions]}
                        onChange={(e) => handleOptionChange(key as keyof ImportOptions, e.target.checked)}
                        className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label className="text-sm text-gray-600 dark:text-gray-400">
                        {label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleImport}
            disabled={importLoading || !importFile}
            className="w-full px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
          >
            {importLoading ? '导入中...' : '开始导入'}
          </button>

          <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
            <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
              ⚠️ 重要提醒
            </h3>
            <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
              <li>• 导入前请先备份现有数据</li>
              <li>• 覆盖模式会替换相同标识的数据</li>
              <li>• 评论和设置导入需谨慎操作</li>
              <li>• 大量数据导入可能需要较长时间</li>
            </ul>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
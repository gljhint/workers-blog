'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

interface Comment {
  id: number;
  post_id: number;
  parent_id?: number;
  author_name: string;
  author_email: string;
  author_website?: string;
  content: string;
  is_approved: boolean;
  created_at: string;
  post_title?: string;
}

interface CommentStats {
  total: number;
  pending: number;
  approved: number;
}

interface CommentFormData {
  author_name: string;
  author_email: string;
  author_website: string;
  content: string;
  is_approved: boolean;
}

export default function CommentsManagement() {
  const { isAuthenticated, loading, requireAuth } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [stats, setStats] = useState<CommentStats>({ total: 0, pending: 0, approved: 0 });
  const [selectedComments, setSelectedComments] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingComment, setEditingComment] = useState<Comment | null>(null);
  const [formData, setFormData] = useState<CommentFormData>({
    author_name: '',
    author_email: '',
    author_website: '',
    content: '',
    is_approved: false
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
      loadComments();
      loadStats();
    }
  }, [isAuthenticated, currentPage, statusFilter, searchKeyword]);

  const loadComments = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20'
      });

      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      if (searchKeyword) {
        params.append('keyword', searchKeyword);
      }

      const response = await fetch(`/api/admin/comments?${params}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const result = await response.json() as { success: boolean, data: Comment[], pagination: { totalPages: number } };
        if (result.success) {
          setComments(result.data);
          setTotalPages(result.pagination.totalPages);
        }
      }
    } catch (error) {
      console.error('加载评论失败:', error);
      setError('加载评论失败');
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('/api/admin/comments/stats', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const result = await response.json() as { success: boolean, data: { stats: CommentStats, recentComments: any[] } };
        if (result.success) {
          console.log('Loaded stats:', result.data.stats); // Debug log
          setStats(result.data.stats);
        } else {
          console.error('Stats API error:', result);
        }
      } else {
        console.error('Stats API failed:', response.status);
      }
    } catch (error) {
      console.error('加载统计失败:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadComments();
  };

  const handleSelectComment = (commentId: number) => {
    setSelectedComments(prev => 
      prev.includes(commentId) 
        ? prev.filter(id => id !== commentId)
        : [...prev, commentId]
    );
  };

  const handleSelectAll = () => {
    if (selectedComments.length === comments.length) {
      setSelectedComments([]);
    } else {
      setSelectedComments(comments.map(c => c.id));
    }
  };

  const handleBatchAction = async (action: string, approved?: boolean) => {
    if (selectedComments.length === 0) {
      setError('请选择要操作的评论');
      return;
    }

    try {
      if (action === 'delete') {
        if (!confirm(`确定要删除 ${selectedComments.length} 条评论吗？此操作不可撤销。`)) {
          return;
        }

        const response = await fetch('/api/admin/comments', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ ids: selectedComments })
        });

        const result = await response.json() as { success: boolean, message: string, error: string };
        if (result.success) {
          setMessage(result.message);
          setSelectedComments([]);
          loadComments();
          loadStats();
        } else {
          setError(result.error);
        }
      } else if (action === 'updateStatus' && approved !== undefined) {
        const response = await fetch('/api/admin/comments', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ action: 'updateStatus', ids: selectedComments, is_approved: approved })
        });

        const result = await response.json() as { success: boolean, message: string, error: string };
        if (result.success) {
          setMessage(result.message);
          setSelectedComments([]);
          loadComments();
          loadStats();
        } else {
          setError(result.error);
        }
      }
    } catch (error) {
      console.error('批量操作失败:', error);
      setError('操作失败，请稍后重试');
    }
  };

  const handleEdit = (comment: Comment) => {
    setEditingComment(comment);
    setFormData({
      author_name: comment.author_name,
      author_email: comment.author_email,
      author_website: comment.author_website || '',
      content: comment.content,
      is_approved: comment.is_approved
    });
    setShowEditModal(true);
  };

  const handleDelete = async (comment: Comment) => {
    if (!confirm(`确定要删除来自"${comment.author_name}"的评论吗？`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/comments/${comment.id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      const result = await response.json() as { success: boolean, message: string, error: string };
      if (result.success) {
        setMessage(result.message);
        loadComments();
        loadStats();
      } else {
        setError(result.error);
      }
    } catch (error) {
      console.error('删除评论失败:', error);
      setError('删除失败，请稍后重试');
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingComment) return;

    setFormLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch(`/api/admin/comments/${editingComment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      const result = await response.json() as { success: boolean, message: string, error: string };
      if (result.success) {
        setMessage(result.message);
        setShowEditModal(false);
        setEditingComment(null);
        loadComments();
        loadStats();
      } else {
        setError(result.error);
      }
    } catch (error) {
      console.error('更新评论失败:', error);
      setError('更新失败，请稍后重试');
    } finally {
      setFormLoading(false);
    }
  };

  const getStatusBadge = (isApproved: boolean) => {
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        isApproved 
          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      }`}>
        {isApproved ? '已批准' : '待审核'}
      </span>
    );
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
          评论管理
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          管理博客评论，审核和回复用户留言
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

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.total || 0}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">总评论</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
          <div className="text-2xl font-bold text-yellow-600">
            {stats.pending || 0}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">待审核</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
          <div className="text-2xl font-bold text-green-600">
            {stats.approved || 0}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">已批准</div>
        </div>
      </div>

      {/* 筛选和搜索 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex gap-2">
            {[
              { value: 'all', label: '全部' },
              { value: 'pending', label: '待审核' },
              { value: 'approved', label: '已批准' }
            ].map(option => (
              <button
                key={option.value}
                onClick={() => {
                  setStatusFilter(option.value);
                  setCurrentPage(1);
                }}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  statusFilter === option.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="搜索评论内容、作者或文章..."
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
        {selectedComments.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex gap-2 items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                已选择 {selectedComments.length} 条评论：
              </span>
              <button
                onClick={() => handleBatchAction('updateStatus', true)}
                className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
              >
                批准
              </button>
              <button
                onClick={() => handleBatchAction('updateStatus', false)}
                className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
              >
                待审核
              </button>
              <button
                onClick={() => handleBatchAction('delete')}
                className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
              >
                删除
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 评论列表 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedComments.length === comments.length && comments.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  作者
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  内容
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  文章
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  状态
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  时间
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {comments.map((comment) => (
                <tr key={comment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedComments.includes(comment.id)}
                      onChange={() => handleSelectComment(comment.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {comment.author_name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {comment.author_email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-white max-w-xs truncate">
                      {comment.content}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {comment.post_title || `文章 #${comment.post_id}`}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(comment.is_approved)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {new Date(comment.created_at).toLocaleDateString('zh-CN')}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(comment)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => handleDelete(comment)}
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

        {comments.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">没有评论</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">还没有用户评论。</p>
          </div>
        )}

        {/* 分页 */}
        {totalPages > 1 && (
          <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                第 {currentPage} 页，共 {totalPages} 页
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
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  下一页
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 编辑模态框 */}
      {showEditModal && editingComment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              编辑评论
            </h3>
            
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    作者姓名
                  </label>
                  <input
                    type="text"
                    value={formData.author_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, author_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    邮箱
                  </label>
                  <input
                    type="email"
                    value={formData.author_email}
                    onChange={(e) => setFormData(prev => ({ ...prev, author_email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  网站 (可选)
                </label>
                <input
                  type="url"
                  value={formData.author_website}
                  onChange={(e) => setFormData(prev => ({ ...prev, author_website: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  评论内容
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  状态
                </label>
                <select
                  value={formData.is_approved.toString()}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_approved: e.target.value === 'true' }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="false">待审核</option>
                  <option value="true">已批准</option>
                </select>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {formLoading ? '保存中...' : '保存'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
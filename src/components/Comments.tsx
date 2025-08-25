'use client';

import { useState, useEffect } from 'react';

interface Comment {
  id: number;
  author_name: string;
  author_email: string;
  author_url?: string;
  content: string;
  created_at: string;
  children?: Comment[];
}

interface CommentsProps {
  postId: number;
  enabled: boolean;
}

export default function Comments({ postId, enabled }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [formData, setFormData] = useState({
    author_name: '',
    author_email: '',
    author_url: '',
    content: '',
    parent_id: null as number | null
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);

  // 如果评论功能被禁用，不显示评论区
  if (!enabled) {
    return null;
  }

  useEffect(() => {
    loadComments();
  }, [postId]);

  const loadComments = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/comments/${postId}`);
      const result = await response.json();
      
      if (result.success) {
        setComments(result.data);
      }
    } catch (error) {
      console.error('加载评论失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
    setMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setMessage('');

    if (!formData.author_name.trim() || !formData.author_email.trim() || !formData.content.trim()) {
      setError('请填写所有必填字段');
      setSubmitting(false);
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.author_email)) {
      setError('请输入有效的邮箱地址');
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          post_id: postId,
          author_name: formData.author_name.trim(),
          author_email: formData.author_email.trim(),
          author_url: formData.author_url.trim() || undefined,
          content: formData.content.trim(),
          parent_id: formData.parent_id
        }),
      });

      const result = await response.json();

      if (result.success) {
        setMessage(result.message || '评论提交成功，等待审核');
        setFormData({ 
          author_name: '', 
          author_email: '', 
          author_url: '', 
          content: '', 
          parent_id: null 
        });
        setReplyingTo(null);
        // 重新加载评论以显示新的评论（如果已审核）
        loadComments();
      } else {
        setError(result.error || '评论提交失败');
      }
    } catch (error) {
      console.error('评论提交失败:', error);
      setError('评论提交失败，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = (commentId: number, authorName: string) => {
    setReplyingTo(commentId);
    setFormData(prev => ({ 
      ...prev, 
      parent_id: commentId,
      content: `@${authorName} `
    }));
    // 滚动到表单
    document.getElementById('comment-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const cancelReply = () => {
    setReplyingTo(null);
    setFormData(prev => ({ 
      ...prev, 
      parent_id: null,
      content: ''
    }));
  };

  const renderComment = (comment: Comment, depth = 0) => (
    <div key={comment.id} className={`${depth > 0 ? 'ml-12' : ''}`}>
      <div className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-b-0">
        <div className="flex items-start mb-3">
          <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
            {comment.author_name.charAt(0).toUpperCase()}
          </div>
          <div className="ml-3 flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                {comment.author_name}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(comment.created_at).toLocaleDateString('zh-CN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
              <button
                onClick={() => handleReply(comment.id, comment.author_name)}
                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
              >
                回复
              </button>
            </div>
            <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap text-sm">
              {comment.content}
            </div>
          </div>
        </div>
      </div>
      
      {/* 子评论 */}
      {comment.children && comment.children.length > 0 && (
        <div className="mt-6 space-y-6">
          {comment.children.map(child => renderComment(child, depth + 1))}
        </div>
      )}
    </div>
  );

  const totalComments = comments.reduce((total, comment) => {
    return total + 1 + (comment.children ? comment.children.length : 0);
  }, 0);

  return (
    <section className="mt-12 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
        评论 ({totalComments})
      </h3>

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

      {/* 评论表单 */}
      <form id="comment-form" onSubmit={handleSubmit} className="mb-8 space-y-4">
        {replyingTo && (
          <div className="bg-blue-50 dark:bg-blue-900 p-3 rounded-md flex items-center justify-between">
            <span className="text-sm text-blue-700 dark:text-blue-300">
              正在回复评论
            </span>
            <button
              type="button"
              onClick={cancelReply}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 text-sm"
            >
              取消回复
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="author_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              姓名 *
            </label>
            <input
              type="text"
              id="author_name"
              name="author_name"
              value={formData.author_name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="请输入您的姓名"
              required
            />
          </div>

          <div>
            <label htmlFor="author_email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              邮箱 *
            </label>
            <input
              type="email"
              id="author_email"
              name="author_email"
              value={formData.author_email}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="请输入您的邮箱"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="author_url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            网站 (可选)
          </label>
          <input
            type="url"
            id="author_url"
            name="author_url"
            value={formData.author_url}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="https://yourwebsite.com (可选)"
          />
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            评论内容 *
          </label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleInputChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="请输入您的评论..."
            maxLength={1000}
            required
          />
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {formData.content.length}/1000 字符
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? '提交中...' : '发表评论'}
          </button>
        </div>
      </form>

      {/* 评论列表 */}
      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400">加载评论中...</p>
          </div>
        ) : comments.length > 0 ? (
          comments.map(comment => renderComment(comment))
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">
              <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-gray-500 dark:text-gray-400">
              暂无评论，来发表第一条评论吧！
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import Editor from '@/components/editor';

type ApiResponse<T> = {
  success: boolean;
  data: T;
  [key: string]: any;
};

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    is_published: false,
    is_featured: false,
    selected_tags: [] as number[],
    category_id: '',
    author_id: '',
    cover_image: '',
    allow_comments: true
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/admin/login');
      return;
    }
  }, [loading, isAuthenticated, router]);

  // 获取分类和标签列表
  useEffect(() => {
    if (isAuthenticated) {
      // 获取分类
      fetch('/api/categories', {
        credentials: 'include'
      })
        .then(res => res.json() as Promise<ApiResponse<any[]>>)
        .then(data => {
          if (data.success && Array.isArray(data.data)) {
            setCategories(data.data);
          } else {
            console.error('Categories data is not an array:', data);
            setCategories([]);
          }
        })
        .catch(error => {
          console.error('Error fetching categories:', error);
          setCategories([]);
        });

      // 获取标签
      fetch('/api/tags', {
        credentials: 'include'
      })
        .then(res => res.json() as Promise<ApiResponse<any[]>>)
        .then(data => {
          if (data.success && Array.isArray(data.data)) {
            setTags(data.data);
          } else {
            console.error('Tags data is not an array:', data);
            setTags([]);
          }
        })
        .catch(error => {
          console.error('Error fetching tags:', error);
          setTags([]);
        });
    }
  }, [isAuthenticated]);

  // 获取文章数据
  useEffect(() => {
    if (params.id && isAuthenticated) {
      fetch(`/api/posts/${params.id}`, {
        credentials: 'include'
      })
        .then(res => res.json() as Promise<ApiResponse<any>>)
        .then(result => {
          if (result.success) {
            const data = result.data;
            setFormData({
              title: data.title,
              description: data.description || '',
              content: data.content,
              is_published: data.is_published,
              is_featured: data.is_featured || false,
              selected_tags: data.tags ? data.tags.map((tag: any) => tag.id) : [],
              category_id: data.category_id ? data.category_id.toString() : '',
              author_id: data.author_id ? data.author_id.toString() : '',
              cover_image: data.cover_image || '',
              allow_comments: data.allow_comments !== false
            });
            if (data.cover_image) {
              setCoverImagePreview(data.cover_image);
            }
          } else {
            setError('文章不存在');
            router.push('/admin/posts');
          }
          setIsLoading(false);
        })
        .catch(error => {
          console.error('Error fetching post:', error);
          setError('获取文章失败');
          setIsLoading(false);
        });
    }
  }, [params.id, isAuthenticated, router]);

  const handleImageUpload = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'image');

    const response = await fetch('/api/upload', {
      method: 'POST',
      credentials: 'include',
      body: formData
    });

    if (!response.ok) {
      throw new Error('图片上传失败');
    }

    const result = await response.json() as ApiResponse<{ url: string }>;
    return result.data.url;
  };

  const handleAudioUpload = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'audio');

    const response = await fetch('/api/upload', {
      method: 'POST',
      credentials: 'include',
      body: formData
    });

    if (!response.ok) {
      throw new Error('音频上传失败');
    }

    const result = await response.json() as ApiResponse<{ url: string }>;
    return result.data.url;
  };

  const handleCoverUpload = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'cover');

    const response = await fetch('/api/upload', {
      method: 'POST',
      credentials: 'include',
      body: formData
    });

    if (!response.ok) {
      throw new Error('封面图片上传失败');
    }

    const result = await response.json() as ApiResponse<{ url: string }>;
    return result.data.url;
  };

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setCoverImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      let coverImageUrl = formData.cover_image;
      
      // 上传封面图片
      if (coverImage) {
        coverImageUrl = await handleCoverUpload(coverImage);
      }

      const response = await fetch(`/api/posts/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          cover_image: coverImageUrl,
          tag_ids: formData.selected_tags,
          category_id: formData.category_id ? parseInt(formData.category_id) : undefined,
          author_id: formData.author_id ? parseInt(formData.author_id) : undefined,
        }),
      });

      const result = await response.json() as ApiResponse<any>;
      if (result.success) {
        router.push(`/admin/posts`);
      } else {
        setError(result.error || '更新失败，请重试');
      }
    } catch (error) {
      console.error('Error updating post:', error);
      setError('更新失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePreview = () => {
    const previewWindow = window.open('', '_blank');
    if (previewWindow) {
      previewWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>预览 - ${formData.title}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            .prose { max-width: none; }
            .prose h1 { font-size: 2rem; font-weight: bold; margin: 1.5rem 0 1rem; }
            .prose h2 { font-size: 1.5rem; font-weight: bold; margin: 1.25rem 0 0.75rem; }
            .prose h3 { font-size: 1.25rem; font-weight: bold; margin: 1rem 0 0.5rem; }
            .prose p { margin: 0.75rem 0; line-height: 1.6; }
            .prose ul, .prose ol { margin: 0.75rem 0; padding-left: 1.5rem; }
            .prose li { margin: 0.25rem 0; }
            .prose code { background: #f3f4f6; padding: 0.125rem 0.25rem; border-radius: 0.25rem; }
            .prose pre { background: #1f2937; color: white; padding: 1rem; border-radius: 0.5rem; overflow-x: auto; }
            .prose blockquote { border-left: 4px solid #3b82f6; padding-left: 1rem; margin: 1rem 0; color: #6b7280; }
          </style>
        </head>
        <body class="bg-gray-50 p-8">
          <div class="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
            <h1 class="text-3xl font-bold mb-4">${formData.title}</h1>
            <p class="text-gray-600 mb-6">${formData.description}</p>
            <div class="prose">
              ${formData.content}
            </div>
          </div>
        </body>
        </html>
      `);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">
            加载中...
          </p>
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
            href="/admin/posts"
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
          >
            <svg className="mr-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            返回文章管理
          </Link>
        </nav>

        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            编辑文章
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            修改文章内容和设置
          </p>
        </header>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="">
          {/* 两栏布局 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 左栏 - 主要内容 */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">文章内容</h2>
                <div className="space-y-6">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      文章标题 *
                    </label>
                    <input
                      type="text"
                      id="title"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-lg"
                      placeholder="输入文章标题..."
                    />
                  </div>

              <div>
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      文章摘要 *
                    </label>
                    <textarea
                      id="description"
                      required
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="输入文章摘要..."
                    />
                  </div>
              </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      文章内容 *
                    </label>
                    <Editor
                      value={formData.content}
                      onChange={(value) => setFormData({ ...formData, content: value })}
                      onImageUpload={handleImageUpload}
                      onAudioUpload={handleAudioUpload}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 右栏 - 辅助信息 */}
            <div className="space-y-6">
              {/* 发布设置 */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">发布设置</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="is_published"
                      checked={formData.is_published}
                      onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="is_published" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      立即发布
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="is_featured"
                      checked={formData.is_featured}
                      onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="is_featured" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      设为置顶
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="allow_comments"
                      checked={formData.allow_comments}
                      onChange={(e) => setFormData({ ...formData, allow_comments: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="allow_comments" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      允许评论
                    </label>
                  </div>
                </div>
              </div>

              {/* 分类和标签 */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">分类和标签</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      文章分类
                    </label>
                    <select
                      id="category_id"
                      value={formData.category_id}
                      onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">选择分类...</option>
                      {Array.isArray(categories) && categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      标签选择
                    </label>
                    <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-md p-3 bg-white dark:bg-gray-700">
                      {tags.map((tag) => (
                        <label key={tag.id} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.selected_tags.includes(tag.id)}
                            onChange={(e) => {
                              const tagId = tag.id;
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  selected_tags: [...formData.selected_tags, tagId]
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  selected_tags: formData.selected_tags.filter(id => id !== tagId)
                                });
                              }
                            }}
                            className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">{tag.name}</span>
                        </label>
                      ))}
                      {tags.length === 0 && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          暂无标签，请先在 <Link href="/admin/tags" className="text-blue-600 hover:text-blue-800">标签管理</Link> 中创建标签
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>


              {/* 封面图片上传 */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">封面图片</h3>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    {coverImagePreview ? (
                      <div className="mb-4">
                        <img src={coverImagePreview} alt="封面预览" className="mx-auto h-32 w-auto rounded-md" />
                        <button
                          type="button"
                          onClick={() => {
                            setCoverImage(null);
                            setCoverImagePreview('');
                            setFormData({ ...formData, cover_image: '' });
                          }}
                          className="mt-2 text-sm text-red-600 hover:text-red-700"
                        >
                          移除图片
                        </button>
                      </div>
                    ) : (
                      <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                    <div className="flex text-sm text-gray-600 dark:text-gray-400">
                      <label htmlFor="cover_image" className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                        <span>上传封面图片</span>
                        <input id="cover_image" name="cover_image" type="file" accept="image/*" onChange={handleCoverImageChange} className="sr-only" />
                      </label>
                      <p className="pl-1">或拖拽文件到这里</p>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, GIF 最大 10MB</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={handlePreview}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="mr-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              预览
            </button>

            <div className="flex gap-4">
              <Link
                href="/admin/posts"
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                取消
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    更新中...
                  </>
                ) : (
                  <>
                    <svg className="mr-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    更新文章
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
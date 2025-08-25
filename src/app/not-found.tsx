import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center px-4">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gray-200 dark:text-gray-700 mb-4">
            404
          </h1>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            页面未找到
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            抱歉，您访问的页面不存在或已被移动。
          </p>
        </div>
        
        <div className="space-y-4">
          <Link
            href="/"
            className="inline-block w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            返回首页
          </Link>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <Link
              href="/posts"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 py-2"
            >
              浏览文章
            </Link>
            <Link
              href="/tags"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 py-2"
            >
              查看标签
            </Link>
          </div>
        </div>
        
      </div>
    </div>
  );
}
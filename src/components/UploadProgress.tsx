import { formatFileSize, getFileTypeDescription } from '@/lib/uploadUtils';

interface UploadProgressProps {
  file: File;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
  onCancel?: () => void;
}

export default function UploadProgress({ 
  file, 
  progress, 
  status, 
  error,
  onCancel 
}: UploadProgressProps) {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
      {/* 文件信息 */}
      <div className="flex items-center space-x-3 mb-3">
        <div className="flex-shrink-0">
          {status === 'uploading' && (
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          )}
          {status === 'success' && (
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
          {status === 'error' && (
            <div className="w-8 h-8 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {file.name}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {getFileTypeDescription(file.type)} • {formatFileSize(file.size)}
          </p>
        </div>

        {status === 'uploading' && onCancel && (
          <button
            onClick={onCancel}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            title="取消上传"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* 进度条 */}
      {status === 'uploading' && (
        <div className="space-y-2">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>正在上传...</span>
            <span>{progress}%</span>
          </div>
        </div>
      )}

      {/* 成功状态 */}
      {status === 'success' && (
        <div className="text-xs text-green-600 dark:text-green-400">
          ✅ 上传完成
        </div>
      )}

      {/* 错误状态 */}
      {status === 'error' && (
        <div className="text-xs text-red-600 dark:text-red-400">
          ❌ {error || '上传失败'}
        </div>
      )}
    </div>
  );
}
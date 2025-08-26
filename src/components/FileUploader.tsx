import { useState, useRef, useCallback } from 'react';
import { uploadFile, formatFileSize, validateFileType, UploadProgress, UploadResult } from '@/lib/uploadUtils';
import UploadProgressComponent from '@/components/UploadProgress';

interface FileUploaderProps {
  type: 'image' | 'audio' | 'cover';
  accept: string;
  maxSize: number; // 字节
  onUploadSuccess: (url: string) => void;
  onUploadError?: (error: string) => void;
  className?: string;
  children?: React.ReactNode;
}

interface UploadState {
  file: File | null;
  progress: number;
  status: 'idle' | 'uploading' | 'success' | 'error';
  error?: string;
}

export default function FileUploader({
  type,
  accept,
  maxSize,
  onUploadSuccess,
  onUploadError,
  className = '',
  children
}: FileUploaderProps) {
  const [uploadState, setUploadState] = useState<UploadState>({
    file: null,
    progress: 0,
    status: 'idle'
  });
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 获取允许的文件类型
  const getAllowedTypes = useCallback(() => {
    if (type === 'image') {
      return ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    } else if (type === 'audio') {
      return ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a', 'audio/aac'];
    } else {
      return ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    }
  }, [type]);

  // 验证和处理文件
  const processFile = useCallback(async (file: File) => {
    // 验证文件类型
    const allowedTypes = getAllowedTypes();
    if (!validateFileType(file, allowedTypes)) {
      const error = `不支持的文件类型，只支持: ${allowedTypes.map(t => t.split('/')[1].toUpperCase()).join(', ')}`;
      setUploadState({ file: null, progress: 0, status: 'error', error });
      onUploadError?.(error);
      return;
    }

    // 验证文件大小
    if (file.size > maxSize) {
      const error = `文件大小不能超过 ${formatFileSize(maxSize)}`;
      setUploadState({ file: null, progress: 0, status: 'error', error });
      onUploadError?.(error);
      return;
    }

    // 开始上传
    setUploadState({ file, progress: 0, status: 'uploading' });

    try {
      const result = await uploadFile(file, {
        type,
        onProgress: (progress: UploadProgress) => {
          setUploadState(prev => ({ ...prev, progress: progress.percentage }));
        },
        onSuccess: (result: UploadResult) => {
          if (result.success && result.data) {
            setUploadState(prev => ({ ...prev, status: 'success' }));
            onUploadSuccess(result.data.url);
            // 2秒后重置状态
            setTimeout(() => {
              setUploadState({ file: null, progress: 0, status: 'idle' });
            }, 2000);
          }
        },
        onError: (error: string) => {
          setUploadState(prev => ({ ...prev, status: 'error', error }));
          onUploadError?.(error);
        }
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '上传失败';
      setUploadState(prev => ({ ...prev, status: 'error', error: errorMessage }));
      onUploadError?.(errorMessage);
    }
  }, [type, maxSize, getAllowedTypes, onUploadSuccess, onUploadError]);

  // 文件选择处理
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    // 清空 input 值，允许重复选择同一文件
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [processFile]);

  // 拖拽处理
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  }, [processFile]);

  // 点击上传
  const handleClick = useCallback(() => {
    if (uploadState.status === 'uploading') return;
    fileInputRef.current?.click();
  }, [uploadState.status]);

  // 取消上传（暂不实现取消功能，但可以重置状态）
  const handleCancel = useCallback(() => {
    setUploadState({ file: null, progress: 0, status: 'idle' });
  }, []);

  return (
    <div className={className}>
      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* 上传区域或进度显示 */}
      {uploadState.status === 'idle' ? (
        <div
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
            ${isDragOver 
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10' 
              : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800'
            }
          `}
        >
          {children || (
            <div className="space-y-2">
              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="text-gray-600 dark:text-gray-400">
                <p>点击上传或拖拽文件到这里</p>
                <p className="text-sm">最大 {formatFileSize(maxSize)}</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <UploadProgressComponent
          file={uploadState.file!}
          progress={uploadState.progress}
          status={uploadState.status}
          error={uploadState.error}
          onCancel={uploadState.status === 'uploading' ? handleCancel : undefined}
        />
      )}
    </div>
  );
}
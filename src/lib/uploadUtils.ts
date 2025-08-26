export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadResult {
  success: boolean;
  data?: {
    url: string;
    filename: string;
    type: string;
    size: number;
  };
  error?: string;
}

export interface UploadOptions {
  type?: 'image' | 'audio' | 'cover' | 'general';
  onProgress?: (progress: UploadProgress) => void;
  onStart?: () => void;
  onSuccess?: (result: UploadResult) => void;
  onError?: (error: string) => void;
}

/**
 * 通用文件上传函数，支持进度回调
 */
export async function uploadFile(
  file: File, 
  options: UploadOptions = {}
): Promise<UploadResult> {
  const {
    type = 'general',
    onProgress,
    onStart,
    onSuccess,
    onError
  } = options;

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    
    formData.append('file', file);
    formData.append('type', type);

    // 上传进度监听
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        const progress: UploadProgress = {
          loaded: event.loaded,
          total: event.total,
          percentage: Math.round((event.loaded / event.total) * 100)
        };
        onProgress?.(progress);
      }
    });

    // 开始上传
    xhr.addEventListener('loadstart', () => {
      onStart?.();
    });

    // 上传完成
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const result: UploadResult = JSON.parse(xhr.responseText);
          onSuccess?.(result);
          resolve(result);
        } catch (error) {
          const errorMessage = '解析服务器响应失败';
          onError?.(errorMessage);
          reject(new Error(errorMessage));
        }
      } else {
        let errorMessage = '上传失败';
        try {
          const errorResult = JSON.parse(xhr.responseText);
          errorMessage = errorResult.error || errorMessage;
        } catch (e) {
          errorMessage = `上传失败 (${xhr.status})`;
        }
        onError?.(errorMessage);
        reject(new Error(errorMessage));
      }
    });

    // 上传错误
    xhr.addEventListener('error', () => {
      const errorMessage = '网络错误，上传失败';
      onError?.(errorMessage);
      reject(new Error(errorMessage));
    });

    // 上传超时
    xhr.addEventListener('timeout', () => {
      const errorMessage = '上传超时，请检查网络连接';
      onError?.(errorMessage);
      reject(new Error(errorMessage));
    });

    // 上传取消
    xhr.addEventListener('abort', () => {
      const errorMessage = '上传已取消';
      onError?.(errorMessage);
      reject(new Error(errorMessage));
    });

    // 配置请求
    xhr.open('POST', '/api/upload');
    xhr.withCredentials = true; // 支持 cookies
    xhr.timeout = 5 * 60 * 1000; // 5分钟超时

    // 发送请求
    xhr.send(formData);
  });
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/**
 * 验证文件类型
 */
export function validateFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.includes(file.type);
}

/**
 * 获取文件类型的中文描述
 */
export function getFileTypeDescription(type: string): string {
  const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const audioTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a', 'audio/aac'];
  
  if (imageTypes.includes(type)) return '图片';
  if (audioTypes.includes(type)) return '音频';
  return '文件';
}
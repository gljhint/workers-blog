'use client';

import React, { useState, useEffect } from 'react';
import MarkdownIt from 'markdown-it';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  placeholder = '请输入 Markdown 内容...',
  className = ''
}) => {
  const [preview, setPreview] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [md, setMd] = useState<MarkdownIt | null>(null);

  useEffect(() => {
    const markdownIt = new MarkdownIt({
      html: true,
      linkify: true,
      typographer: true,
    });
    setMd(markdownIt);
  }, []);

  useEffect(() => {
    if (md && value) {
      setPreview(md.render(value));
    } else {
      setPreview('');
    }
  }, [value, md]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const insertText = (before: string, after: string = '') => {
    const textarea = document.getElementById('markdown-textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);
    
    const newText = text.substring(0, start) + before + selectedText + after + text.substring(end);
    onChange(newText);

    // 恢复光标位置
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selectedText.length
      );
    }, 10);
  };

  return (
    <div className={`border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden ${className}`}>
      {/* 工具栏 */}
      <div className="bg-gray-50 dark:bg-gray-700 border-b border-gray-300 dark:border-gray-600 p-2 flex items-center gap-2">
        <button
          type="button"
          onClick={() => insertText('**', '**')}
          className="px-2 py-1 text-sm bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded hover:bg-gray-100 dark:hover:bg-gray-500"
          title="加粗"
        >
          <strong>B</strong>
        </button>
        
        <button
          type="button"
          onClick={() => insertText('*', '*')}
          className="px-2 py-1 text-sm bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded hover:bg-gray-100 dark:hover:bg-gray-500"
          title="斜体"
        >
          <em>I</em>
        </button>
        
        <button
          type="button"
          onClick={() => insertText('## ', '')}
          className="px-2 py-1 text-sm bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded hover:bg-gray-100 dark:hover:bg-gray-500"
          title="标题"
        >
          H
        </button>
        
        <button
          type="button"
          onClick={() => insertText('- ', '')}
          className="px-2 py-1 text-sm bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded hover:bg-gray-100 dark:hover:bg-gray-500"
          title="列表"
        >
          ≡
        </button>
        
        <button
          type="button"
          onClick={() => insertText('`', '`')}
          className="px-2 py-1 text-sm bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded hover:bg-gray-100 dark:hover:bg-gray-500"
          title="代码"
        >
          &lt;/&gt;
        </button>
        
        <button
          type="button"
          onClick={() => insertText('[', '](url)')}
          className="px-2 py-1 text-sm bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded hover:bg-gray-100 dark:hover:bg-gray-500"
          title="链接"
        >
          🔗
        </button>

        <div className="ml-auto">
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              showPreview 
                ? 'bg-blue-600 text-white' 
                : 'bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 hover:bg-gray-100 dark:hover:bg-gray-500'
            }`}
          >
            {showPreview ? '编辑' : '预览'}
          </button>
        </div>
      </div>

      {/* 编辑器内容 */}
      <div className="flex" style={{ height: '400px' }}>
        {/* 编辑区域 */}
        <div className={`${showPreview ? 'w-1/2 border-r border-gray-300 dark:border-gray-600' : 'w-full'}`}>
          <textarea
            id="markdown-textarea"
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            className="w-full h-full p-4 resize-none border-none outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm"
          />
        </div>

        {/* 预览区域 */}
        {showPreview && (
          <div className="w-1/2 overflow-auto">
            <div className="p-4 prose prose-sm dark:prose-invert max-w-none">
              {preview ? (
                <div dangerouslySetInnerHTML={{ __html: preview }} />
              ) : (
                <div className="text-gray-500 dark:text-gray-400 italic">
                  预览内容将显示在这里...
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarkdownEditor;
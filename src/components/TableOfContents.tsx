'use client';

import { useEffect, useState } from 'react';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
}

export default function TableOfContents({ content }: TableOfContentsProps) {
  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
    
    // 首先收集所有现有的ID
    const existingIds = new Set<string>();
    Array.from(headings).forEach(heading => {
      if (heading.id) {
        existingIds.add(heading.id);
      }
    });
    
    const items: TocItem[] = Array.from(headings).map((heading, index) => {
      // 生成更好的ID：优先使用现有ID，否则基于文本内容生成
      let id = heading.id;
      if (!id && heading.textContent) {
        id = heading.textContent
          .toLowerCase()
          .trim()
          .replace(/[^\u4e00-\u9fff\w\s-]/g, '') // 保留中文字符、英文字母、数字、空格和连字符
          .replace(/\s+/g, '-') // 将空格替换为连字符
          .replace(/-+/g, '-') // 合并多个连字符
          .replace(/^-|-$/g, ''); // 移除首尾连字符
        
        // 如果生成的ID为空或太短，使用索引作为后备
        if (!id || id.length < 2) {
          id = `heading-${index + 1}`;
        }
        
        // 确保ID唯一性
        let uniqueId = id;
        let counter = 1;
        
        while (existingIds.has(uniqueId)) {
          uniqueId = `${id}-${counter}`;
          counter++;
        }
        id = uniqueId;
        existingIds.add(id); // 添加到已存在的ID集合中
      }
      
      return {
        id: id || `heading-${index + 1}`,
        text: heading.textContent || '',
        level: parseInt(heading.tagName.charAt(1))
      };
    });

    setTocItems(items);

    // 为DOM中的标题添加生成的ID
    if (typeof document !== 'undefined') {
      // 等待DOM更新后再处理
      setTimeout(() => {
        const realHeadings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        Array.from(realHeadings).forEach((heading, index) => {
          if (!heading.id && items[index]) {
            heading.id = items[index].id;
          }
        });
      }, 100);
    }
  }, [content]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-80px 0px -80% 0px' }
    );

    tocItems.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [tocItems]);

  if (tocItems.length === 0) {
    return null;
  }

  return (
    <div className="sticky top-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">目录</h3>
        <nav className="space-y-1">
          {tocItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={`block text-sm transition-colors duration-200 ${
                activeId === item.id
                  ? 'text-blue-600 dark:text-blue-400 font-medium'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
              style={{
                paddingLeft: `${(item.level - 1) * 12}px`,
              }}
              onClick={(e) => {
                e.preventDefault();
                const element = document.getElementById(item.id);
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
            >
              {item.text}
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
}
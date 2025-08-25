'use client';

import { useState } from 'react';
import Link from 'next/link';

interface MenuItem {
  id: number;
  name: string;
  label: string;
  url: string;
  icon?: string;
  target: '_self' | '_blank';
  is_active: boolean;
  children?: MenuItem[];
}

interface MobileMenuProps {
  menuItems: MenuItem[];
}

export function MobileMenuButton({ menuItems }: { menuItems: MenuItem[] }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors"
        aria-expanded="false"
        aria-label={isOpen ? "关闭菜单" : "打开菜单"}
      >
        <svg 
          className={`${isOpen ? 'hidden' : 'block'} h-6 w-6`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        <svg 
          className={`${isOpen ? 'block' : 'hidden'} h-6 w-6`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      
      {/* 移动端菜单覆盖层 */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-25" onClick={() => setIsOpen(false)} />
          <div className="fixed top-0 right-0 w-full max-w-sm h-full bg-white dark:bg-gray-800 shadow-xl transform transition-transform">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">菜单</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <MobileMenu menuItems={menuItems} onItemClick={() => setIsOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}

export function MobileMenu({ menuItems, onItemClick }: MobileMenuProps & { onItemClick?: () => void }) {
  const [expandedItems, setExpandedItems] = useState<number[]>([]);

  const toggleExpanded = (itemId: number) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  return (
    <div className="px-4 py-2 space-y-1 max-h-screen overflow-y-auto">
      {menuItems.map((menu) => (
        <div key={menu.id}>
          <div className="flex items-center justify-between">
            <Link
              href={menu.url}
              target={menu.target}
              onClick={onItemClick}
              className="flex-1 block px-3 py-3 text-base font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
            >
              {menu.label}
            </Link>
            
            {/* 子菜单展开按钮 */}
            {menu.children && menu.children.length > 0 && (
              <button
                onClick={() => toggleExpanded(menu.id)}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <svg 
                  className={`h-5 w-5 transform transition-transform ${
                    expandedItems.includes(menu.id) ? 'rotate-180' : ''
                  }`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            )}
          </div>
          
          {/* 子菜单 */}
          {menu.children && menu.children.length > 0 && expandedItems.includes(menu.id) && (
            <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-200 dark:border-gray-600 pl-4">
              {menu.children.map((child) => (
                <Link
                  key={child.id}
                  href={child.url}
                  target={child.target}
                  onClick={onItemClick}
                  className="block px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
                >
                  {child.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      ))}
      
      {/* 快捷链接 */}
      <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-600">
        <p className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          快捷操作
        </p>
        <div className="mt-2 space-y-1">
          <Link
            href="/posts"
            onClick={onItemClick}
            className="flex items-center px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
          >
            <svg className="mr-3 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            所有文章
          </Link>
          <Link
            href="/categories"
            onClick={onItemClick}
            className="flex items-center px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
          >
            <svg className="mr-3 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            文章分类
          </Link>
          <Link
            href="/tags"
            onClick={onItemClick}
            className="flex items-center px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
          >
            <svg className="mr-3 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            标签云
          </Link>
        </div>
      </div>
    </div>
  );
}
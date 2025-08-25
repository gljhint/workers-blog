import Link from 'next/link';
import { getActiveMenus } from '@/models/MenuModel';
import { SiteSettingsService } from '@/services/SiteSettingsService';
import { MobileMenuButton } from '@/components/MobileMenu';

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

export default async function Navigation() {
  const siteSettingsService = SiteSettingsService.getInstance();
  const siteTitle = await siteSettingsService.getSetting('site_title', '我的博客');
  
  // 获取菜单
  const [menus] = await Promise.all([
    getActiveMenus()
  ]);

  const allMenuItems: MenuItem[] = [
    ...menus.map(menu => ({
      id: menu.id,
      name: `menu-${menu.id}`,
      label: menu.title,
      url: menu.url,
      icon: menu.icon || undefined,
      target: (menu.target as '_self' | '_blank') || '_self',
      is_active: Boolean(menu.is_active),
      children: []
    }))
  ];

  // 按菜单顺序排序
  const sortedMenuItems = allMenuItems.sort((a, b) => {
    const aOrder = menus.find(p => p.id === a.id)?.menu_order || 0;
    
    if (a.name?.startsWith('page-') && b.name?.startsWith('page-')) {
      return aOrder - aOrder;
    }
    
    return 0;
  });

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link 
              href="/" 
              className="text-xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              {siteTitle}
            </Link>
          </div>

          <div className="hidden md:block">
            <div className="flex items-center space-x-8">
              {sortedMenuItems.map((menu) => (
                <div key={menu.id} className="relative group">
                  <Link
                    href={menu.url}
                    target={menu.target}
                    className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 text-sm font-medium transition-colors"
                  >
                    {menu.label}
                  </Link>
                  
                  {menu.children && menu.children.length > 0 && (
                    <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                      <div className="py-1">
                        {menu.children.map((child) => (
                          <Link
                            key={child.id}
                            href={child.url}
                            target={child.target}
                            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 移动端菜单按钮 */}
          <MobileMenuButton menuItems={sortedMenuItems} />
        </div>
      </div>
    </nav>
  );
}
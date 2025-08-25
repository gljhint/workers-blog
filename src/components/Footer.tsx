import { SiteSettingsService } from '@/services/SiteSettingsService';

export default async function Footer() {
  const siteSettingsService = SiteSettingsService.getInstance();
  const siteFooter = await siteSettingsService.getSiteFooter();
  const siteTitle = await siteSettingsService.getSiteTitle();

  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            {siteFooter}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            
          </p>
        </div>
      </div>
    </footer>
  );
}
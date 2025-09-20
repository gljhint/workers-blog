import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { findPageBySlug } from '@/models/PageModel';
import { SiteSettingsService } from '@/services/SiteSettingsService';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

const siteSettingsService = SiteSettingsService.getInstance();

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const page = await findPageBySlug(resolvedParams.slug);
  
  if (!page) {
    return {
      title: '页面不存在'
    };
  }

  const siteTitle = await siteSettingsService.getSetting('site_title', '我的博客');
  const pageTitle = page.meta_title || page.title;
  
  return {
    title: `${pageTitle} - ${siteTitle}`,
    description: page.meta_description,
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/pages/${page.slug}`,
    },
    openGraph: {
      title: pageTitle,
      description: page.meta_description || '',
      type: 'article'
    }
  };
}

export default async function PageDetail({ params }: PageProps) {
  const resolvedParams = await params;
  const page = await findPageBySlug(resolvedParams.slug);
  
  if (!page) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">

      <div className="max-w-7xl mx-auto px-4 py-8">
        <article className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          {/* 页面头部 */}
          <header className="px-8 py-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {page.title}
              </h1>
              {page.meta_description && (
                <p className="text-xl text-blue-100 max-w-3xl mx-auto">
                  {page.meta_description}
                </p>
              )}
            </div>
          </header>

          {/* 页面内容 */}
          <div className="px-8 py-12">
            <div 
              className="prose prose-lg max-w-none dark:prose-invert
                         prose-headings:text-gray-900 dark:prose-headings:text-white
                         prose-p:text-gray-700 dark:prose-p:text-gray-300
                         prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
                         prose-strong:text-gray-900 dark:prose-strong:text-white
                         prose-code:text-pink-600 dark:prose-code:text-pink-400 prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
                         prose-pre:bg-gray-900 dark:prose-pre:bg-gray-800 prose-pre:text-gray-100
                         prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 dark:prose-blockquote:bg-blue-900/20 prose-blockquote:py-4 prose-blockquote:px-6
                         prose-ul:text-gray-700 dark:prose-ul:text-gray-300
                         prose-ol:text-gray-700 dark:prose-ol:text-gray-300
                         prose-li:text-gray-700 dark:prose-li:text-gray-300
                         prose-table:text-gray-700 dark:prose-table:text-gray-300
                         prose-th:bg-gray-100 dark:prose-th:bg-gray-800
                         prose-td:border-gray-200 dark:prose-td:border-gray-700"
              dangerouslySetInnerHTML={{ __html: page.content }}
            />

            {/* 页面信息 */}
            <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <div>
                  最后更新: {new Date(page.updated_at).toLocaleDateString('zh-CN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
            </div>
          </div>
        </article>
      </div>

    </div>
  );
}

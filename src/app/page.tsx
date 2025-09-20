import { Metadata } from 'next';
import Link from 'next/link';
import { getAllPosts } from '@/lib/blog';
import PostCard from '@/components/PostCard';
import Sidebar from '@/components/Sidebar';
import { SiteSettingsService } from '@/services/SiteSettingsService';
import { getAllTags, getAllCategories } from '@/lib/blog';
import { HomeStatsService } from '@/services/HomeStatsService';
import { Suspense } from 'react';
export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const siteSettingsService = SiteSettingsService.getInstance();
  const siteSettings = await siteSettingsService.getAllSettings();
  
  return {
    title: siteSettings.site_title,
    description: siteSettings.site_description,
    openGraph: {
      title: siteSettings.site_title,
      description: siteSettings.site_description,
      type: 'website',
      url: siteSettings.site_url,
    },
    twitter: {
      card: 'summary_large_image',
      title: siteSettings.site_title,
      description: siteSettings.site_description,
    },
  };
}

function SidebarWrapper({ tags, categories }: { tags: any[], categories: any[] }) {
  return (
    <Suspense fallback={
      <div className="lg:col-span-1">
        <div className="sticky top-8 space-y-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md animate-pulse">
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-4"></div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded"></div>
              <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    }>
      <SidebarData tags={tags} categories={categories} />
    </Suspense>
  );
}

async function SidebarData({ tags, categories }: { tags: any[], categories: any[] }) {
  const siteSettings = await SiteSettingsService.getInstance().getAllSettings();
  const { totalPosts, totalViews } = await HomeStatsService.getStats();

  return (
    <Sidebar
      categories={categories}
      tags={tags}
      totalPosts={totalPosts}
      totalViews={totalViews}
      introduction={siteSettings.introduction}
    />
  );
}

export default async function Home() {
  // 一次性获取所有需要的数据
  const [siteSettings, posts, tags, categories] = await Promise.all([
    SiteSettingsService.getInstance().getAllSettings(),
    getAllPosts(),
    getAllTags(),
    getAllCategories()
  ]);

  // 首页显示的文章数量使用设置的一半，至少3篇
  const homePostsCount = Math.max(3, Math.floor(siteSettings.posts_per_page / 2));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {siteSettings.site_title}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {siteSettings.site_description}
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <main className="lg:col-span-3">
            <section className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  最新文章
                </h2>
                <Link
                  href="/posts"
                  prefetch={true}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-all duration-200 hover:translate-x-1"
                >
                  查看全部 →
                </Link>
              </div>
              
              <div className="grid gap-6">
                {posts.length > 0 ? (
                  posts.slice(0, homePostsCount).map((post, index) => (
                    <PostCard key={post.id} post={post} isPriority={index === 0} />
                  ))
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500 dark:text-gray-400 text-lg">
                      暂无文章，敬请期待...
                    </p>
                  </div>
                )}
              </div>
            </section>
          </main>

          <SidebarWrapper tags={tags} categories={categories} />
        </div>
      </div>
  );
}

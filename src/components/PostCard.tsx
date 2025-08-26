import Link from 'next/link';
import Image from 'next/image';
import { PostMetadata } from '@/lib/types';
import { formatDate } from '@/lib/blog';
import { generateCategoryColor } from '@/lib/colors';

interface PostCardProps {
  post: PostMetadata;
}

export default function PostCard({ post }: PostCardProps) {
  const categoryColor = post.category ? generateCategoryColor(post.category.id) : undefined;
  return (
    <article className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      {post.cover_image && (
        <div className="relative h-48 w-full overflow-hidden">
          <Image
            src={post.cover_image}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-300 hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={false}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
          />
        </div>
      )}
      
      <div className="p-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
          <time dateTime={post.published_at || post.created_at}>
            {formatDate(post.published_at || post.created_at)}
          </time>
          {post.category && (
            <>
              <span>•</span>
              <Link
                href={`/categories/${post.category.slug}`}
                prefetch={true}
                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium hover:opacity-80 transition-all duration-200 hover:scale-105"
                style={{ backgroundColor: categoryColor + '20', color: categoryColor }}
              >
                {post.category.name}
              </Link>
            </>
          )}
          {post.view_count > 0 && (
            <>
              <span>•</span>
              <span>{post.view_count} 次浏览</span>
            </>
          )}
        </div>
        
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          <Link 
            href={`/posts/${post.slug}`}
            prefetch={true}
            className="block"
          >
            {post.title}
          </Link>
        </h2>
        
        {post.description && (
          <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
            {post.description}
          </p>
        )}
        
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags?.map((tag) => (
            <Link
              key={tag.id}
              href={`/tags/${tag.slug}`}
              prefetch={true}
              className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition-all duration-200 hover:scale-105"
            >
              {tag.name}
            </Link>
          ))}
        </div>
        
        <Link
          href={`/posts/${post.slug}`}
          prefetch={true}
          className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-all duration-200 hover:translate-x-1"
        >
          阅读更多
          <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </article>
  );
}
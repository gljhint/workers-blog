import Link from 'next/link';
import { PostMetadata } from '@/lib/types';
import { formatDate } from '@/lib/blog';

interface RelatedPostsProps {
  posts: PostMetadata[];
  currentPostId: number;
}

export default function RelatedPosts({ posts, currentPostId }: RelatedPostsProps) {
  const relatedPosts = posts
    .filter(post => post.id !== currentPostId)
    .slice(0, 5);

  if (relatedPosts.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">相关文章</h3>
      <div className="space-y-3">
        {relatedPosts.map((post) => (
          <article key={post.id}>
            <Link 
              href={`/posts/${post.slug}`}
              className="block group"
            >
              <h4 className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 mb-1">
                {post.title}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatDate(post.published_at || post.created_at)}
              </p>
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
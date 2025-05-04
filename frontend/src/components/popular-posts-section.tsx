import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Post from '@/types/post-type';
import axiosInstance from '@/helpers/axios-instance';
import formatPostTime from '@/utils/format-post-time';
import CategoryPill from '@/components/category-pill';
import { createSlug } from '@/utils/slug-generator';

const PopularPostsSection = () => {
  const [popularPosts, setPopularPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPopularPosts = async () => {
      try {
        setLoading(true);
        // Fetch all posts and sort them by viewCount on the client side
        // In a production environment, you would ideally have a dedicated API endpoint for this
        const res = await axiosInstance.get('/api/posts');
        const sortedPosts = [...res.data].sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0)).slice(0, 5);
        setPopularPosts(sortedPosts);
      } catch (error) {
        console.error('Error fetching popular posts:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPopularPosts();
  }, []);

  if (popularPosts.length === 0 && !loading) {
    return null;
  }

  return (
    <div className="sidebar-section my-6 p-4 rounded-lg bg-white shadow-md dark:bg-dark-card">
      <h2 className="mb-4 text-lg font-semibold text-light-title dark:text-dark-primary border-b pb-2 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
        Trending Now
      </h2>
      <div className="flex flex-col space-y-3">
        {popularPosts.map((post, index) => {
          const slug = createSlug(post.title);
          return (
            <div 
              key={post._id}
              className="cursor-pointer flex items-start border-b border-gray-100 dark:border-gray-800 pb-3 last:border-0 transition-colors hover:bg-gray-50 dark:hover:bg-gray-900 rounded-md"
              onClick={() => navigate(`/details-page/${slug}/${post._id}`, { state: { post } })}
            >
              <div className="flex-shrink-0 relative w-16 h-16 overflow-hidden rounded-md mr-3">
                <img
                  src={post.imageLink}
                  alt={post.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute top-0 right-0 bg-black/70 text-white text-xs px-1 py-0.5 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span>{post.viewCount || 0}</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="line-clamp-2 text-sm font-medium text-light-title dark:text-dark-title">
                  {post.title}
                </h3>
                <div className="mt-1 flex items-center text-xs text-light-info dark:text-dark-info">
                  <span className="truncate">{post.authorName}</span>
                  <span className="mx-1">•</span>
                  <span>{formatPostTime(post.timeOfPost)}</span>
                </div>
                {post.categories.length > 0 && (
                  <div className="mt-1">
                    <CategoryPill category={post.categories[0]} />
                  </div>
                )}
              </div>
              <div className="flex-shrink-0 ml-1 text-gray-400">
                <span className="text-xs font-medium">#{index + 1}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PopularPostsSection;
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Post from '@/types/post-type';
import formatPostTime from '@/utils/format-post-time';
import CategoryPill from '@/components/category-pill';
import { createSlug } from '@/utils/slug-generator';
import { TestProps } from '@/types/test-props';
import axiosInstance from '@/helpers/axios-instance';
import useAuthData from '@/hooks/useAuthData';
import { toast } from 'react-toastify';

export default function PostCard({ post, testId = 'postcard' }: { post: Post } & TestProps) {
  const navigate = useNavigate();
  const slug = createSlug(post.title);
  const { token } = useAuthData();
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    // Check if the post is already in favorites when component mounts
    if (token) {
      checkIsFavorite();
    }
  }, [token, post._id]);

  const checkIsFavorite = async () => {
    try {
      const response = await axiosInstance.get(`/api/favorites/check/${post._id}`);
      if (response.data.success) {
        setIsFavorite(response.data.isFavorite);
      }
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation to details page
    
    if (!token) {
      toast.info('Please sign in to save articles');
      navigate('/signin');
      return;
    }

    try {
      if (isFavorite) {
        const response = await axiosInstance.delete(`/api/favorites/${post._id}`);
        if (response.data.success) {
          setIsFavorite(false);
          toast.success('Removed from saved articles');
        }
      } else {
        const response = await axiosInstance.post('/api/favorites', { newsId: post._id });
        if (response.data.success) {
          setIsFavorite(true);
          toast.success('Article saved successfully');
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to save article. Please try again.');
    }
  };

  return (
    <div
      className={`active:scale-click group w-full sm:w-1/2 lg:w-1/3 xl:w-1/4`}
      data-testid={testId}
    >
      <div
        className={`mb-4 cursor-pointer rounded-lg bg-light shadow-md dark:bg-dark-card ${'sm:mr-8 sm:mt-4'} relative`}
        onClick={() => navigate(`/details-page/${slug}/${post._id}`, { state: { post } })}
      >
        <button 
          onClick={toggleFavorite}
          className="absolute right-2 top-2 z-10 rounded-full bg-white p-1.5 shadow-md hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700"
          title={isFavorite ? "Remove from saved" : "Save article"}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className={`h-5 w-5 ${isFavorite ? 'text-blue-500' : 'text-gray-500'}`} 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
          </svg>
        </button>
        <div className="h-48 w-full overflow-hidden">
          <img
            src={post.imageLink}
            alt={post.title}
            className={`sm:group-hover:scale-hover h-full w-full rounded-t-lg object-cover transition-transform ease-in-out`}
          />
        </div>
        <div className="p-3">
          <div className="mb-1 text-xs text-light-info dark:text-dark-info">
            {post.authorName} • {formatPostTime(post.timeOfPost)}
          </div>
          <h2 className="mb-2 line-clamp-1 text-base font-semibold text-light-title dark:text-dark-title">
            {post.title}
          </h2>
          <p className="line-clamp-2 text-sm text-light-description dark:text-dark-description">
            {post.description.split('\n')[0]}
          </p>
          <div className="mt-4 flex gap-2">
            {post.categories.slice(0, 3).map((category, index) => (
              <CategoryPill key={`${category}-${index}`} category={category} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import navigateBackWhiteIcon from '@/assets/svg/navigate-back-white.svg';
import arrowRightWhiteIcon from '@/assets/svg/arrow-right-white.svg';
import arrowRightBlackIcon from '@/assets/svg/arrow-right-black.svg';
import formatPostTime from '@/utils/format-post-time';
import CategoryPill from '@/components/category-pill';
import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import Post from '@/types/post-type';
import axiosInstance from '@/helpers/axios-instance';
import { PostCardSkeleton } from '@/components/skeletons/post-card-skeleton';
import PostCard from '@/components/post-card';
import PostMobileViewComponent from '@/components/PostMobileViewComponent';
import { PostMobileViewCardSkeleton } from '@/components/PostMobileViewCardSkeleton';
import PenIcon from '@/assets/svg/pen-icon';
import TrasnIcon from '@/assets/svg/trash-icon';
import { toast } from 'react-toastify';
import useAuthData from '@/hooks/useAuthData';
import CommentSection from '@/components/CommentSection';
import { DetailsPageSkeleton } from '@/components/skeletons/details-page-skeleton';
import BannerAd from '@/components/banner-ad';

export default function DetailsPage() {
  const { state } = useLocation();
  const [post, setPost] = useState<Post | null>(state?.post || null);
  const [loading, setIsLoading] = useState(true);
  const { postId } = useParams();
  const navigate = useNavigate();
  const [relatedCategoryPosts, setRelatedCategoryPosts] = useState<Post[]>([]);
  const [relatedPostsLoading, setRelatedPostsLoading] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  const userData = useAuthData();

  useEffect(() => {
    const theme = localStorage.getItem('theme');
    setIsDarkMode(theme === 'dark');
  }, []);

  // Check if the post is already in favorites when component mounts
  useEffect(() => {
    if (userData.token && postId) {
      checkIsFavorite();
    }
  }, [userData.token, postId]);
  
  // Fetch post data when component mounts or postId changes
  useEffect(() => {
    if (postId) {
      getPostById();
    }
  }, [postId]);

  const checkIsFavorite = async () => {
    try {
      const response = await axiosInstance.get(`/api/favorites/check/${postId}`);
      if (response.data.success) {
        setIsFavorite(response.data.isFavorite);
      }
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const toggleFavorite = async () => {
    if (!userData.token) {
      toast.info('Please sign in to save articles');
      navigate('/signin');
      return;
    }

    try {
      if (isFavorite) {
        await axiosInstance.delete(`/api/favorites/${postId}`);
        setIsFavorite(false);
        toast.success('Removed from saved articles');
      } else {
        await axiosInstance.post('/api/favorites', { newsId: postId });
        setIsFavorite(true);
        toast.success('Article saved successfully');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to save article. Please try again.');
    }
  };

  const handleDeleteClick = async () => {
    let url = `/api/posts/${postId}`;
    if (userData?.role === 'ADMIN') {
      url = `/api/posts/admin/${postId}`;
    }
    try {
      const resposne = await axios.delete(import.meta.env.VITE_API_PATH + url, {
        withCredentials: true,
      });
      if (resposne.status === 200) {
        toast.success('Successfully post deleted!');
        navigate('/');
      }
    } catch (error) {
      console.log(error);
      toast.error('something went wrong');
    }
  };

  const getPostById = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(import.meta.env.VITE_API_PATH + `/api/posts/${postId}`);
      setPost(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching post:', error);
      toast.error('Failed to load article');
      setIsLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    const fetchRelatedCategoryPosts = async () => {
      if (!post || !post.categories || post.categories.length === 0) return;
      
      try {
        setRelatedPostsLoading(true);
        const res = await axiosInstance.get('/api/posts/related-posts-by-category', {
          params: {
            categories: post.categories,
          },
        });
        setRelatedCategoryPosts(res.data);
        setRelatedPostsLoading(false);
      } catch (err) {
        console.error('Error fetching related posts:', err);
        setRelatedPostsLoading(false);
      }
    };
    fetchRelatedCategoryPosts();
  }, [post?.categories]);

  if (loading) {
    return <DetailsPageSkeleton />;
  }
  
  if (!post) {
    return (
      <div className="flex-grow flex items-center justify-center bg-light dark:bg-dark">
        <div className="text-center p-8">
          <h2 className="text-2xl font-semibold mb-4 dark:text-white">Article Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">The article you're looking for doesn't exist or has been removed.</p>
          <button 
            onClick={() => navigate('/')} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }
  
  return (
      <div className="flex-grow bg-light dark:bg-dark">
        <div className="relative flex flex-col">
          <img src={post.imageLink} alt={post.title} className="h-80 w-full object-cover sm:h-96" />
          <div className="absolute left-0 top-0 h-full w-full bg-slate-950/60"></div>
          <div className="absolute top-12 flex w-full cursor-pointer justify-between px-2 text-lg text-slate-50 sm:top-20 sm:px-8 sm:text-xl lg:px-12 lg:text-2xl">
            <img
              alt="white"
              src={navigateBackWhiteIcon}
              className="active:scale-click h-5 w-10"
              onClick={() => navigate(-1)}
            />

            <div className="flex gap-4">
              {/* Save Button */}
              {userData?.role === 'ADMIN' && (
                <>
                  <button onClick={handleDeleteClick}>
                    <TrasnIcon />
                  </button>
                  <button onClick={() => navigate(`/edit-blog/${postId}`, { state: { post } })}>
                    <PenIcon />
                  </button>
                </>
              )}
            </div>
          </div>
          <div className="absolute bottom-6 w-full max-w-xl px-4 text-slate-50 sm:bottom-8 sm:max-w-3xl sm:px-8 lg:bottom-12 lg:max-w-5xl lg:px-12">
            <div className="mb-4 flex space-x-2">
              {post.categories.map((category: string, idx: number) => (
                <CategoryPill key={idx} category={category} />
              ))}
            </div>
            <h1 className="mb-4 text-xl font-semibold sm:text-2xl lg:text-3xl">{post.title}</h1>
            <p className="text-xs font-semibold text-dark-secondary sm:text-sm">
              {post.authorName}
            </p>
            <p className="text-xs text-dark-secondary/80 sm:text-sm">
              {formatPostTime(post.timeOfPost)}
            </p>
          </div>
        </div>

        {/* Main content with sidebars */}
        <div className="relative mx-auto max-w-7xl px-4 py-10">
          <div className="flex flex-col lg:flex-row lg:gap-8">
            {/* Left sidebar - only visible on large screens */}
            <div className="hidden lg:block lg:w-1/6 sticky top-24 self-start">
              <BannerAd position="sidebar_left" />
            </div>

            {/* Main content */}
            <div className="w-full lg:w-4/6">
              <div className="w-full">
                {post.template === 'image-middle' && post.midImageLink ? (
                  (() => {
                    const paragraphs = post.description.split('\n');
                    const midIndex = Math.floor(paragraphs.length / 2);
                    // Fallback: If there are no paragraphs or midImageLink is missing, render image below
                    if (!paragraphs.length || !post.midImageLink) {
                      return (
                        <>
                          {paragraphs.map((paragraph, index) => (
                            paragraph.trim() ? (
                              <p key={index} className="mb-4 leading-7 text-light-secondary dark:text-dark-secondary sm:text-lg">
                                {paragraph}
                              </p>
                            ) : <br key={index} />
                          ))}
                          <img
                            src={post.midImageLink}
                            alt="middle"
                            className="w-full max-h-60 object-cover rounded mb-6"
                          />
                        </>
                      );
                    }
                    return (
                      <>
                        {paragraphs.map((paragraph, index) => (
                          <>
                            {index === midIndex && (
                              <img
                                src={post.midImageLink}
                                alt="middle"
                                className="w-full max-h-60 object-cover rounded mb-6"
                              />
                            )}
                            {paragraph.trim() ? (
                              <p key={index} className="mb-4 leading-7 text-light-secondary dark:text-dark-secondary sm:text-lg">
                                {paragraph}
                              </p>
                            ) : <br key={index} />}
                          </>
                        ))}
                      </>
                    );
                  })()
                ) : post.template === 'quote-start' && post.quote ? (
                  <>
                    <blockquote className="mb-6 border-l-4 border-purple-400 pl-4 italic text-lg text-gray-700 dark:text-gray-300">
                      {post.quote}
                    </blockquote>
                    {post.description.split('\n').map((paragraph, index) => (
                      paragraph.trim() ? (
                        <p key={index} className="mb-4 leading-7 text-light-secondary dark:text-dark-secondary sm:text-lg">
                          {paragraph}
                        </p>
                      ) : <br key={index} />
                    ))}
                  </>
                ) : (
                  post.description.split('\n').map((paragraph, index) => (
                    paragraph.trim() ? (
                      <p key={index} className="mb-4 leading-7 text-light-secondary dark:text-dark-secondary sm:text-lg">
                        {paragraph}
                      </p>
                    ) : <br key={index} />
                  ))
                )}
              </div>

              {/* Comment Section */}
              <CommentSection newsId={postId || ''} />
            </div>

            {/* Right sidebar - only visible on large screens */}
            <div className="hidden lg:block lg:w-1/6 sticky top-24 self-start">
              <BannerAd position="sidebar_right" />
            </div>
          </div>
        </div>
        
        {/* Mobile banner - only visible on small/medium screens */}
        <div className="block lg:hidden px-4">
          <BannerAd position="sidebar" />
        </div>
        
        <div className="container mx-auto flex flex-col space-y-2 px-4 py-6 dark:text-white">
          <div className="flex justify-between text-2xl font-semibold ">
            <div>Related News</div>
            <div className="flex cursor-pointer items-center text-sm text-gray-400 hover:underline sm:mr-10">
              <Link to="/">
                <div>see more News</div>
              </Link>
              <img
                alt="arrow-right"
                src={isDarkMode ? arrowRightWhiteIcon : arrowRightBlackIcon}
                className="active:scale-click h-8 w-8"
              />
            </div>
          </div>
          <div className="block space-y-4 sm:hidden">
            {relatedPostsLoading
              ? Array(3)
                  .fill(0)
                  .map((_, index) => <PostMobileViewCardSkeleton key={index} />)
              : relatedCategoryPosts
                  .slice(0, 3)
                  .map((post) => <PostMobileViewComponent key={post._id} post={post} />)}
          </div>
          <div className="hidden sm:flex sm:flex-wrap sm:p-3">
            {relatedPostsLoading
              ? Array(4)
                  .fill(0)
                  .map((_, index) => <PostCardSkeleton key={index} />)
              : relatedCategoryPosts
                  .slice(0, 4)
                  .map((post) => <PostCard key={post._id} post={post} />)}
          </div>
        </div>
      </div>
    );
}
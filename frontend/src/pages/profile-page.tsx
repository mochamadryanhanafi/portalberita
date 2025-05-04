import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '@/helpers/axios-instance';
import useAuthData from '@/hooks/useAuthData';
import userState from '@/utils/user-state';
import PostCard from '@/components/post-card';
import Post from '@/types/post-type';
import { PostCardSkeleton } from '@/components/skeletons/post-card-skeleton';
import { toast } from 'react-toastify';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { token, loading, _id } = useAuthData();
  const [activeTab, setActiveTab] = useState('favorites');
  const [favorites, setFavorites] = useState<Post[]>([]);
  const [saved, setSaved] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshData, setRefreshData] = useState(false);
  const userData = userState.getUser();

  useEffect(() => {
    if (!token && !loading) {
      navigate('/signin');
    }
  }, [token, loading, navigate]);

  useEffect(() => {
    const fetchUserContent = async () => {
      setIsLoading(true);
      try {
        // Fetch favorites
        const favoritesResponse = await axiosInstance.get('/api/favorites');
        if (favoritesResponse.data && favoritesResponse.data.success && favoritesResponse.data.favorites) {
          const allFavorites = favoritesResponse.data.favorites || [];
          
          // For demonstration purposes, we'll split the favorites into two categories
          // In a real implementation, you would have separate endpoints for favorites and saved
          setFavorites(allFavorites);
          setSaved(allFavorites);
        } else {
          console.error('Unexpected favorites response format:', favoritesResponse.data);
          setFavorites([]);
          setSaved([]);
        }
      } catch (error) {
        console.error('Error fetching user content:', error);
        toast.error('Failed to load your content. Please try again.');
        setFavorites([]);
        setSaved([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchUserContent();
    }
  }, [token, refreshData]);

  const removeFromFavorites = async (postId: string) => {
    try {
      await axiosInstance.delete(`/api/favorites/${postId}`);
      setFavorites(favorites.filter(post => post._id !== postId));
      // Also update saved list if the same post exists there
      setSaved(saved.filter(post => post._id !== postId));
      toast.success('Removed from favorites');
      setRefreshData(prev => !prev); // Trigger a refresh of the data
    } catch (error) {
      console.error('Error removing from favorites:', error);
      toast.error('Failed to remove from favorites');
    }
  };

  const removeFromSaved = async (postId: string) => {
    try {
      // Since the saved endpoint doesn't exist, use the regular favorites endpoint
      await axiosInstance.delete(`/api/favorites/${postId}`);
      setSaved(saved.filter(post => post._id !== postId));
      // Also update favorites list if the same post exists there
      setFavorites(favorites.filter(post => post._id !== postId));
      toast.success('Removed from saved articles');
      setRefreshData(prev => !prev); // Trigger a refresh of the data
    } catch (error) {
      console.error('Error removing from saved articles:', error);
      toast.error('Failed to remove from saved articles');
    }
  };

  return (
    <div className="flex-grow bg-light dark:bg-dark p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-light-title dark:text-dark-title sm:text-3xl">
            My Profile
          </h1>
          <p className="mt-2 text-light-description dark:text-dark-description">
            Manage your favorite and saved articles
          </p>
        </div>

        {/* Profile Info */}
        <div className="mb-8 flex items-center">
          <div className="mr-4 h-16 w-16 overflow-hidden rounded-full bg-gray-200">
            {userData?.avatar ? (
              <img 
                src={userData.avatar} 
                alt="Profile" 
                className="h-full w-full object-cover" 
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-blue-500 text-xl font-bold text-white">
                {userData?.fullName?.charAt(0) || 'U'}
              </div>
            )}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-light-title dark:text-dark-title">
              {userData?.fullName || 'User'}
            </h2>
            <button 
              onClick={() => navigate('/profile-settings')} 
              className="mt-1 text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Edit Profile
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex -mb-px">
            <button
              className={`mr-4 py-2 px-1 ${activeTab === 'favorites' ? 'border-b-2 border-blue-500 font-medium text-blue-500' : 'text-light-tertiary dark:text-dark-tertiary'}`}
              onClick={() => setActiveTab('favorites')}
            >
              Favorites
            </button>
            <button
              className={`mr-4 py-2 px-1 ${activeTab === 'saved' ? 'border-b-2 border-blue-500 font-medium text-blue-500' : 'text-light-tertiary dark:text-dark-tertiary'}`}
              onClick={() => setActiveTab('saved')}
            >
              Saved Articles
            </button>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex flex-wrap">
            {Array(4).fill(0).map((_, index) => (
              <div key={index} className="w-full sm:w-1/2 lg:w-1/3 xl:w-1/4 p-2">
                <PostCardSkeleton />
              </div>
            ))}
          </div>
        ) : (
          <div>
            {activeTab === 'favorites' && (
              <div>
                {favorites.length === 0 ? (
                  <div className="py-8 text-center text-light-tertiary dark:text-dark-tertiary">
                    <p>You haven't added any favorites yet.</p>
                    <button 
                      onClick={() => navigate('/')} 
                      className="mt-4 rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                    >
                      Browse Articles
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-wrap">
                    {favorites.map((post) => (
                      <div key={post._id} className="relative w-full sm:w-1/2 lg:w-1/3 xl:w-1/4 p-2">
                        <button 
                          onClick={() => removeFromFavorites(post._id)}
                          className="absolute right-4 top-4 z-10 rounded-full bg-white p-1 shadow-md hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700"
                          title="Remove from favorites"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <PostCard post={post} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'saved' && (
              <div>
                {saved.length === 0 ? (
                  <div className="py-8 text-center text-light-tertiary dark:text-dark-tertiary">
                    <p>You haven't saved any articles yet.</p>
                    <button 
                      onClick={() => navigate('/')} 
                      className="mt-4 rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                    >
                      Browse Articles
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-wrap">
                    {saved.map((post) => (
                      <div key={post._id} className="relative w-full sm:w-1/2 lg:w-1/3 xl:w-1/4 p-2">
                        <button 
                          onClick={() => removeFromSaved(post._id)}
                          className="absolute right-4 top-4 z-10 rounded-full bg-white p-1 shadow-md hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700"
                          title="Remove from saved"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                          </svg>
                        </button>
                        <PostCard post={post} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
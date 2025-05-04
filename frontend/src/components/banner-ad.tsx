import { useEffect, useState } from 'react';
import axiosInstance from '@/helpers/axios-instance';

interface Banner {
  _id: string;
  imageUrl: string;
  targetUrl: string;
  isActive: boolean;
  position: string;
  createdAt: string;
  updatedAt: string;
}

interface BannerAdProps {
  position: string;
}

const BannerAd = ({ position }: BannerAdProps) => {
  const [banner, setBanner] = useState<Banner | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/api/banners/position/${position}`);
        if (response.data && response.data.data && response.data.data.length > 0) {
          setBanner(response.data.data[0]); // Get the first active banner for this position
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching banner:', err);
        setError('Failed to load advertisement');
        setLoading(false);
      }
    };

    fetchBanner();
  }, [position]);

  if (loading) {
    // Different styling for sidebar positions (vertical banners)
    if (position === 'sidebar_left' || position === 'sidebar_right') {
      return (
        <div className="w-full h-96 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg my-4">
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 dark:text-gray-400 text-center">Loading advertisement...</p>
          </div>
        </div>
      );
    }
    
    // Default horizontal banner styling
    return (
      <div className="w-full h-24 sm:h-32 md:h-40 lg:h-48 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg my-4">
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500 dark:text-gray-400">Loading advertisement...</p>
        </div>
      </div>
    );
  }

  if (error || !banner) {
    // Different styling for sidebar positions (vertical banners)
    if (position === 'sidebar_left' || position === 'sidebar_right') {
      return (
        <div className="w-full my-4 overflow-hidden rounded-lg shadow-md bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-center h-96">
            <div className="text-center p-4">
              <p className="text-lg font-semibold text-gray-500 dark:text-gray-400">Diiklankan</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Space available for advertisement</p>
            </div>
          </div>
        </div>
      );
    }
    
    // Default horizontal banner styling
    return (
      <div className="w-full my-4 overflow-hidden rounded-lg shadow-md bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-center h-24 sm:h-32 md:h-40 lg:h-48">
          <div className="text-center p-4">
            <p className="text-lg font-semibold text-gray-500 dark:text-gray-400">Diiklankan</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Space available for advertisement</p>
          </div>
        </div>
      </div>
    );
  }

  // Different styling for sidebar positions (vertical banners)
  if (position === 'sidebar_left' || position === 'sidebar_right') {
    return (
      <div className="w-full my-4 overflow-hidden rounded-lg shadow-md">
        <a 
          href={banner.targetUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="block w-full transition-transform hover:opacity-95 active:scale-[0.99]"
        >
          <img 
            src={banner.imageUrl} 
            alt="Advertisement" 
            className="w-full h-96 object-cover object-center"
          />
        </a>
      </div>
    );
  }
  
  // Default horizontal banner styling
  return (
    <div className="w-full my-4 overflow-hidden rounded-lg shadow-md">
      <a 
        href={banner.targetUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        className="block w-full transition-transform hover:opacity-95 active:scale-[0.99]"
      >
        <img 
          src={banner.imageUrl} 
          alt="Advertisement" 
          className="w-full h-auto object-cover"
        />
      </a>
    </div>
  );
};

export default BannerAd;
import { useEffect, useState } from 'react';
import axiosInstance from '@/helpers/axios-instance';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import TrashIcon from '@/assets/svg/trash-icon';
import PenIcon from '@/assets/svg/pen-icon';

interface Banner {
  _id: string;
  imageUrl: string;
  targetUrl: string;
  isActive: boolean;
  position: string;
  createdAt: string;
  updatedAt: string;
}

const AdminBanners = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  
  // Form state
  const [imageUrl, setImageUrl] = useState<string>('');
  const [targetUrl, setTargetUrl] = useState<string>('');
  const [position, setPosition] = useState<string>('home_top');
  const [isActive, setIsActive] = useState<boolean>(true);

  // Fetch all banners
  const fetchBanners = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/banners');
      setBanners(response.data.data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to fetch banners. Please try again.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  // Reset form fields
  const resetForm = () => {
    setImageUrl('');
    setTargetUrl('');
    setPosition('home_top');
    setIsActive(true);
    setEditingBanner(null);
  };

  // Open form for creating a new banner
  const handleAddNew = () => {
    resetForm();
    setShowForm(true);
  };

  // Open form for editing an existing banner
  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setImageUrl(banner.imageUrl);
    setTargetUrl(banner.targetUrl);
    setPosition(banner.position);
    setIsActive(banner.isActive);
    setShowForm(true);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!imageUrl || !targetUrl) {
      toast.error('Image URL and Target URL are required');
      return;
    }

    try {
      if (editingBanner) {
        // Update existing banner
        await axiosInstance.patch(`/api/banners/${editingBanner._id}`, {
          imageUrl,
          targetUrl,
          position,
          isActive
        });
        toast.success('Banner updated successfully!');
      } else {
        // Create new banner
        await axiosInstance.post('/api/banners', {
          imageUrl,
          targetUrl,
          position,
          isActive
        });
        toast.success('Banner created successfully!');
      }
      
      // Refresh the banner list and reset form
      fetchBanners();
      setShowForm(false);
      resetForm();
    } catch (error) {
      toast.error('Failed to save banner. Please try again.');
    }
  };

  // Toggle banner active status
  const handleToggleStatus = async (bannerId: string) => {
    try {
      await axiosInstance.patch(`/api/banners/toggle/${bannerId}`);
      toast.success('Banner status updated!');
      fetchBanners();
    } catch (error) {
      toast.error('Failed to update banner status.');
    }
  };

  // Delete a banner
  const handleDelete = async (bannerId: string) => {
    if (window.confirm('Are you sure you want to delete this banner?')) {
      try {
        await axiosInstance.delete(`/api/banners/${bannerId}`);
        toast.success('Banner deleted successfully!');
        fetchBanners();
      } catch (error) {
        toast.error('Failed to delete banner. Please try again.');
      }
    }
  };

  return (
    <div className="w-full p-3 px-5 sm:p-12">
      <h1 className="absolute left-16 top-3 text-2xl font-bold text-light-title dark:text-dark-title sm:static">
        Banner Advertisements
      </h1>
      
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleAddNew}
          className="rounded-lg bg-light-primary px-4 py-2 text-white hover:bg-light-primary/90 dark:bg-dark-primary dark:hover:bg-dark-primary/90"
        >
          Add New Banner
        </button>
      </div>

      {showForm && (
        <div className="mt-6 rounded-lg bg-light p-6 shadow-md dark:bg-dark-card">
          <h2 className="mb-4 text-xl font-semibold text-light-title dark:text-dark-title">
            {editingBanner ? 'Edit Banner' : 'Create New Banner'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="mb-2 block text-light-title dark:text-dark-title">
                Image URL *
              </label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full rounded-lg border border-gray-300 p-2 dark:border-gray-700 dark:bg-dark-field dark:text-dark-textColor"
                placeholder="https://example.com/banner-image.jpg"
                required
              />
              {imageUrl && (
                <div className="mt-2">
                  <p className="mb-1 text-sm text-light-description dark:text-dark-description">Preview:</p>
                  <img src={imageUrl} alt="Banner Preview" className="max-h-40 rounded-lg" />
                </div>
              )}
            </div>
            
            <div className="mb-4">
              <label className="mb-2 block text-light-title dark:text-dark-title">
                Target URL *
              </label>
              <input
                type="text"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                className="w-full rounded-lg border border-gray-300 p-2 dark:border-gray-700 dark:bg-dark-field dark:text-dark-textColor"
                placeholder="https://example.com/landing-page"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="mb-2 block text-light-title dark:text-dark-title">
                Position
              </label>
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="w-full rounded-lg border border-gray-300 p-2 dark:border-gray-700 dark:bg-dark-field dark:text-dark-textColor"
              >
                <option value="home_top">Home Page - Top</option>
                <option value="above_search">Above Search</option>
                <option value="sidebar">Sidebar (Mobile)</option>
                <option value="sidebar_left">Sidebar - Left</option>
                <option value="sidebar_right">Sidebar - Right</option>
                <option value="article_bottom">Article - Bottom</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="flex items-center text-light-title dark:text-dark-title">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="mr-2 h-5 w-5 rounded"
                />
                Active
              </label>
            </div>
            
            <div className="flex gap-2">
              <button
                type="submit"
                className="rounded-lg bg-light-primary px-4 py-2 text-white hover:bg-light-primary/90 dark:bg-dark-primary dark:hover:bg-dark-primary/90"
              >
                {editingBanner ? 'Update Banner' : 'Create Banner'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-dark-field dark:text-dark-textColor dark:hover:bg-gray-800"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="mt-6">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-black"></div>
          </div>
        ) : banners.length === 0 ? (
          <div className="rounded-lg border border-gray-300 bg-light p-6 text-center dark:border-gray-700 dark:bg-dark-card">
            <p className="text-light-title dark:text-dark-title">No banners found</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Banner
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Target URL
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Position
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-dark-card">
                {banners.map((banner) => (
                  <tr key={banner._id}>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center">
                        <img
                          src={banner.imageUrl}
                          alt="Banner"
                          className="h-16 w-32 rounded object-cover"
                        />
                      </div>
                    </td>
                    <td className="max-w-xs overflow-hidden text-ellipsis whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      <a
                        href={banner.targetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        {banner.targetUrl}
                      </a>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {banner.position === 'home_top' && 'Home Page - Top'}
                      {banner.position === 'above_search' && 'Above Search'}
                      {banner.position === 'sidebar' && 'Sidebar (Mobile)'}
                      {banner.position === 'sidebar_left' && 'Sidebar - Left'}
                      {banner.position === 'sidebar_right' && 'Sidebar - Right'}
                      {banner.position === 'article_bottom' && 'Article - Bottom'}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <button
                        onClick={() => handleToggleStatus(banner._id)}
                        className={`rounded-full px-3 py-1 text-xs font-medium ${banner.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'}`}
                      >
                        {banner.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(banner)}
                          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                        >
                          <PenIcon />
                        </button>
                        <button
                          onClick={() => handleDelete(banner._id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBanners;
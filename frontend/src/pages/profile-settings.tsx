import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';
import axiosInstance from '@/helpers/axios-instance';
import { AxiosError, isAxiosError } from 'axios';
import useAuthData from '@/hooks/useAuthData';
import userState from '@/utils/user-state';
import ThemeToggle from '@/components/theme-toggle-button';
import { useNavigate } from 'react-router-dom';

// Define schemas for form validation
const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, { message: 'Current password is required' }),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/,
        'Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character'
      ),
    confirmNewPassword: z.string().min(1, { message: 'Confirm password is required' }),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Passwords do not match',
    path: ['confirmNewPassword'],
  });

const profileUpdateSchema = z.object({
  fullName: z
    .string()
    .min(3, { message: 'Name must be at least 3 characters' })
    .max(15, { message: 'Name should be less than 15 characters' }),
});

type PasswordChangeFormData = z.infer<typeof passwordChangeSchema>;
type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;

const ProfileSettings = () => {
  const navigate = useNavigate();
  const { token, loading, _id } = useAuthData();
  const [activeTab, setActiveTab] = useState('profile');
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [userData, setUserData] = useState<{ fullName: string; avatar: string; userName: string }>({ 
    fullName: '', 
    avatar: '', 
    userName: '' 
  });
  const [isLoading, setIsLoading] = useState(true);

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm<PasswordChangeFormData>({
    resolver: zodResolver(passwordChangeSchema),
  });

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
    reset: resetProfile,
    setValue,
  } = useForm<ProfileUpdateFormData>({
    resolver: zodResolver(profileUpdateSchema),
  });

  useEffect(() => {
    if (!token) {
      navigate('/signin');
      return;
    }

    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        const response = await axiosInstance.get(`/api/user/profile/${_id}`);
        const userData = response.data.data;
        setUserData(userData);
        setValue('fullName', userData.fullName);
        setPreviewUrl(userData.avatar || '');
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setIsLoading(false);
        toast.error('Failed to load user profile');
      }
    };

    fetchUserData();
  }, [token, _id, navigate, setValue]);

  const handlePasswordChange = async (data: PasswordChangeFormData) => {
    try {
      const response = axiosInstance.post(`/api/user/change-password/${_id}`, {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      toast.promise(response, {
        pending: 'Changing password...',
        success: {
          render() {
            resetPassword();
            return 'Password changed successfully';
          },
        },
        error: {
          render({ data }) {
            if (data instanceof AxiosError) {
              return data?.response?.data?.message || 'Failed to change password';
            }
            return 'Failed to change password';
          },
        },
      });

      return (await response).data;
    } catch (error) {
      if (isAxiosError(error)) {
        console.error(error.response?.data?.message || 'An error occurred');
      } else {
        console.error(error);
      }
    }
  };

  const handleProfileUpdate = async (data: ProfileUpdateFormData) => {
    try {
      const response = axiosInstance.put(`/api/user/update-profile/${_id}`, {
        fullName: data.fullName,
      });

      toast.promise(response, {
        pending: 'Updating profile...',
        success: {
          render({ data }) {
            setUserData(prev => ({ ...prev, fullName: data?.data?.fullName }));
            return 'Profile updated successfully';
          },
        },
        error: {
          render({ data }) {
            if (data instanceof AxiosError) {
              return data?.response?.data?.message || 'Failed to update profile';
            }
            return 'Failed to update profile';
          },
        },
      });

      return (await response).data;
    } catch (error) {
      if (isAxiosError(error)) {
        console.error(error.response?.data?.message || 'An error occurred');
      } else {
        console.error(error);
      }
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = async () => {
    if (!profileImage) {
      toast.error('Please select an image to upload');
      return;
    }

    const formData = new FormData();
    formData.append('profileImage', profileImage);

    try {
      const response = axiosInstance.post(`/api/user/upload-profile-image/${_id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.promise(response, {
        pending: 'Uploading image...',
        success: {
          render({ data }) {
            setUserData(prev => ({ ...prev, avatar: data?.data?.avatar }));
            return 'Profile image uploaded successfully';
          },
        },
        error: {
          render({ data }) {
            if (data instanceof AxiosError) {
              return data?.response?.data?.message || 'Failed to upload image';
            }
            return 'Failed to upload image';
          },
        },
      });

      return (await response).data;
    } catch (error) {
      if (isAxiosError(error)) {
        console.error(error.response?.data?.message || 'An error occurred');
      } else {
        console.error(error);
      }
    }
  };

  if (loading || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-t-4 border-gray-200 border-t-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-16 dark:bg-dark-card">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Profile Settings</h1>
          <ThemeToggle />
        </div>

        <div className="flex flex-col md:flex-row">
          {/* Sidebar */}
          <div className="mb-6 w-full md:mb-0 md:w-1/4">
            <div className="rounded-lg bg-gray-100 p-4 dark:bg-dark-field">
              <div className="mb-6 flex flex-col items-center">
                <div className="mb-4 h-24 w-24 overflow-hidden rounded-full">
                  <img 
                    src={previewUrl || 'https://via.placeholder.com/150'} 
                    alt="Profile" 
                    className="h-full w-full object-cover"
                  />
                </div>
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">{userData.fullName}</h2>
                <p className="text-sm text-gray-600 dark:text-gray-300">@{userData.userName}</p>
              </div>
              <ul>
                <li 
                  className={`mb-2 cursor-pointer rounded-md p-2 ${activeTab === 'profile' ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700'}`}
                  onClick={() => setActiveTab('profile')}
                >
                  Profile Information
                </li>
                <li 
                  className={`mb-2 cursor-pointer rounded-md p-2 ${activeTab === 'password' ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700'}`}
                  onClick={() => setActiveTab('password')}
                >
                  Change Password
                </li>
                <li 
                  className={`cursor-pointer rounded-md p-2 ${activeTab === 'photo' ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700'}`}
                  onClick={() => setActiveTab('photo')}
                >
                  Profile Photo
                </li>
              </ul>
            </div>
          </div>

          {/* Main Content */}
          <div className="w-full md:w-3/4 md:pl-8">
            {activeTab === 'profile' && (
              <div className="rounded-lg bg-white p-6 shadow-md dark:bg-dark-field">
                <h2 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white">Profile Information</h2>
                <form onSubmit={handleSubmitProfile(handleProfileUpdate)}>
                  <div className="mb-4">
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                    <input
                      type="text"
                      {...registerProfile('fullName')}
                      className="w-full rounded-lg border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                    {profileErrors.fullName && (
                      <p className="mt-1 text-sm text-red-500">{profileErrors.fullName.message}</p>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                  >
                    Update Profile
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'password' && (
              <div className="rounded-lg bg-white p-6 shadow-md dark:bg-dark-field">
                <h2 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white">Change Password</h2>
                <form onSubmit={handleSubmitPassword(handlePasswordChange)}>
                  <div className="mb-4">
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Current Password</label>
                    <input
                      type="password"
                      {...registerPassword('currentPassword')}
                      className="w-full rounded-lg border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                    {passwordErrors.currentPassword && (
                      <p className="mt-1 text-sm text-red-500">{passwordErrors.currentPassword.message}</p>
                    )}
                  </div>
                  <div className="mb-4">
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">New Password</label>
                    <input
                      type="password"
                      {...registerPassword('newPassword')}
                      className="w-full rounded-lg border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                    {passwordErrors.newPassword && (
                      <p className="mt-1 text-sm text-red-500">{passwordErrors.newPassword.message}</p>
                    )}
                  </div>
                  <div className="mb-4">
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Confirm New Password</label>
                    <input
                      type="password"
                      {...registerPassword('confirmNewPassword')}
                      className="w-full rounded-lg border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                    {passwordErrors.confirmNewPassword && (
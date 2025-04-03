import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UserAvatar from './useravatar';
import LogOutIcon from '@/assets/svg/logout-icon.svg';
import userState from '@/utils/user-state';
import { AxiosError, isAxiosError } from 'axios';
import axiosInstance from '@/helpers/axios-instance';
import { toast } from 'react-toastify';

interface ProfileMenuProps {
  className?: string;
}

export default function ProfileMenu({ className = '' }: ProfileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const user = userState.getUser();

  const handleLogout = async () => {
    try {
      const response = axiosInstance.post('/api/auth/signout');
      toast.promise(response, {
        pending: 'Wait ...',
        success: {
          render({ data }) {
            userState.removeUser();
            navigate('/');
            return data?.data?.message;
          },
        },
        error: {
          render({ data }) {
            if (data instanceof AxiosError) {
              if (data?.response?.data?.message) {
                return data?.response?.data?.message;
              }
            }
            return 'Signout failed';
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

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!user) return null;

  return (
    <div className={`relative ${className}`} ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full focus:outline-none"
      >
        <UserAvatar 
          src={user.avatar} 
          alt={user.fullName || 'User'} 
          className="h-8 w-8 rounded-full border border-slate-50 cursor-pointer hover:opacity-80"
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-md bg-white shadow-lg dark:bg-gray-800 z-50">
          <div className="py-1">
            <div className="border-b border-gray-200 px-4 py-2 dark:border-gray-700">
              <p className="font-medium text-gray-800 dark:text-gray-200">{user.fullName}</p>
            </div>
            
            <button
              onClick={() => {
                setIsOpen(false);
                navigate('/profile');
              }}
              className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              My Profile
            </button>
            
            <button
              onClick={() => {
                setIsOpen(false);
                navigate('/favorites');
              }}
              className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              My Favorites
            </button>
            
            <button
              onClick={() => {
                setIsOpen(false);
                handleLogout();
              }}
              className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100 dark:text-red-400 dark:hover:bg-gray-700"
            >
              <img src={LogOutIcon} alt="Logout" className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axiosInstance from '@/helpers/axios-instance';
import userState from '@/utils/user-state';

interface LoginFormProps {
  className?: string;
}

const LoginForm = ({ className = '' }: LoginFormProps) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    userNameOrEmail: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing again
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await axiosInstance.post('/api/auth/email-password/signin', formData);
      const { user } = response.data.data;
      
      if (user && user._id && user.role) {
        userState.setUser({
          _id: user._id,
          role: user.role,
          fullName: user.fullName,
          avatar: user.avatar
        });
        
        toast.success('Login successful!');
        navigate('/');
      } else {
        setError('Invalid response from server');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="userNameOrEmail" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Username or Email
          </label>
          <input
            type="text"
            id="userNameOrEmail"
            name="userNameOrEmail"
            value={formData.userNameOrEmail}
            onChange={handleChange}
            placeholder="Enter your username or email"
            className="rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            required
          />
        </div>
        
        <div className="flex flex-col gap-1">
          <label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            className="rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            required
          />
        </div>
        
        {error && (
          <div className="rounded-md bg-red-50 p-2 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-400">
            {error}
          </div>
        )}
        
        <button
          type="submit"
          disabled={isLoading}
          className="mt-2 rounded-md bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-blue-700 dark:hover:bg-blue-600"
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
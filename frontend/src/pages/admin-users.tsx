import axiosInstance from '@/helpers/axios-instance';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Role } from '@/types/role-type';
import UserSearch from '@/components/user-search';

type User = {
  _id: string;
  fullName: string;
  role: Role;
  email: string;
};

const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchData = async (searchTerm: string = '', roleFilter: string | null = null) => {
    setLoading(true);
    try {
      let url = '/api/user';
      const params = new URLSearchParams();
      
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      
      if (roleFilter) {
        params.append('role', roleFilter);
      }
      
      const queryString = params.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
      
      const response = await axiosInstance.get(url);
      setUsers(response?.data?.users);
    } catch (error) {
      toast.error('Something went wrong! Please try again!');
    } finally {
      setLoading(false);
    }
  };

  const handleClick = async (userId: string, role: Role) => {
    try {
      const response = await axiosInstance.patch('/api/user/' + userId, { role });
      if (response.status === 200) {
        fetchData();
        toast.success('User updated successfully!');
      }
    } catch (error) {
      toast.error('Something went wrong! Please try again later.');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  
  const handleSearch = (searchTerm: string, roleFilter: string | null) => {
    fetchData(searchTerm, roleFilter);
  };

  return (
    <div className="w-full p-3 px-5 sm:p-12">
      <h1 className="absolute left-16 top-3 text-2xl font-bold text-light-title dark:text-dark-title sm:static">
        Users
      </h1>
      <div className="mt-6">
        <UserSearch onSearch={handleSearch} />
      </div>
      <div className="mt-2 sm:mt-6">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-black"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="rounded-lg border border-gray-300 bg-light p-6 text-center dark:border-gray-700 dark:bg-dark-card">
            <p className="text-light-title dark:text-dark-title">No users found</p>
          </div>
        ) : (
          <>
            {users?.map((user: User) => (
          <div
            key={user?._id}
            className="mb-3 flex w-full flex-row items-center justify-between gap-5 rounded-lg border-b border-gray-300 bg-light px-3 py-4 shadow-md dark:border-gray-700 dark:bg-dark-card"
          >
            <div className="flex flex-col gap-[10px]">
              <p className="text-base font-medium text-light-title dark:text-dark-title">
                {user?.fullName}
              </p>
              <p className="text-base font-medium text-light-description dark:text-dark-description">
                {user?.email}
              </p>
            </div>
            {user.role === Role.Admin && (
              <button
                onClick={() => handleClick(user._id, Role.User)}
                className="h-fit rounded-xl border border-black bg-black px-4 py-2 text-sm font-semibold text-white"
              >
                Admin
              </button>
            )}
            {user.role === Role.User && (
              <button
                onClick={() => handleClick(user._id, Role.Admin)}
                className="h-fit rounded-xl border border-black bg-transparent px-4 py-2 text-sm font-semibold text-black dark:text-white"
              >
                User
              </button>
            )}
          </div>
        ))}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;

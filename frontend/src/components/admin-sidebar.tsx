import { NavLink, useNavigate } from 'react-router-dom';
import UserIcon from '@/assets/svg/user-icon';
import BlogIcon from '@/assets/svg/blog-icon';
import BarIcons from '@/assets/svg/bars-icon';
import { useState } from 'react';
import CloseIcon from '@/assets/svg/close-icon';

const AdminSidebar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  const navigate = useNavigate();

  return (
    <>
      <button
        className=" p-4  text-light-title dark:text-dark-title sm:hidden "
        onClick={() => {
          setIsSidebarOpen(!isSidebarOpen);
        }}
      >
        <BarIcons />
      </button>
      <div
        className={`absolute z-10 h-full w-64 origin-left rounded-b-xl rounded-r-xl border border-[#D9D9D9] bg-light transition-transform dark:border-gray-700 dark:bg-dark ${
          isSidebarOpen ? 'scale-x-100' : 'scale-x-0'
        } sm:relative sm:h-auto sm:scale-x-100`}
      >
        <button
          className=" p-4  text-light-title dark:text-dark-title sm:hidden "
          onClick={() => {
            setIsSidebarOpen(!isSidebarOpen);
          }}
        >
          <CloseIcon />
        </button>
        <div className="border-b border-[#D9D9D9] bg-light  px-6 py-3 dark:border-gray-700 dark:bg-dark sm:p-6 ">
          <h1
            onClick={() => navigate('/')}
            className="cursor-pointer text-xl font-medium text-light-title dark:text-dark-title"
          >
            Winnicode Admin
          </h1>
        </div>
        <div className="flex flex-col gap-2 p-6">
          <NavLink
            to={'/admin/users'}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl bg-light px-3 py-[10px] text-sm font-medium text-light-title dark:bg-dark dark:text-dark-title ${
                isActive && '!dark:text-dark-title !bg-black !text-dark-title dark:!bg-dark-card '
              }`
            }
          >
            <UserIcon /> Users
          </NavLink>
          <NavLink
            to={'/admin/blogs'}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl bg-light px-3 py-[10px] text-sm font-medium text-light-title dark:bg-dark dark:text-dark-title ${
                isActive && '!dark:text-dark-title !bg-black !text-dark-title dark:!bg-dark-card '
              }`
            }
          >
            <BlogIcon /> News
          </NavLink>
          <NavLink
            to={'/admin/comments'}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl bg-light px-3 py-[10px] text-sm font-medium text-light-title dark:bg-dark dark:text-dark-title ${
                isActive && '!dark:text-dark-title !bg-black !text-dark-title dark:!bg-dark-card '
              }`
            }
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg> Comments
          </NavLink>
          <NavLink
            to={'/admin/banners'}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl bg-light px-3 py-[10px] text-sm font-medium text-light-title dark:bg-dark dark:text-dark-title ${
                isActive && '!dark:text-dark-title !bg-black !text-dark-title dark:!bg-dark-card '
              }`
            }
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="6" width="20" height="12" rx="2" />
              <path d="M12 12h.01" />
            </svg> Banners
          </NavLink>
        </div>
      </div>
    </>
  );
};

export default AdminSidebar;

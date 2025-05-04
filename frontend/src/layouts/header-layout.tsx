import { useNavigate, Link } from 'react-router-dom';
import { AxiosError, isAxiosError } from 'axios';
import { toast } from 'react-toastify';
import ThemeToggle from '@/components/theme-toggle-button';
import AddIcon from '@/assets/svg/add-icon-white.svg';
import LogInIcon from '@/assets/svg/login-icon.svg';
import AppIcon from '@/assets/svg/app-icon.svg';
import Hero from '@/components/hero';
import Loader from '@/components/skeletons/loader';
import useAuthData from '@/hooks/useAuthData';
import userState from '@/utils/user-state';
import { Role } from '@/types/role-type';
import axiosInstance from '@/helpers/axios-instance';

function Header() {
  const navigate = useNavigate();
  const { token, loading } = useAuthData();
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
            return data?.data?.message || 'Signed out successfully';
          },
        },
        error: {
          render({ data }) {
            if (data instanceof AxiosError && data?.response?.data?.message) {
              return data.response.data.message;
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

  return (
    <div className="relative -mt-2 h-[460px] bg-[url('./assets/wanderlustbg.webp')] bg-cover bg-fixed bg-center">
      <div className="absolute inset-0 bg-black opacity-50"></div>
      <div className="absolute inset-0 flex flex-col px-8 py-8 text-slate-50 sm:px-16">
        {/* Top Navigation */}
        <div className="flex w-full justify-between">
          {/* Logo and Title */}
          <div className="flex items-center gap-2 text-2xl font-semibold">
            <Link to="/">
              <img src={AppIcon} className="h-10 w-10" alt="App Icon" />
            </Link>
            <Link to="/" style={{ textDecoration: 'none' }}>
              DailyVerse
            </Link>
          </div>

          {/* Right-side Actions */}
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {loading ? (
              <Loader />
            ) : token && user ? (
              <div className="flex items-center gap-2">
                {/* ProfileMenu component removed */}
                {user?.role === Role.Admin && (
                  <button
                    className="hidden md:inline-block rounded border border-slate-50 px-4 py-2 hover:bg-slate-500/25 active:scale-click"
                    onClick={() => navigate('/admin/blogs')}
                  >
                    Dashboard
                  </button>
                )}
                {user?.role === Role.Admin && (
                  <button
                    className="hidden md:inline-block rounded border border-slate-50 px-4 py-2 hover:bg-slate-500/25 active:scale-click"
                    onClick={() => navigate('/add-blog')}
                  >
                    Create news
                  </button>
                )}
                <button
                  className="hidden md:inline-block rounded border border-slate-50 px-4 py-2 hover:bg-slate-500/25 active:scale-click"
                  onClick={handleLogout}
                >
                  Logout
                </button>
                {/* Mobile Add Icon */}
                {user?.role === Role.Admin && (
                  <button
                    className="md:hidden px-2 py-2 hover:bg-slate-500/25"
                    onClick={() => navigate('/add-blog')}
                  >
                    <img src={AddIcon} alt="Add Icon" className="h-10 w-10" />
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  className="hidden md:inline-block rounded border border-slate-50 px-4 py-2 hover:bg-slate-500/25 active:scale-click"
                  onClick={() => navigate('/signin')}
                >
                  Login
                </button>

                {/* Mobile Login Icon */}
                <button
                  className="md:hidden px-2 py-2 hover:bg-slate-500/25"
                  onClick={() => navigate('/signin')}
                >
                  <img src={LogInIcon} alt="Login Icon" className="h-9 w-9" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Hero Section */}
        <Hero />
      </div>
    </div>
  );
}

export default Header;

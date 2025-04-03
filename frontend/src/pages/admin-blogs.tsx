import PenIcon from '@/assets/svg/pen-icon';
import TrasnIcon from '@/assets/svg/trash-icon';
import axiosInstance from '@/helpers/axios-instance';
import formatPostTime from '@/utils/format-post-time';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Post from '@/types/post-type';
import { useNavigate } from 'react-router-dom';
import BlogSearch from '@/components/blog-search';

const AdminBlogs = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const navigate = useNavigate();

  const fetchData = async (searchTerm: string = '') => {
    setLoading(true);
    try {
      let url = '/api/posts';
      
      if (searchTerm) {
        url += `?title=${encodeURIComponent(searchTerm)}`;
      }
      
      const response = await axiosInstance.get(url);
      setPosts(response?.data);
    } catch (error) {
      toast.error('Something went wrong! Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId: string) => {
    const response = await axiosInstance.delete('/api/posts/admin/' + postId);
    if (response.status === 200) {
      fetchData();
      toast.success('Post successfully deleted !');
    } else {
      toast?.error('Something went wrong!');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  
  const handleSearch = (searchTerm: string) => {
    fetchData(searchTerm);
  };

  return (
    <>
      <div className="w-full p-3 px-5 sm:p-12">
        <h1 className="absolute left-16 top-3 text-2xl font-bold text-light-title dark:text-dark-title  sm:static">
          Blogs
        </h1>
        <div className="mt-6">
          <BlogSearch onSearch={handleSearch} />
        </div>
        <div className="mt-2 flex flex-col sm:mt-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-black"></div>
            </div>
          ) : posts.length === 0 ? (
            <div className="rounded-lg border border-gray-300 bg-light p-6 text-center dark:border-gray-700 dark:bg-dark-card">
              <p className="text-light-title dark:text-dark-title">No blogs found</p>
            </div>
          ) : (
            <>
              {posts?.map((post: Post) => {
            return (
              <div
                key={post?._id}
                className="mb-3 flex flex-row items-center justify-between gap-2 rounded-lg bg-light px-3 py-3 shadow-md dark:bg-dark-card sm:gap-5"
              >
                <img
                  src={post?.imageLink}
                  className=" h-16 w-16 rounded-xl object-cover shadow-lg sm:h-24 sm:w-24"
                  alt=""
                />
                <div className="flex w-12 flex-1 grow flex-col justify-between gap-2">
                  <h4 className="w-full truncate text-base font-semibold text-light-title dark:text-dark-title sm:text-xl">
                    {post?.title}
                  </h4>
                  <p className="hidden w-full truncate text-sm text-light-description dark:text-dark-description sm:inline">
                    {post?.description}
                  </p>
                  <p className="text-sm font-semibold text-[#6941C6] dark:text-dark-secondary">
                    {post?.authorName} • {formatPostTime(post?.timeOfPost)}
                  </p>
                </div>
                <div className="mt-2 flex flex-col gap-2 sm:mt-0 sm:flex-row ">
                  <button
                    onClick={() => navigate(`/edit-blog/${post?._id}`, { state: { post } })}
                    className="h-fit rounded-xl border-0 text-base font-semibold text-light-title dark:text-dark-title sm:text-xl"
                  >
                    <PenIcon />
                  </button>
                  <button
                    onClick={() => handleDelete(post?._id)}
                    className="h-fit rounded-xl border-0 text-base font-semibold text-light-title dark:text-dark-title sm:text-xl "
                  >
                    <TrasnIcon />
                  </button>
                </div>
              </div>
            );
          })}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminBlogs;

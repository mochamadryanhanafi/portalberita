import { useEffect, useState } from 'react';
import BlogFeed from '@/components/blog-feed';
import PostCard from '@/components/post-card';
import Post from '@/types/post-type';
import { PostCardSkeleton } from '@/components/skeletons/post-card-skeleton';
import Header from '@/layouts/header-layout';
import axiosInstance from '@/helpers/axios-instance';
import CategoryPostsSection from '@/components/category-posts-section';
import { categories } from '@/utils/category-colors';
import BannerAd from '@/components/banner-ad';
import PopularPostsSection from '@/components/popular-posts-section';

function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get('/api/posts');
        setPosts(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  return (
    <div className="w-full cursor-default bg-light dark:bg-dark">
      <Header />
      <div className="mx-4 sm:mx-8 lg:mx-16">
        {/* Banner Ad above Hot News */}
        <BannerAd position="home_top" />
        
        {/* Hot News section displays all posts */}    
        <BlogFeed posts={posts} loading={loading} />
        {posts.length === 0 && !loading && (
          <div className="text-center text-gray-500 py-8">No posts available.</div>
        )}
        {/* Banner Ad above Search */}
        <BannerAd position="above_search" />
        
        {/* Popular Posts Section */}
        <PopularPostsSection />
        
        {/* Search Section */}
        <div className="my-8 flex justify-center">
          <input
            type="text"
            placeholder="Search News by title..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full max-w-md rounded-lg border border-gray-300 bg-white px-4 py-2 text-base text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none dark:bg-dark-field dark:text-dark-textColor dark:border-gray-700"
          />
        </div>
        {/* Optional: Jika ingin tetap menampilkan semua post di bawah, aktifkan bagian ini */}
        <h1 className="cursor-text pb-4 text-xl font-semibold dark:text-dark-primary sm:pb-0">
          All Posts
        </h1>
        <div className="flex flex-wrap">
          {loading
            ? Array(8)
                .fill(0)
                .map((_, index) => <PostCardSkeleton key={index} />)
            : posts.filter(post => post.title.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && !loading
              ? <div className="text-center text-gray-500 py-8 w-full">No posts available.</div>
              : posts
                  .filter(post => post.title.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((post) => <PostCard key={post._id} post={post} />)}
        </div> 
      </div>
    </div>
  );
}

export default HomePage;

import { useEffect, useState } from 'react';
import Post from '@/types/post-type';
import PostCard from '@/components/post-card';
import { PostCardSkeleton } from '@/components/skeletons/post-card-skeleton';
import axiosInstance from '@/helpers/axios-instance';
import { getCategoryColors } from '@/utils/category-colors';
import styles from './category-posts-section.module.css';

interface CategoryPostsSectionProps {
  category: string;
}

export default function CategoryPostsSection({ category }: CategoryPostsSectionProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [bgColor] = getCategoryColors(category);

  useEffect(() => {
    const fetchCategoryPosts = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get(`/api/posts?category=${encodeURIComponent(category)}`);
        setPosts(res.data);
      } catch (error) {
        console.error(`Error fetching ${category} posts:`, error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategoryPosts();
  }, [category]);

  if (posts.length === 0 && !loading) return null;

  return (
    <div className={styles.categorySection}>
      <h2 className={`${styles.categoryTitle} ${bgColor}`}>
        {category}
      </h2>
      <div className={styles.verticalListWrapper}>
        {loading
          ? Array(4)
              .fill(0)
              .map((_, index) => (
                <div key={index} className={styles.verticalCardItem}>
                  <PostCardSkeleton />
                </div>
              ))
          : posts.map((post) => (
              <div key={post._id} className={styles.verticalCardItem}>
                <PostCard post={post} />
              </div>
            ))}
      </div>
    </div>
  );
}
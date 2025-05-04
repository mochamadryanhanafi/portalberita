import { useNavigate } from 'react-router-dom';
import Post from '@/types/post-type';
import formatPostTime from '@/utils/format-post-time';
import CategoryPill from '@/components/category-pill';
import { createSlug } from '@/utils/slug-generator';
import { TestProps } from '@/types/test-props';

export default function PostCard({ post, testId = 'postcard' }: { post: Post } & TestProps) {
  const navigate = useNavigate();
  const slug = createSlug(post.title);

  return (
    <div
      className={`active:scale-click group w-full sm:w-1/2 lg:w-1/3 xl:w-1/4`}
      data-testid={testId}
    >
      <div
        className={`mb-4 cursor-pointer rounded-lg bg-light shadow-md dark:bg-dark-card ${'sm:mr-8 sm:mt-4'} relative`}
        onClick={() => navigate(`/details-page/${slug}/${post._id}`, { state: { post } })}
      >
        <div className="h-48 w-full overflow-hidden">
          <img
            src={post.imageLink}
            alt={post.title}
            className={`sm:group-hover:scale-hover h-full w-full rounded-t-lg object-cover transition-transform ease-in-out`}
          />
        </div>
        <div className="p-3">
          <div className="mb-1 flex justify-between text-xs text-light-info dark:text-dark-info">
            <div>
              {post.authorName} • {formatPostTime(post.timeOfPost)}
            </div>
            <div className="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>{post.viewCount || 0}</span>
            </div>
          </div>
          <h2 className="mb-2 line-clamp-1 text-base font-semibold text-light-title dark:text-dark-title">
            {post.title}
          </h2>
          <p className="line-clamp-2 text-sm text-light-description dark:text-dark-description">
            {post.description.split('\n')[0]}
          </p>
          <div className="mt-4 flex gap-2">
            {post.categories.slice(0, 3).map((category, index) => (
              <CategoryPill key={`${category}-${index}`} category={category} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
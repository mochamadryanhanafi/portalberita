import { useEffect, useState } from 'react';
import axiosInstance from '@/helpers/axios-instance';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import formatPostTime from '@/utils/format-post-time';
import TrashIcon from '@/assets/svg/trash-icon';

interface Comment {
  _id: string;
  content: string;
  user: {
    _id: string;
    userName: string;
    fullName: string;
    avatar: string;
  };
  news: string;
  createdAt: string;
  updatedAt: string;
}

interface Post {
  _id: string;
  title: string;
  imageLink: string;
  authorName: string;
  timeOfPost: string;
  comments?: Comment[];
}

const AdminComments = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [expandedPosts, setExpandedPosts] = useState<Record<string, boolean>>({});

  // Fetch all posts
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/posts');
      setPosts(response?.data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to fetch posts. Please try again.');
      setLoading(false);
    }
  };

  // Fetch comments for a specific post
  const fetchCommentsForPost = async (postId: string) => {
    try {
      const response = await axiosInstance.get(`/api/comments/news/${postId}`);
      
      // Update the posts array with comments for this post
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post._id === postId ? { ...post, comments: response.data } : post
        )
      );
    } catch (error) {
      toast.error(`Failed to fetch comments for post: ${postId}`);
    }
  };

  // Toggle expanded state for a post
  const togglePostExpanded = (postId: string) => {
    setExpandedPosts(prev => {
      const newState = { ...prev };
      newState[postId] = !prev[postId];
      
      // If expanding, fetch comments
      if (newState[postId]) {
        fetchCommentsForPost(postId);
      }
      
      return newState;
    });
  };

  // Delete a comment
  const handleDeleteComment = async (commentId: string, postId: string) => {
    try {
      const response = await axiosInstance.delete(`/api/comments/${commentId}`);
      
      if (response.status === 200) {
        toast.success('Comment deleted successfully!');
        
        // Update the UI by removing the deleted comment
        setPosts(prevPosts => 
          prevPosts.map(post => {
            if (post._id === postId && post.comments) {
              return {
                ...post,
                comments: post.comments.filter(comment => comment._id !== commentId)
              };
            }
            return post;
          })
        );
      }
    } catch (error) {
      toast.error('Failed to delete comment. Please try again.');
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div className="w-full p-3 px-5 sm:p-12">
      <h1 className="absolute left-16 top-3 text-2xl font-bold text-light-title dark:text-dark-title sm:static">
        Comments by Post
      </h1>
      
      {loading ? (
        <div className="mt-8 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-light-primary dark:border-dark-primary"></div>
        </div>
      ) : (
        <div className="mt-2 flex flex-col sm:mt-12">
          {posts.length === 0 ? (
            <p className="text-center text-light-description dark:text-dark-description">
              No posts found.
            </p>
          ) : (
            posts.map((post) => (
              <div key={post._id} className="mb-6 overflow-hidden rounded-lg bg-light shadow-md dark:bg-dark-card">
                {/* Post header */}
                <div 
                  className="flex cursor-pointer items-center justify-between gap-2 border-b border-gray-200 p-4 dark:border-gray-700"
                  onClick={() => togglePostExpanded(post._id)}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={post.imageLink}
                      className="h-12 w-12 rounded-lg object-cover"
                      alt={post.title}
                    />
                    <div>
                      <h3 className="text-lg font-semibold text-light-title dark:text-dark-title">
                        {post.title}
                      </h3>
                      <p className="text-sm text-light-description dark:text-dark-description">
                        {post.authorName} • {formatPostTime(post.timeOfPost)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-light-primary/10 px-3 py-1 text-sm font-medium text-light-primary dark:bg-dark-primary/20 dark:text-dark-primary">
                      {post.comments?.length || 0} comments
                    </span>
                    <svg
                      className={`h-5 w-5 transform text-light-description transition-transform dark:text-dark-description ${expandedPosts[post._id] ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                
                {/* Comments section */}
                {expandedPosts[post._id] && (
                  <div className="p-4">
                    {!post.comments ? (
                      <div className="flex justify-center py-4">
                        <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-t-2 border-light-primary dark:border-dark-primary"></div>
                      </div>
                    ) : post.comments.length === 0 ? (
                      <p className="py-4 text-center text-light-description dark:text-dark-description">
                        No comments for this post.
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {post.comments.map((comment) => (
                          <div key={comment._id} className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                            <div className="mb-2 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {comment.user.avatar && (
                                  <img
                                    src={comment.user.avatar}
                                    alt={comment.user.userName}
                                    className="h-8 w-8 rounded-full"
                                  />
                                )}
                                <div>
                                  <p className="font-medium text-light-title dark:text-dark-title">
                                    {comment.user.fullName || comment.user.userName}
                                  </p>
                                  <p className="text-xs text-light-description dark:text-dark-description">
                                    {new Date(comment.createdAt).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteComment(comment._id, post._id);
                                }}
                                className="rounded p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                                title="Delete comment"
                              >
                                <TrashIcon />
                              </button>
                            </div>
                            <p className="text-light-description dark:text-dark-description">
                              {comment.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default AdminComments;
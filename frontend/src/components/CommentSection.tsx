import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import useAuthData from '@/hooks/useAuthData';
import formatPostTime from '@/utils/format-post-time';
import UserAvatar from './UserAvatar';
import { Skeleton } from '@/components/ui/skeleton';

interface Comment {
  _id: string;
  content: string;
  user: {
    _id: string;
    userName: string;
    fullName: string;
    avatar: string;
  };
  createdAt: string;
}

interface CommentSectionProps {
  newsId: string;
}

export default function CommentSection({ newsId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const userData = useAuthData();

  useEffect(() => {
    fetchComments();
  }, [newsId]);

  const fetchComments = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_PATH}/api/comments/news/${newsId}`
      );
      setComments(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Failed to load comments');
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData) {
      toast.error('please login first');
      return;
    }
    if (!newComment.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_PATH}/api/comments`,
        { content: newComment, newsId },
        { withCredentials: true }
      );
      setComments([response.data.comment, ...comments]);
      setNewComment('');
      toast.success('Comment added successfully');
    } catch (error) {
      console.error('Error posting comment:', error);
      toast.error('please login first');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_PATH}/api/comments/${commentId}`,
        { withCredentials: true }
      );
      setComments(comments.filter((comment) => comment._id !== commentId));
      toast.success('Comment deleted successfully');
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
    }
  };

  if (loading) {
    return (
      <div className="mt-8 max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <Skeleton className="h-8 w-1/4 bg-slate-200 dark:bg-slate-700" />
        </div>
        
        <div className="space-y-6">
          {[1, 2, 3].map((idx) => (
            <div key={idx} className="p-4 border rounded-lg dark:border-gray-700">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center space-x-2">
                  <Skeleton className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700" />
                  <div>
                    <Skeleton className="h-4 w-24 bg-slate-200 dark:bg-slate-700" />
                    <Skeleton className="mt-1 h-3 w-16 bg-slate-200 dark:bg-slate-700" />
                  </div>
                </div>
              </div>
              <Skeleton className="h-4 w-full bg-slate-200 dark:bg-slate-700" />
              <Skeleton className="mt-2 h-4 w-3/4 bg-slate-200 dark:bg-slate-700" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 max-w-4xl mx-auto px-4">
      <h2 className="text-2xl font-semibold mb-6 dark:text-white">Comments</h2>
      
      {userData ? (
        <form onSubmit={handleSubmitComment} className="mb-8">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="w-full p-3 border rounded-lg dark:bg-dark dark:text-white dark:border-gray-700"
            rows={3}
          />
          <button
            type="submit"
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Post Comment
          </button>
        </form>
      ) : (
        <p className="mb-8 text-gray-600 dark:text-gray-400">
          Please sign in to post a comment.
        </p>
      )}

      <div className="space-y-6">
        {comments.map((comment) => (
          <div
            key={comment._id}
            className="p-4 border rounded-lg dark:border-gray-700"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center space-x-2">
                <UserAvatar 
                  src={comment.user.avatar} 
                  alt={comment.user.fullName || comment.user.userName} 
                  className="w-8 h-8 rounded-full"
                />
                <div>
                  <p className="font-semibold dark:text-white">
                    {comment.user.fullName || comment.user.userName}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatPostTime(comment.createdAt)}
                  </p>
                </div>
              </div>
              {(userData?._id === comment.user._id || userData?.role === 'ADMIN') && (
                <button
                  onClick={() => handleDeleteComment(comment._id)}
                  className="text-red-600 hover:text-red-700"
                >
                  Delete
                </button>
              )}
            </div>
            <p className="dark:text-gray-300">{comment.content}</p>
          </div>
        ))}
        {comments.length === 0 && (
          <p className="text-center text-gray-600 dark:text-gray-400">
            No comments yet. Be the first to comment!
          </p>
        )}
      </div>
    </div>
  );
}
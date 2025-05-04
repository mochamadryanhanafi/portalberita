type Post = {
  _id: string;
  authorName: string;
  title: string;
  imageLink: string;
  timeOfPost: string;
  description: string;
  categories: string[];
  authorId?: string;
  template?: string;
  viewCount?: number;
};

export default Post;

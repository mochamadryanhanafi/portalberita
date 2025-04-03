import { Schema, model, Document } from 'mongoose';

interface CommentDocument extends Document {
  content: string;
  user: Schema.Types.ObjectId;
  news: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<CommentDocument>(
  {
    content: {
      type: String,
      required: [true, 'Comment content is required'],
      trim: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },
    news: {
      type: Schema.Types.ObjectId,
      ref: 'News',
      required: [true, 'News reference is required'],
    },
  },
  { timestamps: true }
);

export default model<CommentDocument>('Comment', commentSchema);
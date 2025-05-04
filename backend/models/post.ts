import { Schema, model, Document } from 'mongoose';

interface PostDocument extends Document {
  authorName: string;
  title: string;
  imageLink: string;
  categories: string[];
  description: string;
  isFeaturedPost: boolean;
  timeOfPost: Date;
  authorId: Schema.Types.ObjectId;
  viewCount: number;
}

const postSchema = new Schema<PostDocument>(
  {
    authorName: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    imageLink: { type: String, required: false, trim: true },
    categories: { type: [String], default: [] },
    description: { type: String, required: true, trim: true },
    isFeaturedPost: { type: Boolean, default: false },
    timeOfPost: { type: Date, default: Date.now },
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    viewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Tambahkan indeks untuk mempercepat pencarian berdasarkan authorId
postSchema.index({ authorId: 1 });

export default model<PostDocument>('Post', postSchema);

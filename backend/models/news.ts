import { Schema, model, Document } from 'mongoose';

interface NewsDocument extends Document {
  title: string;
  content: string;
  summary: string;
  imageUrl: string;
  sourceUrl: string;
  sourceName: string;
  category: string;
  publishedAt: Date;
  author: string;
  views: number;
  isFeatured: boolean;
}

const newsSchema = new Schema<NewsDocument>(
  {
    title: {
      type: String,
      required: [true, 'News title is required'],
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'News content is required'],
    },
    summary: {
      type: String,
      required: [true, 'News summary is required'],
    },
    imageUrl: {
      type: String,
      required: [true, 'News image URL is required'],
    },
    sourceUrl: {
      type: String,
      required: [true, 'Source URL is required'],
    },
    sourceName: {
      type: String,
      required: [true, 'Source name is required'],
      default: 'Detik',
    },
    category: {
      type: String,
      required: [true, 'News category is required'],
      enum: ['politics', 'sports', 'technology', 'entertainment', 'business', 'health', 'science', 'other'],
    },
    publishedAt: {
      type: Date,
      required: [true, 'Publication date is required'],
      default: Date.now,
    },
    author: {
      type: String,
      default: 'Unknown',
    },
    views: {
      type: Number,
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default model<NewsDocument>('News', newsSchema);
import mongoose, { Document, Schema } from 'mongoose';

export interface IBanner extends Document {
  imageUrl: string;
  targetUrl: string;
  isActive: boolean;
  position: string; // 'home_top' or other positions where banners might be placed
  createdAt: Date;
  updatedAt: Date;
}

const bannerSchema = new Schema<IBanner>(
  {
    imageUrl: {
      type: String,
      required: [true, 'Banner image URL is required'],
    },
    targetUrl: {
      type: String,
      required: [true, 'Target URL is required'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    position: {
      type: String,
      required: [true, 'Banner position is required'],
      enum: ['home_top', 'above_search', 'sidebar', 'sidebar_left', 'sidebar_right', 'article_bottom'], // Updated to include all frontend options
      default: 'home_top',
    },
  },
  { timestamps: true }
);

const Banner = mongoose.model<IBanner>('Banner', bannerSchema);

export default Banner;
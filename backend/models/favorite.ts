import { Schema, model, Document } from 'mongoose';

interface FavoriteDocument extends Document {
  user: Schema.Types.ObjectId;
  post: Schema.Types.ObjectId;
  createdAt: Date;
}

const favoriteSchema = new Schema<FavoriteDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',  // Tetap referensi ke User
      required: [true, 'User reference is required'],
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: 'Post',  // Ganti dari 'News' ke 'Post'
      required: [true, 'Post reference is required'],
    },
  },
  { timestamps: true }
);

// Index untuk memastikan satu user hanya bisa favorite satu post sekali
favoriteSchema.index({ user: 1, post: 1 }, { unique: true });

export default model<FavoriteDocument>('Favorite', favoriteSchema);

import { Schema, model, models } from 'mongoose';
import { Category } from './Category';
import {IVideo} from '@/lib/types/ivideo'

const videoSchema = new Schema<IVideo>(
  {
    title: { type: String, required: true },
    description: { type: String },
    videoUrl: { type: String, required: true },
    thumbnailUrl: { type: String },
    category: {
      type: Schema.Types.ObjectId,
      ref: Category, // Tên model tham chiếu
      required: true
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Video = models.Video || model<IVideo>('Video', videoSchema);

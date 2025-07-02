import mongoose, { Model, Schema } from 'mongoose';
import { IPost } from '@/lib/types/ipost';
const postSchema = new Schema<IPost>(
  {
    title: {type: String} ,
    slug: {type: String } ,
    content: { type: String, required: true },
  }
);

const Post: Model<IPost> = mongoose.models.Post || mongoose.model<IPost>('Post', postSchema);

export default Post;

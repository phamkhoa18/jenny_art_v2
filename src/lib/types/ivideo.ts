import { Types } from "mongoose";

export interface IVideo {
  _id?: string ,
  title: string;
  description?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  category: Types.ObjectId; // Tham chiếu đến Category
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

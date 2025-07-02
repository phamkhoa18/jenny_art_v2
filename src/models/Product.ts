import { Schema, model, models } from 'mongoose'
import { IProduct } from '@/lib/types/iproduct'
import { Category } from './Category'

// Schema cho sản phẩm (tranh ảnh)
const productSchema = new Schema<IProduct>(
  {
    image: { type: String, required: true },
    category: { type: Schema.Types.ObjectId, ref: Category }
  },
  { timestamps: true }
)

// Kiểm tra models đã tồn tại hay chưa để tránh lỗi trong Next.js (hot-reload)
export const Product = models.Product || model<IProduct>('Product', productSchema)

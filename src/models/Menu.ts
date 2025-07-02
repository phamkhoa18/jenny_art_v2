import { Schema, model, models } from 'mongoose';
import { IMenu } from '@/lib/types/imenu';


const menuSchema = new Schema<IMenu>(
  {
    name: { type: String, required: true },
    link: {type: String } ,
    slug: { type: String, required: true, unique: true },
    icon: { type: String, default: '' },
    order: { type: Number, default: 0 },
    parentId: { type: Schema.Types.ObjectId, ref: 'Menu', default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Tránh lỗi model compile nhiều lần khi hot reload (Next.js dev)
export const Menu = models.Menu || model<IMenu>('Menu', menuSchema);
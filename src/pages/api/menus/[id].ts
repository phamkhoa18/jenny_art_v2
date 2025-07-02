import type { NextApiRequest, NextApiResponse } from 'next';
import { Menu } from '@/models/Menu';
import mongoose from 'mongoose';
import connectDB from '@/lib/dbConnect';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  const { id } = req.query;

  // Kiểm tra id hợp lệ
  if (!id || Array.isArray(id) || !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: 'ID không hợp lệ' });
  }

  switch (req.method) {
    case 'GET':
      try {
        const menu = await Menu.findById(id).lean();
        if (!menu) {
          return res.status(404).json({ success: false, message: 'Không tìm thấy menu' });
        }
        return res.status(200).json({ success: true, data: menu });
      } catch {
        return res.status(500).json({ success: false, message: 'Lỗi lấy menu' });
      }

    case 'PUT':
        try {
            const { name, link, slug, icon, parentId, isActive, order } = req.body;

            // Lấy menu hiện tại để giữ lại giá trị cũ nếu một số trường không được truyền
            const existingMenu = await Menu.findById(id);
            if (!existingMenu) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy menu để cập nhật' });
            }

            // Nếu không truyền order thì giữ nguyên order cũ
            const finalOrder = order !== undefined ? order : existingMenu.order;

            const updated = await Menu.findByIdAndUpdate(
            id,
            {
                name: name ?? existingMenu.name,
                slug: slug ?? existingMenu.slug,
                link: link ?? existingMenu.link,
                icon: icon ?? existingMenu.icon,
                parentId: parentId !== undefined ? parentId : existingMenu.parentId,
                isActive: isActive !== undefined ? isActive : existingMenu.isActive,
                order: finalOrder,
            },
            { new: true, runValidators: true }
            );

            return res.status(200).json({ success: true, data: updated });
        } catch (error) {
            return res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Lỗi cập nhật menu',
            });
        }
        
    case 'DELETE':
      try {
        const deleted = await Menu.findByIdAndDelete(id);
        if (!deleted) {
          return res.status(404).json({ success: false, message: 'Không tìm thấy menu để xóa' });
        }
        return res.status(200).json({ success: true, message: 'Xóa menu thành công' });
      } catch {
        return res.status(500).json({ success: false, message: 'Lỗi xóa menu' });
      }

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      return res.status(405).end(`Phương thức ${req.method} không được phép`);
  }
}

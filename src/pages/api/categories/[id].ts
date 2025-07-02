/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/dbConnect';
import { Category } from '@/models/Category';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ success: false, error: 'ID không hợp lệ' });
  }

  switch (req.method) {
    // LẤY DANH MỤC THEO ID
    case 'GET':
      try {
        const category = await Category.findById(id).lean();
        if (!category) {
          return res.status(404).json({ success: false, error: 'Danh mục không tồn tại' });
        }
        return res.status(200).json({ success: true, data: category });
      } catch (error) {
        return res.status(500).json({
          success: false,
          error: 'Lỗi khi lấy danh mục',
          errorMessage: (error as any).message,
        });
      }

    // CẬP NHẬT DANH MỤC
    case 'PUT':
      try {
        const { name, link, slug, isActive } = req.body;

        if (!name || !slug) {
          return res.status(400).json({ success: false, error: 'Thiếu trường name hoặc slug' });
        }

        const updatedCategory = await Category.findByIdAndUpdate(
          id,
          { name, link, slug, isActive },
          { new: true, runValidators: true }
        ).lean();

        if (!updatedCategory) {
          return res.status(404).json({ success: false, error: 'Danh mục không tồn tại' });
        }

        return res.status(200).json({ success: true, data: updatedCategory });
      } catch (error) {
        return res.status(500).json({
          success: false,
          error: 'Lỗi khi cập nhật danh mục',
          errorMessage: (error as any).message,
        });
      }

    // XOÁ DANH MỤC
    case 'DELETE':
      try {
        const deleted = await Category.findByIdAndDelete(id);
        if (!deleted) {
          return res.status(404).json({ success: false, error: 'Danh mục không tồn tại' });
        }
        return res.status(200).json({ success: true, data: {} });
      } catch (error) {
        return res.status(500).json({
          success: false,
          error: 'Lỗi khi xóa danh mục',
          errorMessage: (error as any).message,
        });
      }

    // KHÔNG HỖ TRỢ METHOD
    default:
      return res.status(405).json({ success: false, error: 'Phương thức không được hỗ trợ' });
  }
}
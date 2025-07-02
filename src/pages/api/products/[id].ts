/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/dbConnect';
import { Product } from '@/models/Product';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ success: false, error: 'ID không hợp lệ' });
  }

  switch (req.method) {
    // LẤY SẢN PHẨM THEO ID
    case 'GET':
      try {
        const product = await Product.findById(id).populate('category').lean();
        if (!product) {
          return res.status(404).json({ success: false, error: 'Sản phẩm không tồn tại' });
        }
        return res.status(200).json({ success: true, data: product });
      } catch (error) {
        return res.status(500).json({
          success: false,
          error: 'Lỗi khi lấy sản phẩm',
          errorMessage: (error as any).message,
        });
      }

    // CẬP NHẬT SẢN PHẨM
    case 'PUT':
      try {
        const { image, category } = req.body;

        if (!image || !category) {
          return res.status(400).json({ success: false, error: 'Thiếu trường image hoặc category' });
        }

        const updatedProduct = await Product.findByIdAndUpdate(
          id,
          { image, category },
          { new: true, runValidators: true }
        ).populate('category').lean();

        if (!updatedProduct) {
          return res.status(404).json({ success: false, error: 'Sản phẩm không tồn tại' });
        }

        return res.status(200).json({ success: true, data: updatedProduct });
      } catch (error) {
        return res.status(500).json({
          success: false,
          error: 'Lỗi khi cập nhật sản phẩm',
          errorMessage: (error as any).message,
        });
      }

    // XOÁ SẢN PHẨM
    case 'DELETE':
      try {
        const deleted = await Product.findByIdAndDelete(id);
        if (!deleted) {
          return res.status(404).json({ success: false, error: 'Sản phẩm không tồn tại' });
        }
        return res.status(200).json({ success: true, data: {} });
      } catch (error) {
        return res.status(500).json({
          success: false,
          error: 'Lỗi khi xóa sản phẩm',
          errorMessage: (error as any).message,
        });
      }

    // KHÔNG HỖ TRỢ METHOD
    default:
      return res.status(405).json({ success: false, error: 'Phương thức không được hỗ trợ' });
  }
}

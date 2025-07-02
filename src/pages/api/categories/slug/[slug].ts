/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/dbConnect';
import { Category } from '@/models/Category';
import { Product } from '@/models/Product';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  // Lấy slug từ URL
  const { slug } = req.query;
  if (!slug || typeof slug !== 'string') {
    return res.status(400).json({ success: false, error: 'Slug không hợp lệ' });
  }

  if (req.method === 'GET') {
    try {
      // Tìm danh mục theo slug
      const category:any = await Category.findOne({ slug }).lean();
      if (!category) {
        return res.status(404).json({ success: false, error: 'Danh mục không tồn tại' });
      }

      // Lấy tham số phân trang và sắp xếp
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 12;
      const sort = (req.query.sort as string) || '-createdAt';
      const skip = (page - 1) * limit;

      // Lấy sản phẩm thuộc danh mục
      const products = await Product.find({ category: category._id })
        .populate('category')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean();

      // Đếm tổng số sản phẩm
      const totalProducts = await Product.countDocuments({ category: category._id });

      // Trả về kết quả
      return res.status(200).json({
        success: true,
        data: {
          category,
          products,
          total: totalProducts,
          page,
          totalPages: Math.ceil(totalProducts / limit),
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Lỗi khi lấy sản phẩm',
        errorMessage: (error as any).message,
      });
    }
  }

  // Phương thức không được hỗ trợ
  return res.status(405).json({ success: false, error: 'Phương thức không được hỗ trợ' });
}
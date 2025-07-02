/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/dbConnect';
import { Product } from '@/models/Product';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  switch (req.method) {
    // LẤY DANH SÁCH SẢN PHẨM
    case 'GET':
    try {
      const { sort = '-createdAt', category, limit, page } = req.query;

      const filters: any = {};
      if (category) {
        filters.category = category;
      }

      // Parse limit and page to numbers
      const parsedLimit = parseInt(limit as string, 10);
      const parsedPage = parseInt(page as string, 10);

      let query = Product.find(filters).populate('category').sort(sort as string);

      // Nếu truyền limit thì phân trang, không thì lấy hết
      if (!isNaN(parsedLimit)) {
        const skip = isNaN(parsedPage) || parsedPage < 1 ? 0 : (parsedPage - 1) * parsedLimit;
        query = query.skip(skip).limit(parsedLimit);
      }

      const products = await query.lean();
      const total = await Product.countDocuments(filters); // tổng số sản phẩm phù hợp

      return res.status(200).json({
        success: true,
        data: products,
        total,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Lỗi khi lấy danh sách sản phẩm',
        errorMessage: (error as any).message,
      });
    }

    // TẠO SẢN PHẨM MỚI
    case 'POST':
      try {
        const { image, category } = req.body;

        if (!image || !category) {
          return res.status(400).json({
            success: false,
            error: 'Thiếu trường bắt buộc: image hoặc category',
          });
        }

        const product = new Product({
          image,
          category,
        });

        await product.save();

        const populatedProduct = await Product.findById(product._id)
          .populate('category')
          .lean();

        return res.status(201).json({ success: true, data: populatedProduct });
      } catch (error) {
        return res.status(500).json({
          success: false,
          error: 'Lỗi khi tạo sản phẩm',
          errorMessage: (error as any).message,
        });
      }

    // METHOD KHÔNG HỖ TRỢ
    default:
      return res.status(405).json({
        success: false,
        error: 'Phương thức không được hỗ trợ',
      });
  }
}

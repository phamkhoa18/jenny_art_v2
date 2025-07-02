/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/dbConnect';
import { Category } from '@/models/Category';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  switch (req.method) {
    // LẤY DANH SÁCH CATEGORY
    case 'GET':
      try {
        const { sort = '-createdAt', isActive } = req.query;

        const filters: any = {};

        if (isActive !== undefined) {
          filters.isActive = isActive === 'true';
        }

        const categories = await Category.find(filters)
          .sort(sort as string)
          .lean();

        return res.status(200).json({
          success: true,
          data: categories,
          total: categories.length,
        });
      } catch (error) {
        return res.status(500).json({
          success: false,
          error: 'Lỗi khi lấy danh sách danh mục',
          errorMessage: (error as any).message,
        });
      }

    // TẠO CATEGORY MỚI
    case 'POST':
      try {
        const { name, link, slug, isActive } = req.body;

        if (!name || !slug) {
          return res.status(400).json({
            success: false,
            error: 'Thiếu trường bắt buộc: name hoặc slug',
          });
        }

        const category = new Category({
          name,
          link,
          slug,
          isActive: isActive ?? true,
        });

        await category.save();

        return res.status(201).json({ success: true, data: category });
      } catch (error) {
        return res.status(500).json({
          success: false,
          error: 'Lỗi khi tạo danh mục',
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
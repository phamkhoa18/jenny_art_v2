import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/dbConnect';
import { Menu } from '@/models/Menu';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  switch (req.method) {
    case 'GET':
      try {
        // List all menus, sorted by order ascending
        const menus = await Menu.find({}).sort({ order: 1 }).lean();
        return res.status(200).json({ success: true, data: menus });
      } catch (error) {
        return res.status(500).json({ success: false, message: error });
      }

    case 'POST':
      try {
        const { name, link, slug, icon, order, parentId } = req.body;

        // Validate required fields
        if (!name || !slug) {
          return res.status(400).json({ success: false, message: 'Thiếu trường name hoặc slug' });
        }

        // Xử lý order: nếu không có, tự gán order cao nhất + 1
        let finalOrder = order;

        if (finalOrder === undefined || finalOrder === null) {
          // Cast rõ kiểu cho lastMenu để TS không báo lỗi
          const lastMenu = await Menu.findOne({}).sort({ order: -1 }).lean() as { order: number } | null;
          finalOrder = lastMenu ? lastMenu.order + 1 : 1;
        }

        // Tạo menu mới
        const newMenu = new Menu({
          name,
          slug,
          link,
          icon: icon || '',
          order: finalOrder,
          parentId: parentId || null,
        });

        await newMenu.save();

        return res.status(201).json({ success: true, data: newMenu });
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: error instanceof Error ? error.message : 'Lỗi server',
        });
      }

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).end(`Phương thức ${req.method} không được phép`);
  }
}

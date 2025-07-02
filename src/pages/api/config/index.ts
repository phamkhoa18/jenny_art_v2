/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextApiRequest, NextApiResponse } from 'next';

import WebsiteConfig from '@/models/WebsiteConfig';
import connectDB from '@/lib/dbConnect';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  switch (req.method) {
    case 'GET':
      try {
        const config = await WebsiteConfig.findOne().lean();
        return res.status(200).json({ success: true, data: config });
      } catch (err) {
        return res.status(500).json({
          success: false,
          error: 'Không thể lấy cấu hình',
          errorMessage: (err as any).message,
        });
      }

    case 'POST':
      try {
        const existing = await WebsiteConfig.findOne();
        if (existing) {
          return res.status(400).json({ success: false, error: 'Đã có cấu hình. Không thể tạo thêm.' });
        }

        const config = await WebsiteConfig.create(req.body);
        return res.status(201).json({ success: true, data: config });
      } catch (err) {
        return res.status(500).json({
          success: false,
          error: 'Lỗi khi tạo cấu hình',
          errorMessage: (err as any).message,
        });
      }

    case 'PUT':
      try {
        const config = await WebsiteConfig.findOneAndUpdate({}, req.body, {
          new: true,
          upsert: true,
        });
        return res.status(200).json({ success: true, data: config });
      } catch (err) {
        return res.status(500).json({
          success: false,
          error: 'Lỗi khi cập nhật cấu hình',
          errorMessage: (err as any).message,
        });
      }

    case 'DELETE':
      try {
        await WebsiteConfig.deleteMany();
        return res.status(200).json({ success: true, message: 'Đã xóa cấu hình website' });
      } catch (err) {
        return res.status(500).json({
          success: false,
          error: 'Lỗi khi xóa cấu hình',
          errorMessage: (err as any).message,
        });
      }

    default:
      return res.status(405).json({ success: false, error: 'Phương thức không được hỗ trợ' });
  }
}

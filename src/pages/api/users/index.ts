
import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/dbConnect';
import User from '@/models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await connectDB();

  try {
    switch (req.method) {
      case 'GET':
        // Lấy danh sách user sắp xếp theo name
        const users = await User.find({}).sort({ name: 1 }).lean();
        return res.status(200).json({ success: true, data: users });

      case 'POST':
        const { email, password, name, role } = req.body;
        console.log(req.body);
        

        if (!email || !password || !name) {
          return res.status(400).json({ success: false, message: 'Thiếu trường email, password hoặc name' });
        }

        // Kiểm tra email đã tồn tại chưa
        const exist = await User.findOne({ email });
        if (exist) {
          return res.status(400).json({ success: false, message: 'Email đã tồn tại' });
        }

        // Tạo user mới
        const newUser = new User({
          email,
          password,
          name,
          role: role || 'admin', // default role nếu không truyền
        });

        await newUser.save();

        // Trả về user mới tạo (cẩn thận không gửi password ra)
        const userResponse = {
          _id: newUser._id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
          createdAt: newUser.createdAt,
          updatedAt: newUser.updatedAt,
        };

        return res.status(201).json({ success: true, data: userResponse });

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).end(`Phương thức ${req.method} không được phép`);
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
}

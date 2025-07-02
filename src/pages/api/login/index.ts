import { NextApiRequest, NextApiResponse } from "next";
import User from "@/models/User";
import connectDB from "@/lib/dbConnect";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Phương thức không được hỗ trợ" });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Thiếu email hoặc mật khẩu" });
  }

  const user = await User.findOne({ email });

  if (!user || user.password !== password) {
    return res.status(401).json({ success: false, message: "Email hoặc mật khẩu không đúng" });
  }


  return res.status(200).json({
    success: true,
    user: {
      _id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  });
}

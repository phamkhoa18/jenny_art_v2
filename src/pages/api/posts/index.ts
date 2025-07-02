import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/dbConnect';
import Post from '@/models/Post';
// import { IPost } from '@/lib/types/ipost';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();
  

  try {
    switch (req.method) {
      case 'GET':
        const {limit} = req.query ;
        const posts = await Post.find()
          .select('_id title  slug featuredImage excerpt updatedAt type author')
          .populate('type', 'name slug')
          .sort({ createdAt: -1 })
          .limit(limit ? parseInt(limit as string, 10) : 0)
          .lean();

        return res.status(200).json({ success: true, data: posts });

      case 'POST':
        const {
          title,
          slug,
          excerpt,
          content,
          author,
          type,
          tags,
          featuredImage,
          status,
          publishedAt,
        } = req.body;

        // Kiểm tra trường bắt buộc
        if (!title || !slug || !content || !author) {
          return res.status(400).json({
            success: false,
            message: 'Thiếu trường bắt buộc: title, slug, content hoặc author',
          });
        }

        // Kiểm tra trùng slug
        const existing = await Post.findOne({ slug });
        if (existing) {
          return res.status(400).json({ success: false, message: 'Slug đã tồn tại' });
        }

        // Tạo mới bài viết
        const newPost = new Post({
          title,
          slug,
          excerpt: excerpt || '',
          content,
          author,
          type: type || [],
          tags: tags || [],
          featuredImage: featuredImage || '',
          status: status || 'draft',
          publishedAt: publishedAt || null,
          viewsCount: 0,
          commentsCount: 0,
        });

        await newPost.save();

        return res.status(201).json({ success: true, data: newPost });

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).end(`Phương thức ${req.method} không được phép`);
    }
  } catch (error) {
    console.error('Lỗi tạo post:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
}

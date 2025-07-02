import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/dbConnect';
import Post from '@/models/Post';
import { IPost } from '@/lib/types/ipost';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  const { param } = req.query;

  if (typeof param !== 'string') {
    return res.status(400).json({ success: false, message: 'Param không hợp lệ' });
  }

  try {
    let post: IPost | null = null;

    // Kiểm tra nếu là ObjectId
    const isValidObjectId = (id: string) => /^[0-9a-fA-F]{24}$/.test(id);

    if (isValidObjectId(param)) {
      post = await Post.findById(param)
        .populate('author', 'name email')
        .populate('type', 'name slug');
    } else {
      post = await Post.findOne({ slug: param })
        .populate('author', 'name email')
        .populate('type', 'name slug');
    }

    if (!post) {
      return res.status(404).json({ success: false, message: 'Bài viết không tồn tại' });
    }

    switch (req.method) {
      case 'GET':
        return res.status(200).json({ success: true, data: post });

      case 'PUT':
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

        if (!title || !slug || !content || !author) {
          return res.status(400).json({
            success: false,
            message: 'Thiếu trường bắt buộc: title, slug, content hoặc author',
          });
        }

        // Kiểm tra trùng slug nếu slug thay đổi
        if (post.slug !== slug) {
          const slugExists = await Post.findOne({ slug });
          if (slugExists) {
            return res.status(400).json({ success: false, message: 'Slug đã tồn tại' });
          }
        }

        const updatedPost = await Post.findByIdAndUpdate(
          post._id,
          {
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
          },
          { new: true, runValidators: true }
        );

        return res.status(200).json({ success: true, data: updatedPost });

      case 'DELETE':
        const deletedPost = await Post.findByIdAndDelete(post._id);
        if (!deletedPost) {
          return res.status(404).json({ success: false, message: 'Không tìm thấy bài viết để xóa' });
        }
        return res.status(200).json({ success: true, message: 'Xoá bài viết thành công' });

      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).end(`Phương thức ${req.method} không được hỗ trợ`);
    }
  } catch (error) {
    console.error('Lỗi xử lý bài viết:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
}

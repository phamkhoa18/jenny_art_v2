'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import ImageUploader from '@/components/cloudinaryUpload';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'react-hot-toast';
import { ICategory } from '@/lib/types/icategory';

export default function CreateProductPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    image: '',
    category: '',
  });

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<{_id: string; name: string}[]>([]);

  async function getDataCategory() {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      const simplified = data.data.map((item: ICategory) => ({
        _id: item._id,
        name: item.name,
      }));
      setCategories(simplified);
    } catch (error) {
      console.error(error);
      toast.error('Lỗi khi tải danh mục');
    }
  }

  useEffect(() => {
    getDataCategory();
  }, []);

  // Hàm nhận URL ảnh chính từ ImageUploader
  const handleImageUploadSuccess = (url: string) => {
    setFormData((prev) => ({ ...prev, image: url }));
  };

  const handleSubmit = async () => {
    if (!formData.image || !formData.category) {
      toast.error('Vui lòng chọn ảnh chính và danh mục.');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        toast.success('Tạo sản phẩm thành công!');
        router.push('/admin/products');
      } else {
        toast.error(data.error || 'Đã có lỗi xảy ra!');
      }
    } catch {
      toast.error('Không thể kết nối tới server!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-4">Tạo sản phẩm mới</h1>

      <Card>
        <CardContent className="flex flex-col gap-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="mb-2.5" htmlFor="image">Ảnh chính</Label>
              <ImageUploader onUploadSuccess={handleImageUploadSuccess} />
              {formData.image && (
                <p className="mt-2 text-sm text-gray-600">
                  Ảnh chính đã chọn: <a href={formData.image} target="_blank" rel="noreferrer" className="text-blue-600 underline">{formData.image}</a>
                </p>
              )}
            </div>

            <div>
              <Label className="mb-2.5">Chọn danh mục</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat._id} value={cat._id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Đang lưu...' : 'Tạo sản phẩm'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
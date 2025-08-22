/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import ImageUploader from '@/components/cloudinaryUpload';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  ArrowLeft, 
  Save, 
  Trash2, 
  Image as ImageIcon, 
  Tag, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { ICategory } from '@/lib/types/icategory';
import { IProduct } from '@/lib/types/iproduct';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params as { id: string };

  const [formData, setFormData] = useState({
    image: '',
    category: '',
  });

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [categories, setCategories] = useState<{_id: string; name: string}[]>([]);
  const [product, setProduct] = useState<IProduct | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Track original data to detect changes
  const [originalData, setOriginalData] = useState<any>(null);

  const handleImageUploadSuccess = (url: string) => {
    setFormData((prev) => ({ ...prev, image: url }));
    setHasChanges(true);
  };

  const handleCategoryChange = (value: string) => {
    setFormData(prev => ({ ...prev, category: value }));
    setHasChanges(true);
  };

  const getDataCategory = async () => {
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
  };

  const fetchProduct = async () => {
    try {
      setPageLoading(true);
      const res = await fetch(`/api/products/${id}`);
      const data = await res.json();
      
      if (data.success && data.data) {
        const productData = data.data;
        setProduct(productData);
        
        const formDataToSet = {
          image: productData.image || '',
          category: productData.category?._id || '',
        };
        
        setFormData(formDataToSet);
        setOriginalData(formDataToSet);
        setHasChanges(false);
      } else {
        toast.error('Không tìm thấy sản phẩm');
        router.push('/admin/products');
      }
    } catch {
      toast.error('Lỗi khi tải sản phẩm');
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchProduct();
      getDataCategory();
    }
  }, [id]);

  // Check for changes
  useEffect(() => {
    if (originalData) {
      const changed = JSON.stringify(formData) !== JSON.stringify(originalData);
      setHasChanges(changed);
    }
  }, [formData, originalData]);

  const handleSubmit = async () => {
    if (!formData.image || !formData.category) {
      toast.error('Vui lòng chọn ảnh chính và danh mục.');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data.success) {
        toast.success('Cập nhật sản phẩm thành công!');
        setHasChanges(false);
        setOriginalData(formData);
        // Refresh product data
        fetchProduct();
      } else {
        toast.error(data.error || 'Cập nhật thất bại!');
      }
    } catch {
      toast.error('Lỗi khi gửi yêu cầu');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (data.success) {
        toast.success('Đã xóa sản phẩm thành công!');
        router.push('/admin/products');
      } else {
        toast.error(data.error || 'Xóa thất bại!');
      }
    } catch {
      toast.error('Lỗi khi xóa sản phẩm');
    } finally {
      setShowDeleteDialog(false);
    }
  };

  const selectedCategory = categories.find(cat => cat._id === formData.category);

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50">
        <div className="container mx-auto p-6 space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded" />
            <Skeleton className="h-8 w-64" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Skeleton className="h-96 w-full rounded-lg" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-32 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => router.push('/admin/products')}
              className="border-0 bg-white/70 hover:bg-white shadow-sm backdrop-blur-sm"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Chỉnh sửa sản phẩm</h1>
              <p className="text-muted-foreground">
                {selectedCategory && (
                  <span className="flex items-center gap-1 mt-1">
                    <Tag className="h-4 w-4" />
                    {selectedCategory.name}
                  </span>
                )}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {hasChanges && (
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 animate-pulse">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Có thay đổi chưa lưu
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={fetchProduct}
              className="border-0 bg-white/70 hover:bg-white"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Image Upload */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-blue-600" />
                  Hình ảnh sản phẩm
                </CardTitle>
                <CardDescription>
                  Tải lên ảnh chính cho sản phẩm của bạn
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="image" className="text-base font-medium">
                    Ảnh chính *
                  </Label>
                  <div className="relative">
                    <ImageUploader 
                      onUploadSuccess={handleImageUploadSuccess} 
                      initialImage={formData.image} 
                    />
                  </div>
                </div>

                {formData.image && (
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="font-medium text-green-800 mb-1">
                          Ảnh đã được chọn thành công
                        </h4>
                        <p className="text-sm text-green-700 mb-2">
                          Ảnh của bạn đã được tải lên và sẵn sàng sử dụng
                        </p>
                        <a 
                          href={formData.image} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 underline"
                        >
                          Xem ảnh gốc <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* Current Image Preview */}
                {formData.image && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      Xem trước:
                    </Label>
                    <div className="relative w-full max-w-md mx-auto">
                      <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-50">
                        <Image
                          src={formData.image}
                          alt="Product preview"
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Category Selection */}
            <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5 text-purple-600" />
                  Phân loại sản phẩm
                </CardTitle>
                <CardDescription>
                  Chọn danh mục phù hợp cho sản phẩm
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-base font-medium">
                    Danh mục *
                  </Label>
                  <Select
                    value={formData.category}
                    onValueChange={handleCategoryChange}
                  >
                    <SelectTrigger className="border-0 bg-gray-50/80 focus:bg-white transition-colors">
                      <SelectValue placeholder="Chọn danh mục sản phẩm" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat._id} value={cat._id}>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            {cat.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedCategory && (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">
                        Danh mục được chọn:
                      </span>
                    </div>
                    <p className="text-blue-700 font-medium mt-1">
                      {selectedCategory.name}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Product Info */}
            {product && (
              <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-green-600" />
                    Thông tin hệ thống
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 gap-3 text-sm">
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-muted-foreground">Ngày tạo:</span>
                      <span className="font-medium">
                        {new Date(product.createdAt || '').toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    
                    {product.updatedAt && (
                      <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-muted-foreground">Cập nhật lần cuối:</span>
                        <span className="font-medium">
                          {new Date(product.updatedAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-muted-foreground">ID sản phẩm:</span>
                      <code className="text-xs bg-gray-200 px-2 py-1 rounded font-mono">
                        {product._id}
                      </code>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
              <CardContent className="p-4 space-y-3">
                <Button 
                  onClick={handleSubmit} 
                  disabled={loading || !hasChanges || !formData.image || !formData.category}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
                  size="lg"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Đang lưu thay đổi...
                    </div>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Lưu thay đổi
                    </>
                  )}
                </Button>
                
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteDialog(true)}
                  className="w-full shadow-lg"
                  size="lg"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Xóa sản phẩm
                </Button>

                {!hasChanges && formData.image && formData.category && (
                  <div className="text-center text-sm text-green-600 flex items-center justify-center gap-1">
                    <CheckCircle className="h-4 w-4" />
                    Dữ liệu đã được lưu
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-white border-0 shadow-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Xác nhận xóa sản phẩm
            </AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa sản phẩm này không? Hành động này không thể hoàn tác và tất cả dữ liệu liên quan sẽ bị mất vĩnh viễn.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-0 bg-gray-100 hover:bg-gray-200">
              Hủy bỏ
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Xóa vĩnh viễn
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
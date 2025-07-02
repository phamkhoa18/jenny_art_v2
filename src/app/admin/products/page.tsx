'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Image from 'next/image';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Pencil, Trash2 } from 'lucide-react';
import { IProduct } from '@/lib/types/iproduct';

interface ICategory {
  _id: string;
  name: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 12;

  const fetchProducts = async (page = 1, category = selectedCategory) => {
    setLoading(true);
    try {
      const url = new URL('/api/products', window.location.origin);
      url.searchParams.append('limit', itemsPerPage.toString());
      url.searchParams.append('page', page.toString());
      if (category !== 'all') url.searchParams.append('category', category);

      const res = await fetch(url.toString());
      const data = await res.json();

      if (data.success) {
        setProducts(data.data);
        setTotalItems(data.total);
        setCurrentPage(page);
      } else {
        setError('Không thể tải sản phẩm');
      }
    } catch {
      setError('Lỗi kết nối đến máy chủ');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.success) {
        setCategories(data.data);
      } else {
        setError('Không thể tải danh mục');
      }
    } catch {
      setError('Lỗi kết nối đến máy chủ');
    }
  };

  useEffect(() => {
    fetchProducts(1); // mặc định gọi trang đầu tiên
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts(1); // khi đổi danh mục thì gọi lại trang đầu tiên
  }, [selectedCategory]);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Đã xóa sản phẩm thành công');
        fetchProducts(currentPage);
      } else {
        toast.error('Xóa không thành công');
      }
    } catch {
      toast.error('Lỗi khi xóa sản phẩm');
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="p-3 space-y-2">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Quản lý sản phẩm</h1>
        <Link href="/admin/products/create">
          <Button>Tạo sản phẩm</Button>
        </Link>
      </div>

      <div className="flex gap-4 mb-4">
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Chọn danh mục" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả danh mục</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category._id} value={category._id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="overflow-x-auto">
        <CardContent className="p-4">
          {loading ? (
            <Skeleton className="h-10 w-full" />
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : products.length === 0 ? (
            <p className="text-muted-foreground">Không có sản phẩm nào</p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Hình ảnh</TableHead>
                    <TableHead>Danh mục</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead className="text-center">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product._id}>
                      <TableCell>
                        <Image
                          src={product.image}
                          alt={product.category.name}
                          width={100}
                          height={50}
                          className="object-cover rounded"
                        />
                      </TableCell>
                      <TableCell>{product.category.name || 'N/A'}</TableCell>
                      <TableCell>
                        {new Date(product.createdAt || '').toLocaleDateString('vi-VN')}
                      </TableCell>
                      <TableCell className="flex justify-center gap-2 items-center">
                        <Link href={`/admin/products/edit/${product._id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-blue-600 hover:text-blue-800"
                            aria-label="Chỉnh sửa sản phẩm"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                        </Link>
                        <AlertDialog open={deleteId === product._id} onOpenChange={(open) => !open && setDeleteId(null)}>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-800"
                              aria-label="Xóa sản phẩm"
                              onClick={() => setDeleteId(product._id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className='bg-white'>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Bạn chắc chắn muốn xóa sản phẩm này?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Hành động này không thể hoàn tác. Vui lòng xác nhận để tiếp tục.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Hủy</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => {
                                  if (deleteId) handleDelete(deleteId);
                                }}
                                className="bg-red-600 text-white hover:bg-red-700"
                              >
                                Xóa
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* PHÂN TRANG */}
              <div className="flex justify-center mt-4 gap-2 flex-wrap">
                {Array.from({ length: Math.ceil(totalItems / itemsPerPage) }, (_, index) => (
                  <Button
                    key={index}
                    variant={currentPage === index + 1 ? 'default' : 'outline'}
                    onClick={() => fetchProducts(index + 1)}
                    className="w-10 h-10 p-0"
                  >
                    {index + 1}
                  </Button>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

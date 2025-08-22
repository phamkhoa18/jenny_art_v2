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
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Pencil, 
  Trash2, 
  Plus, 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Calendar,
  Tag,
  Image as ImageIcon,
  RefreshCw
} from 'lucide-react';
import { IProduct } from '@/lib/types/iproduct';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ICategory {
  _id: string;
  name: string;
}

type ViewMode = 'table' | 'grid';

export default function ProductsPage() {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [sortBy, setSortBy] = useState<string>('-createdAt');

  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 12;

  const fetchProducts = async (page = 1, category = selectedCategory, search = searchTerm, sort = sortBy) => {
    setLoading(true);
    try {
      const url = new URL('/api/products', window.location.origin);
      url.searchParams.append('limit', itemsPerPage.toString());
      url.searchParams.append('page', page.toString());
      url.searchParams.append('sort', sort);
      if (category !== 'all') url.searchParams.append('category', category);
      if (search) url.searchParams.append('search', search);

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
    fetchProducts(1);
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts(1);
  }, [selectedCategory, searchTerm, sortBy]);

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
        toast.error(data.error || 'Xóa không thành công');
      }
    } catch {
      toast.error('Lỗi khi xóa sản phẩm');
    } finally {
      setDeleteId(null);
    }
  };

  const handleRefresh = () => {
    fetchProducts(currentPage);
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Pagination với max 5 buttons
  const getPaginationButtons = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const ProductCard = ({ product }: { product: IProduct }) => (
    <Card className="group hover:shadow-lg transition-all duration-200 border-0 shadow-sm bg-white/50 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="relative mb-4 overflow-hidden rounded-lg bg-gray-50">
          <div className="aspect-square relative">
            <Image
              src={product.image}
              alt={product.category?.name || 'Product'}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-200"
            />
          </div>
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="sm" className="h-8 w-8 p-0 bg-white/90">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Hành động</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={`/admin/products/edit/${product._id}`}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Chỉnh sửa
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-red-600"
                  onClick={() => setDeleteId(product._id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Xóa
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        <div className="space-y-2">
          <Badge variant="secondary" className="text-xs">
            <Tag className="mr-1 h-3 w-3" />
            {product.category?.name || 'N/A'}
          </Badge>
          
          <div className="flex items-center text-xs text-muted-foreground">
            <Calendar className="mr-1 h-3 w-3" />
            {new Date(product.createdAt || '').toLocaleDateString('vi-VN')}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quản lý sản phẩm</h1>
            <p className="text-muted-foreground mt-1">
              Tổng cộng {totalItems} sản phẩm
            </p>
          </div>
          <Link href="/admin/products/create">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg">
              <Plus className="mr-2 h-4 w-4" />
              Tạo sản phẩm
            </Button>
          </Link>
        </div>

        {/* Filters and Search */}
        <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Bộ lọc & Tìm kiếm
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Tìm kiếm sản phẩm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-0 bg-gray-50/80 focus:bg-white transition-colors"
                />
              </div>

              {/* Category Filter */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full lg:w-[200px] border-0 bg-gray-50/80">
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

              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full lg:w-[200px] border-0 bg-gray-50/80">
                  <SelectValue placeholder="Sắp xếp" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="-createdAt">Mới nhất</SelectItem>
                  <SelectItem value="createdAt">Cũ nhất</SelectItem>
                  <SelectItem value="category">Theo danh mục</SelectItem>
                </SelectContent>
              </Select>

              {/* View Mode & Refresh */}
              <div className="flex gap-2">
                <div className="flex rounded-lg bg-gray-100/80 p-1">
                  <Button
                    variant={viewMode === 'table' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('table')}
                    className="h-8 px-3"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="h-8 px-3"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={loading}
                  className="h-8 px-3 border-0 bg-gray-50/80 hover:bg-gray-100"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content */}
        <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm min-h-[500px]">
          <CardContent className="p-6">
            {loading ? (
              <div className="space-y-4">
                {viewMode === 'table' ? (
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <Skeleton key={i} className="h-64 w-full" />
                    ))}
                  </div>
                )}
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="text-red-500 mb-4">
                  <ImageIcon className="h-12 w-12 mx-auto mb-2" />
                  <p className="text-lg font-medium">{error}</p>
                </div>
                <Button onClick={handleRefresh} variant="outline">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Thử lại
                </Button>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <ImageIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Không có sản phẩm</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || selectedCategory !== 'all' 
                    ? 'Không tìm thấy sản phẩm phù hợp với bộ lọc của bạn'
                    : 'Hãy tạo sản phẩm đầu tiên của bạn'
                  }
                </p>
                <Link href="/admin/products/create">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Tạo sản phẩm đầu tiên
                  </Button>
                </Link>
              </div>
            ) : viewMode === 'table' ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-200">
                      <TableHead className="font-semibold">Hình ảnh</TableHead>
                      <TableHead className="font-semibold">Danh mục</TableHead>
                      <TableHead className="font-semibold">Ngày tạo</TableHead>
                      <TableHead className="text-center font-semibold">Hành động</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product._id} className="border-gray-100 hover:bg-gray-50/50 transition-colors">
                        <TableCell>
                          <div className="relative w-16 h-16 overflow-hidden rounded-lg bg-gray-100">
                            <Image
                              src={product.image}
                              alt={product.category?.name || 'Product'}
                              fill
                              className="object-cover"
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-white">
                            <Tag className="mr-1 h-3 w-3" />
                            {product.category?.name || 'N/A'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          <div className="flex items-center">
                            <Calendar className="mr-2 h-4 w-4" />
                            {new Date(product.createdAt || '').toLocaleDateString('vi-VN')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-center gap-2">
                            <Link href={`/admin/products/edit/${product._id}`}>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-blue-600 hover:text-blue-800 border-blue-200 hover:border-blue-300"
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-800 border-red-200 hover:border-red-300"
                              onClick={() => setDeleteId(product._id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Hiển thị {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalItems)} của {totalItems} sản phẩm
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchProducts(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="border-0 bg-gray-50/80"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  <div className="flex items-center space-x-1">
                    {getPaginationButtons().map((page, index) => (
                      <Button
                        key={index}
                        variant={currentPage === page ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => typeof page === 'number' && fetchProducts(page)}
                        disabled={typeof page !== 'number'}
                        className={`w-10 h-8 p-0 ${
                          currentPage === page 
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600' 
                            : 'border-0 bg-gray-50/80'
                        }`}
                      >
                        {page}
                      </Button>
                    ))}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchProducts(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="border-0 bg-gray-50/80"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="bg-white border-0 shadow-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">Xác nhận xóa sản phẩm</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Hành động này không thể hoàn tác. Sản phẩm sẽ được xóa vĩnh viễn khỏi hệ thống.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-0 bg-gray-100 hover:bg-gray-200">
              Hủy bỏ
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteId) handleDelete(deleteId);
              }}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Xóa sản phẩm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
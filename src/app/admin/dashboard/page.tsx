// app/admin/dashboard/page.tsx

'use client'

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  FileText, 
  FolderOpen,
  Image,
  TrendingUp,
  Eye,
  Calendar,
  RefreshCw,
  Download,
  Settings,
  BarChart3,
  Activity
} from "lucide-react";
import DashboardCharts from '../DashboardCharts';

interface DashboardStats {
  totalUsers: number;
  totalCategories: number;
  totalMenus: number;
  totalProducts: number;
  activeUsers: number;
  activeCategories: number;
  recentActivities: Activity[];
  monthlyGrowth: {
    users: number;
    categories: number;
    products: number;
  };
}

interface Activity {
  _id: string;
  type: 'user' | 'category' | 'menu' | 'product';
  action: string;
  entityName: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Sử dụng API chung với type=overview
      const response = await fetch('/api/dashboard?type=overview');
      if (!response.ok) {
        throw new Error('Không thể tải dữ liệu dashboard');
      }
      const result = await response.json();
      
      if (result.success) {
        // Transform data để phù hợp với interface
        const transformedData = {
          totalUsers: result.data.stats.totalUsers,
          totalCategories: result.data.stats.totalCategories,
          totalMenus: result.data.stats.totalMenus,
          totalProducts: result.data.stats.totalProducts,
          activeUsers: result.data.stats.activeUsers,
          activeCategories: result.data.stats.activeCategories,
          monthlyGrowth: result.data.growth,
          recentActivities: result.data.recentActivities
        };
        setStats(transformedData);
      } else {
        throw new Error(result.error || 'Có lỗi xảy ra');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={fetchDashboardData}>Thử lại</Button>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-8 p-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Quản Trị</h1>
          <p className="text-muted-foreground">
            Tổng quan hệ thống quản lý nội dung
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={fetchDashboardData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Làm mới
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Xuất báo cáo
          </Button>
          <Button size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Cài đặt
          </Button>
        </div>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Tổng Người Dùng</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold">{stats.totalUsers}</p>
                  <Badge variant="secondary" className="text-green-600 bg-green-50">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +{stats.monthlyGrowth.users}%
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.activeUsers} đang hoạt động
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Danh Mục</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold">{stats.totalCategories}</p>
                  <Badge variant="secondary" className="text-green-600 bg-green-50">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +{stats.monthlyGrowth.categories}%
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.activeCategories} đang kích hoạt
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-50 rounded-lg flex items-center justify-center">
                <FolderOpen className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Menu Items</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold">{stats.totalMenus}</p>
                  <Badge variant="secondary" className="text-blue-600 bg-blue-50">
                    <Activity className="h-3 w-3 mr-1" />
                    Stable
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">Cấu trúc điều hướng</p>
              </div>
              <div className="h-12 w-12 bg-green-50 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Sản Phẩm/Tranh</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold">{stats.totalProducts}</p>
                  <Badge variant="secondary" className="text-green-600 bg-green-50">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +{stats.monthlyGrowth.products}%
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">Bộ sưu tập tranh ảnh</p>
              </div>
              <div className="h-12 w-12 bg-orange-50 rounded-lg flex items-center justify-center">
                <Image className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold">Biểu đồ thống kê theo thời gian</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <BarChart3 className="h-4 w-4 mr-2" />
                Xem chi tiết
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <DashboardCharts />
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Thống kê nhanh</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Người dùng hoạt động</p>
                <p className="text-sm font-bold">{Math.round((stats.activeUsers / stats.totalUsers) * 100)}%</p>
              </div>
              <Progress value={(stats.activeUsers / stats.totalUsers) * 100} className="h-2" />
              <p className="text-xs text-muted-foreground">+{stats.monthlyGrowth.users}% so với tháng trước</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Danh mục có sản phẩm</p>
                <p className="text-sm font-bold">{Math.round((stats.activeCategories / stats.totalCategories) * 100)}%</p>
              </div>
              <Progress value={(stats.activeCategories / stats.totalCategories) * 100} className="h-2" />
              <p className="text-xs text-muted-foreground">+{stats.monthlyGrowth.categories}% so với tháng trước</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Tăng trưởng sản phẩm</p>
                <p className="text-sm font-bold">+{stats.monthlyGrowth.products}%</p>
              </div>
              <Progress value={Math.min(stats.monthlyGrowth.products, 100)} className="h-2" />
              <p className="text-xs text-muted-foreground">So với tháng trước</p>
            </div>

            <div className="pt-4 border-t">
              <Button className="w-full" variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                Xem báo cáo chi tiết
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-semibold">Hoạt Động Gần Đây</CardTitle>
          <Button variant="ghost" size="sm">
            Xem tất cả
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.recentActivities.length > 0 ? (
              stats.recentActivities.map((activity) => (
                <div key={activity._id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    {activity.type === 'user' && <Users className="h-4 w-4 text-primary" />}
                    {activity.type === 'category' && <FolderOpen className="h-4 w-4 text-primary" />}
                    {activity.type === 'menu' && <FileText className="h-4 w-4 text-primary" />}
                    {activity.type === 'product' && <Image className="h-4 w-4 text-primary" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.entityName}</p>
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3 mr-1" />
                    {new Date(activity.createdAt).toLocaleDateString('vi-VN')}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Chưa có hoạt động nào</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
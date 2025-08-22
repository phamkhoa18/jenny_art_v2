/* eslint-disable @typescript-eslint/no-explicit-any */
// components/admin/DashboardCharts.tsx

'use client'

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { TrendingUp, Users, FolderOpen, Image, Calendar } from 'lucide-react';

interface ChartData {
  userStats: any[];
  categoryStats: any[];
  productStats: any[];
  weeklyTrends: any;
}

export default function DashboardCharts() {
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchChartData();
  }, []);

  const fetchChartData = async () => {
    setLoading(true);
    try {
      // Sử dụng API chung với type=charts
      const response = await fetch('/api/dashboard?type=charts');
      const result = await response.json();

      if (result.success) {
        const data = result.data;
        setChartData({
          userStats: data.monthly.users || [],
          categoryStats: data.distribution.productsByCategory || [],
          productStats: data.monthly.products || [],
          weeklyTrends: data.weekly || { users: [], products: [] }
        });
      } else {
        throw new Error(result.error || 'Không thể tải dữ liệu biểu đồ');
      }
    } catch (error) {
      console.error('Error fetching chart data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <TrendingUp className="h-8 w-8 animate-pulse mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Đang tải biểu đồ...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!chartData) return null;

  // Màu sắc cho charts
  // Dữ liệu cho pie chart
  const userRoleData = [
    { name: 'Admin', value: 5, color: '#8884d8' },
    { name: 'Editor', value: 12, color: '#82ca9d' },
    { name: 'Author', value: 23, color: '#ffc658' }
  ];

  // Kết hợp dữ liệu weekly trends
  const combinedWeeklyData = chartData.weeklyTrends.users?.map((userDay: any) => {
    const productDay = chartData.weeklyTrends.products?.find(
      (p: any) => p._id === userDay._id
    );
    return {
      date: userDay._id,
      users: userDay.count,
      products: productDay?.count || 0
    };
  }) || [];

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="users">Người dùng</TabsTrigger>
          <TabsTrigger value="categories">Danh mục</TabsTrigger>
          <TabsTrigger value="products">Sản phẩm</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weekly Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Xu hướng 7 ngày qua
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={combinedWeeklyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="users" 
                      stroke="#8884d8" 
                      strokeWidth={2}
                      name="Người dùng mới"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="products" 
                      stroke="#82ca9d" 
                      strokeWidth={2}
                      name="Sản phẩm mới"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* User Roles Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Phân bố vai trò người dùng
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={userRoleData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }: any) => 
                        `${name || ''} ${((percent || 0) * 100).toFixed(0)}%`
                        }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {userRoleData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Thống kê người dùng theo tháng
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={chartData.userStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="users" 
                    stroke="#8884d8" 
                    fill="#8884d8" 
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5" />
                Số lượng sản phẩm theo danh mục
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData.categoryStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="productCount" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5" />
                Sản phẩm được thêm theo tháng
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={chartData.productStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="products" 
                    stroke="#ffc658" 
                    fill="#ffc658" 
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Dữ liệu được cập nhật lúc {new Date().toLocaleString('vi-VN')}
        </p>
        <Button onClick={fetchChartData} variant="outline" size="sm">
          <TrendingUp className="h-4 w-4 mr-2" />
          Làm mới biểu đồ
        </Button>
      </div>
    </div>
  );
}

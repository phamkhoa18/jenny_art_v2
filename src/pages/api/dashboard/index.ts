// pages/api/admin/dashboard.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/dbConnect';
import User from '@/models/User';
import { Category } from '@/models/Category';
import { Menu } from '@/models/Menu';
import { Product } from '@/models/Product';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  const { type = 'overview' } = req.query;

  switch (req.method) {
    case 'GET':
      try {
        let data;

        switch (type) {
          case 'overview':
            data = await getDashboardOverview();
            break;
          case 'users':
            data = await getUserStats();
            break;
          case 'categories':
            data = await getCategoryStats();
            break;
          case 'products':
            data = await getProductStats();
            break;
          case 'charts':
            data = await getChartsData();
            break;
          case 'health':
            data = await getSystemHealth();
            break;
          case 'all':
            data = await getAllStats();
            break;
          default:
            return res.status(400).json({
              success: false,
              error: 'Type không hợp lệ. Sử dụng: overview, users, categories, products, charts, health, all'
            });
        }

        return res.status(200).json({
          success: true,
          type,
          timestamp: new Date().toISOString(),
          data
        });

      } catch (err) {
        console.error('Dashboard API Error:', err);
        return res.status(500).json({
          success: false,
          error: 'Lỗi khi tải dữ liệu dashboard',
          errorMessage: (err as any).message,
        });
      }

    default:
      return res.status(405).json({ success: false, error: 'Phương thức không được hỗ trợ' });
  }
}

// ==================== MAIN DASHBOARD OVERVIEW ====================
async function getDashboardOverview() {
  const [
    totalUsers,
    totalCategories,
    totalMenus,
    totalProducts,
    activeUsers,
    activeCategories,
    userGrowth,
    categoryGrowth,
    productGrowth,
    recentActivities
  ] = await Promise.all([
    User.countDocuments(),
    Category.countDocuments(),
    Menu.countDocuments(),
    Product.countDocuments(),
    User.countDocuments({ isActive: true }),
    Category.countDocuments({ isActive: true }),
    calculateGrowth('User'),
    calculateGrowth('Category'),
    calculateGrowth('Product'),
    getRecentActivities()
  ]);

  return {
    stats: {
      totalUsers,
      totalCategories,
      totalMenus,
      totalProducts,
      activeUsers,
      activeCategories,
      inactiveUsers: totalUsers - activeUsers,
      inactiveCategories: totalCategories - activeCategories
    },
    growth: {
      users: userGrowth,
      categories: categoryGrowth,
      products: productGrowth
    },
    recentActivities
  };
}

// ==================== USER STATISTICS ====================
async function getUserStats() {
  const [
    totalUsers,
    activeUsers,
    usersByRole,
    monthlyUserStats,
    weeklyUserTrend,
    userGrowth
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ isActive: true }),
    getUsersByRole(),
    getMonthlyStats('User'),
    getWeeklyTrend('User'),
    calculateGrowth('User')
  ]);

  return {
    summary: {
      total: totalUsers,
      active: activeUsers,
      inactive: totalUsers - activeUsers,
      growth: userGrowth
    },
    breakdown: {
      byRole: usersByRole,
      monthly: monthlyUserStats,
      weekly: weeklyUserTrend
    }
  };
}

// ==================== CATEGORY STATISTICS ====================
async function getCategoryStats() {
  const [
    totalCategories,
    activeCategories,
    categoriesWithProducts,
    emptyCategories,
    topCategories,
    categoryGrowth
  ] = await Promise.all([
    Category.countDocuments(),
    Category.countDocuments({ isActive: true }),
    getCategoriesWithProductCount(),
    getEmptyCategoriesCount(),
    getTopCategories(),
    calculateGrowth('Category')
  ]);

  return {
    summary: {
      total: totalCategories,
      active: activeCategories,
      inactive: totalCategories - activeCategories,
      empty: emptyCategories,
      growth: categoryGrowth
    },
    details: {
      withProducts: categoriesWithProducts,
      topPerforming: topCategories
    }
  };
}

// ==================== PRODUCT STATISTICS ====================
async function getProductStats() {
  const [
    totalProducts,
    productsByCategory,
    monthlyProductStats,
    recentProducts,
    productGrowth
  ] = await Promise.all([
    Product.countDocuments(),
    getProductsByCategory(),
    getMonthlyStats('Product'),
    getRecentProducts(),
    calculateGrowth('Product')
  ]);

  return {
    summary: {
      total: totalProducts,
      growth: productGrowth
    },
    breakdown: {
      byCategory: productsByCategory,
      monthly: monthlyProductStats,
      recent: recentProducts
    }
  };
}

// ==================== CHARTS DATA ====================
async function getChartsData() {
  const [
    userMonthly,
    productMonthly,
    categoryMonthly,
    weeklyTrends,
    usersByRole,
    productsByCategory
  ] = await Promise.all([
    getMonthlyStats('User'),
    getMonthlyStats('Product'),
    getMonthlyStats('Category'),
    getWeeklyTrends(),
    getUsersByRole(),
    getProductsByCategory()
  ]);

  return {
    monthly: {
      users: userMonthly,
      products: productMonthly,
      categories: categoryMonthly
    },
    weekly: weeklyTrends,
    distribution: {
      usersByRole,
      productsByCategory
    }
  };
}

// ==================== SYSTEM HEALTH ====================
async function getSystemHealth() {
  const [
    totalEntities,
    activeEntities,
    recentActivity,
    performanceMetrics
  ] = await Promise.all([
    getTotalEntities(),
    getActiveEntities(),
    getRecentActivityCount(),
    getPerformanceMetrics()
  ]);

  const healthScore = totalEntities > 0 ? Math.round((activeEntities / totalEntities) * 100) : 100;

  return {
    score: healthScore,
    status: healthScore > 80 ? 'excellent' : healthScore > 60 ? 'good' : 'needs_attention',
    metrics: {
      totalEntities,
      activeEntities,
      recentActivity: recentActivity || 0
    },
    performance: performanceMetrics
  };
}

// ==================== ALL STATISTICS ====================
async function getAllStats() {
  const [
    overview,
    users,
    categories,
    products,
    charts,
    health
  ] = await Promise.all([
    getDashboardOverview(),
    getUserStats(),
    getCategoryStats(),
    getProductStats(),
    getChartsData(),
    getSystemHealth()
  ]);

  return {
    overview,
    users,
    categories,
    products,
    charts,
    health
  };
}

// ==================== HELPER FUNCTIONS ====================

// Tính growth rate chung cho tất cả models
async function calculateGrowth(modelName: string) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  let Model;
  switch (modelName) {
    case 'User':
      Model = User;
      break;
    case 'Category':
      Model = Category;
      break;
    case 'Product':
      Model = Product;
      break;
    default:
      return 0;
  }

  const [currentCount, previousCount] = await Promise.all([
    Model.countDocuments(),
    Model.countDocuments({ createdAt: { $lt: thirtyDaysAgo } })
  ]);

  if (previousCount === 0) return currentCount > 0 ? 100 : 0;
  return Math.round(((currentCount - previousCount) / previousCount) * 100);
}

// Thống kê theo tháng chung
async function getMonthlyStats(modelName: string) {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  let Model;
  switch (modelName) {
    case 'User':
      Model = User;
      break;
    case 'Category':
      Model = Category;
      break;
    case 'Product':
      Model = Product;
      break;
    default:
      return [];
  }

  const stats = await Model.aggregate([
    { $match: { createdAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  return stats.map(stat => ({
    month: `${stat._id.month}/${stat._id.year}`,
    count: stat.count,
    type: modelName.toLowerCase()
  }));
}

// Xu hướng theo tuần chung
async function getWeeklyTrend(modelName: string) {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  let Model;
  switch (modelName) {
    case 'User':
      Model = User;
      break;
    case 'Category':
      Model = Category;
      break;
    case 'Product':
      Model = Product;
      break;
    default:
      return [];
  }

  return await Model.aggregate([
    { $match: { createdAt: { $gte: sevenDaysAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);
}

// Lấy users theo role
async function getUsersByRole() {
  const result = await User.aggregate([
    { $group: { _id: '$role', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  return result.reduce((acc, item) => {
    acc[item._id] = item.count;
    return acc;
  }, {});
}

// Lấy categories với số lượng products
async function getCategoriesWithProductCount() {
  return await Category.aggregate([
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: 'category',
        as: 'products'
      }
    },
    {
      $project: {
        name: 1,
        slug: 1,
        isActive: 1,
        productCount: { $size: '$products' }
      }
    },
    { $sort: { productCount: -1 } },
    { $limit: 10 }
  ]);
}

// Đếm categories rỗng
async function getEmptyCategoriesCount() {
  const result = await Category.aggregate([
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: 'category',
        as: 'products'
      }
    },
    { $match: { 'products': { $size: 0 } } },
    { $count: 'emptyCategories' }
  ]);

  return result[0]?.emptyCategories || 0;
}

// Top categories
async function getTopCategories() {
  return await Category.aggregate([
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: 'category',
        as: 'products'
      }
    },
    {
      $project: {
        name: 1,
        slug: 1,
        isActive: 1,
        productCount: { $size: '$products' }
      }
    },
    { $sort: { productCount: -1 } },
    { $limit: 5 }
  ]);
}

// Products theo category
async function getProductsByCategory() {
  return await Product.aggregate([
    {
      $lookup: {
        from: 'categories',
        localField: 'category',
        foreignField: '_id',
        as: 'categoryInfo'
      }
    },
    { $unwind: { path: '$categoryInfo', preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id: { $ifNull: ['$categoryInfo.name', 'Không có danh mục'] },
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } }
  ]);
}

// Recent products
async function getRecentProducts() {
  const products = await Product.find()
    .populate('category', 'name')
    .sort({ createdAt: -1 })
    .limit(5)
    .select('image category createdAt');

  return products.map(product => ({
    _id: product._id,
    image: product.image,
    categoryName: (product.category as any)?.name || 'Không có danh mục',
    createdAt: product.createdAt
  }));
}

// Weekly trends cho tất cả
async function getWeeklyTrends() {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [userTrend, productTrend, categoryTrend] = await Promise.all([
    getWeeklyTrend('User'),
    getWeeklyTrend('Product'),
    getWeeklyTrend('Category')
  ]);

  return {
    users: userTrend,
    products: productTrend,
    categories: categoryTrend
  };
}

// Total entities
async function getTotalEntities() {
  const [users, categories, products, menus] = await Promise.all([
    User.countDocuments(),
    Category.countDocuments(),
    Product.countDocuments(),
    Menu.countDocuments()
  ]);

  return users + categories + products + menus;
}

// Active entities
async function getActiveEntities() {
  const [users, categories, menus] = await Promise.all([
    User.countDocuments({ isActive: true }),
    Category.countDocuments({ isActive: true }),
    Menu.countDocuments({ isActive: true })
  ]);

  const products = await Product.countDocuments(); // Products không có isActive field

  return users + categories + menus + products;
}

// Recent activity count
async function getRecentActivityCount() {
  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);

  try {
    const [users, categories, products, menus] = await Promise.all([
      User.countDocuments({ updatedAt: { $gte: oneDayAgo } }),
      Category.countDocuments({ updatedAt: { $gte: oneDayAgo } }),
      Product.countDocuments({ updatedAt: { $gte: oneDayAgo } }),
      Menu.countDocuments({ updatedAt: { $gte: oneDayAgo } })
    ]);

    return users + categories + products + menus;
  } catch (error) {
    console.error('Error getting recent activity count:', error);
    return 0;
  }
}

// Performance metrics
async function getPerformanceMetrics() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  try {
    const [avgUsersPerDay, avgProductsPerDay] = await Promise.all([
      getAveragePerDay('User', thirtyDaysAgo),
      getAveragePerDay('Product', thirtyDaysAgo)
    ]);

    return {
      avgUsersPerDay,
      avgProductsPerDay,
      calculatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error calculating performance metrics:', error);
    return {
      avgUsersPerDay: 0,
      avgProductsPerDay: 0,
      calculatedAt: new Date().toISOString()
    };
  }
}

// Average per day helper
async function getAveragePerDay(modelName: string, fromDate: Date) {
  let Model;
  switch (modelName) {
    case 'User':
      Model = User;
      break;
    case 'Product':
      Model = Product;
      break;
    default:
      return 0;
  }

  const result = await Model.aggregate([
    { $match: { createdAt: { $gte: fromDate } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: 1 }
      }
    }
  ]);

  const totalDays = Math.ceil((Date.now() - fromDate.getTime()) / (1000 * 60 * 60 * 24));
  const totalCount = result.reduce((sum, day) => sum + day.count, 0);
  
  return totalDays > 0 ? Math.round((totalCount / totalDays) * 100) / 100 : 0;
}

// Recent activities
async function getRecentActivities() {
  const activities:any = [];

  try {
    // Lấy hoạt động gần đây từ tất cả models
    const [recentUsers, recentCategories, recentProducts] = await Promise.all([
      User.find().sort({ createdAt: -1 }).limit(3).select('name createdAt'),
      Category.find().sort({ createdAt: -1 }).limit(2).select('name createdAt'),
      Product.find().sort({ createdAt: -1 }).limit(3).populate('category', 'name').select('category createdAt')
    ]);

    // Users
    recentUsers.forEach(user => {
      activities.push({
        _id: user._id.toString(),
        type: 'user',
        action: 'Người dùng mới đăng ký',
        entityName: user.name,
        createdAt: user.createdAt
      });
    });

    // Categories
    recentCategories.forEach(category => {
      activities.push({
        _id: category._id.toString(),
        type: 'category',
        action: 'Danh mục mới được tạo',
        entityName: category.name,
        createdAt: category.createdAt
      });
    });

    // Products
    recentProducts.forEach(product => {
      activities.push({
        _id: product._id.toString(),
        type: 'product',
        action: 'Sản phẩm mới được thêm',
        entityName: `Tranh trong ${(product.category as any)?.name || 'danh mục'}`,
        createdAt: product.createdAt
      });
    });

    // Sort theo thời gian
    activities.sort((a:any, b:any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return activities.slice(0, 8);

  } catch (error) {
    console.error('Error fetching recent activities:', error);
    return [];
  }
}
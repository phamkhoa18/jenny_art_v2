// lib/menu.ts
export const adminMenu = [
  {
    title: 'Dashboard',
    href: '/admin/dashboard',
  },
  {
    title: 'Quản lý nội dung',
    children: [
      {
        title: 'Menu',
        href: '/admin/menu',
      },
      {
        title: 'Danh mục',
        href: '/admin/category',
      },
      {
        title: 'Sản phẩm',
        href: '/admin/products',
      },
      {
        title: 'Config',
        href: '/admin/config',
      },
    ],
  }
];

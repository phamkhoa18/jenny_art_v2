/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/dbConnect';
import { IMenu } from '@/lib/types/imenu';
import { Menu } from '@/models/Menu';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  try {
    // Truy vấn và chuyển về object thuần bằng .toObject()
    const menus: IMenu[] = (
      await Menu.find({ isActive: true }).sort({ order: 1 })
    ).map((menu) => menu.toObject());

    const menuMap: Record<string, any> = {};
    const tree: any[] = [];

    // B1: Tạo bản đồ ánh xạ _id -> menu
    menus.forEach((menu) => {
      menuMap[menu._id.toString()] = { ...menu, children: [] };
    });

    // B2: Gán menu con vào menu cha
    menus.forEach((menu) => {
      if (menu.parentId) {
        const parent = menuMap[menu.parentId.toString()];
        if (parent) {
          parent.children.push(menuMap[menu._id.toString()]);
        }
      } else {
        tree.push(menuMap[menu._id.toString()]);
      }
    });

    res.status(200).json(tree);
  } catch (error) {
    console.error('Error fetching menus:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

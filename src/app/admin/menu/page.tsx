'use client'

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ChevronRight, ChevronDown, Trash2, Edit, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { IMenu } from '@/lib/types/imenu';

interface MenuItem extends IMenu {
  children?: MenuItem[];
}

const MenuAdmin: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<MenuItem | null>(null);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', link: '', slug: '', icon: '', order: 0, parentId: '', isActive: true });
  const [formErrors, setFormErrors] = useState({ name: '', slug: '' });
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  // Fetch menu items from API
  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const response = await fetch('/api/menus');
        const result = await response.json();
        console.log(result);
        
        if (result.success) {
          // Build tree structure from flat list
          const buildTree = (items: MenuItem[], parentId: string | null = null): MenuItem[] => {
            return items
              .filter(item => item.parentId === parentId)
              .map(item => ({
                ...item,
                children: buildTree(items, item._id),
              }));
          };
          setMenuItems(buildTree(result.data));
        } else {
          toast.error('Failed to fetch menus');
        }
      } catch {
        toast.error('Error fetching menus');
      }
    };
    fetchMenus();
  }, []);

  // Get valid parent options excluding the current item and its descendants
  const getValidParentOptions = (items: MenuItem[], excludeId: string): MenuItem[] => {
    const result: MenuItem[] = [];
    const collectItems = (nodes: MenuItem[], level: number = 0) => {
      nodes.forEach(item => {
        if (item._id !== excludeId && (!item.children || !item.children.some(child => child._id === excludeId))) {
          result.push({ ...item, name: `${'    '.repeat(level)} ${item.name}` });
          if (item.children) {
            collectItems(item.children, level + 1);
          }
        }
      });
    };
    collectItems(items);
    return result;
  };

  // Validate form inputs
  const validateForm = () => {
    const errors = { name: '', slug: '' };
    let isValid = true;

    if (!formData.name.trim()) {
      errors.name = 'Name is required';
      isValid = false;
    }
    if (!formData.slug.trim()) {
      errors.slug = 'Slug is required';
      isValid = false;
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      errors.slug = 'Slug must contain only lowercase letters, numbers, and hyphens';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleAddMenuItem = async () => {
    if (!validateForm()) {
      toast.error('Please fix the form errors');
      return;
    }

    try {
      const response = await fetch('/api/menus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      
      if (result.success) {
        // Refresh menu items
        const refreshResponse = await fetch('/api/menus');
        const refreshResult = await refreshResponse.json();
        if (refreshResult.success) {
          const buildTree = (items: MenuItem[], parentId: string | null = null): MenuItem[] => {
            return items
              .filter(item => item.parentId === parentId)
              .map(item => ({
                ...item,
                children: buildTree(items, item._id),
              }));
          };
          setMenuItems(buildTree(refreshResult.data));
          toast.success('Menu item added successfully', { duration: 3000 });
          setFormData({ name: '', link: '' , slug: '', icon: '', order: 0, parentId: '', isActive: true });
          setFormErrors({ name: '', slug: '' });
          setIsAddDialogOpen(false);
        }
      } else {
        toast.error(result.message || 'Failed to add menu item');
      }
    } catch {
      toast.error('Error adding menu item');
    }
  };

  const handleEditMenuItem = async () => {
    if (!currentItem || !validateForm()) {
      toast.error('Please fix the form errors');
      return;
    }

    try {
      const response = await fetch(`/api/menus/${currentItem._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      if (result.success) {
        // Refresh menu items
        const refreshResponse = await fetch('/api/menus');
        const refreshResult = await refreshResponse.json();
        if (refreshResult.success) {
          const buildTree = (items: MenuItem[], parentId: string | null = null): MenuItem[] => {
            return items
              .filter(item => item.parentId === parentId)
              .map(item => ({
                ...item,
                children: buildTree(items, item._id),
              }));
          };
          setMenuItems(buildTree(refreshResult.data));
          toast.success('Menu item updated successfully', { duration: 3000 });
          setFormData({ name: '', link: '' , slug: '', icon: '', order: 0, parentId: '', isActive: true });
          setFormErrors({ name: '', slug: '' });
          setIsEditDialogOpen(false);
          setCurrentItem(null);
        }
      } else {
        toast.error('Failed to update menu item');
      }
    } catch {
      toast.error('Error updating menu item');
    }
  };

  const handleDeleteMenuItem = async () => {
    if (!deleteItemId) return;

    try {
      const response = await fetch(`/api/menus/${deleteItemId}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      
      if (result.success) {
        // Refresh menu items
        const refreshResponse = await fetch('/api/menus');
        const refreshResult = await refreshResponse.json();
        if (refreshResult.success) {
          const buildTree = (items: MenuItem[], parentId: string | null = null): MenuItem[] => {
            return items
              .filter(item => item.parentId === parentId)
              .map(item => ({
                ...item,
                children: buildTree(items, item._id),
              }));
          };
          setMenuItems(buildTree(refreshResult.data));
          toast.success('Menu item deleted successfully', { duration: 3000 });
          setDeleteItemId(null);
          setIsDeleteDialogOpen(false);
        }
      } else {
        toast.error(result.message || 'Failed to delete menu item');
      }
    } catch {
      toast.error('Error deleting menu item');
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedItems(prev =>
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    );
  };

  const renderMenuItems = (items: MenuItem[], level: number = 0) => {
    const levelColors = ['border-gray-400', 'border-blue-400', 'border-green-400', 'border-purple-400'];
    const borderColor = levelColors[level % levelColors.length] || 'border-gray-400';

    return items.map((item) => (
      <React.Fragment key={item._id}>
        <TableRow
          className={cn(
            'hover:bg-gray-50 transition-colors',
            level > 0 ? `border-l-4 ${borderColor}` : ''
          )}
        >
          <TableCell className="text-gray-500 truncate">{item._id}</TableCell>
          <TableCell className="font-medium">
            <div className="flex items-center">
              <div style={{ width: `${level * 2}rem` }} />
              {item.children && item.children.length > 0 ? (
                <button
                  onClick={() => toggleExpand(item._id)}
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                  aria-label={expandedItems.includes(item._id) ? 'Collapse' : 'Expand'}
                >
                  {expandedItems.includes(item._id) ? (
                    <ChevronDown size={20} />
                  ) : (
                    <ChevronRight size={20} />
                  )}
                </button>
              ) : (
                <span className="w-5" />
              )}
              <span className="truncate">{item.name}</span>
            </div>
          </TableCell>
          <TableCell className="text-gray-500 truncate">{item.link}</TableCell>
          <TableCell className="text-gray-500 truncate">{item.slug}</TableCell>
          <TableCell className="text-gray-500 truncate">{item.order}</TableCell>
          <TableCell className="text-right">
            <div className="flex space-x-1 justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setCurrentItem(item);
                  setFormData({
                    name: item.name,
                    link: item.link,
                    slug: item.slug,
                    icon: item.icon || '',
                    order: item.order,
                    parentId: item.parentId || '',
                    isActive: item.isActive,
                  });
                  setFormErrors({ name: '', slug: '' });
                  setIsEditDialogOpen(true);
                }}
                className="hover:bg-gray-200"
              >
                <Edit size={16} className="mr-1" /> Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setDeleteItemId(item._id);
                  setIsDeleteDialogOpen(true);
                }}
                className="hover:bg-red-100 text-red-600"
              >
                <Trash2 size={16} className="mr-1" /> Delete
              </Button>
            </div>
          </TableCell>
        </TableRow>
        {item.children && expandedItems.includes(item._id) && renderMenuItems(item.children, level + 1)}
      </React.Fragment>
    ));
  };

  return (
    <div className="container mx-auto">
      <Card className="shadow-xl border-0">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-2xl font-bold text-gray-900">Menu Management</CardTitle>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">Add New Menu Item</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md bg-white">
                <DialogHeader>
                  <DialogTitle className="text-xl">Add New Menu Item</DialogTitle>
                </DialogHeader>
                <div className="space-y-5">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className={cn('mt-1', formErrors.name && 'border-red-500')}
                      placeholder="Enter menu name"
                    />
                    {formErrors.name && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertCircle size={14} className="mr-1" /> {formErrors.name}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="icon">Link (optional)</Label>
                    <Input
                      id="link"
                      value={formData.link}
                      onChange={e => setFormData({ ...formData, link: e.target.value })}
                      className="mt-1"
                      placeholder="link or URL"
                    />
                  </div>
                  <div>
                    <Label htmlFor="slug">Slug</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={e => setFormData({ ...formData, slug: e.target.value })}
                      className={cn('mt-1', formErrors.slug && 'border-red-500')}
                      placeholder="enter-menu-slug"
                    />
                    {formErrors.slug && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertCircle size={14} className="mr-1" /> {formErrors.slug}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="icon">Icon (optional)</Label>
                    <Input
                      id="icon"
                      value={formData.icon}
                      onChange={e => setFormData({ ...formData, icon: e.target.value })}
                      className="mt-1"
                      placeholder="Icon class or URL"
                    />
                  </div>
                  <div>
                    <Label htmlFor="parent">Parent Menu</Label>
                    <select
                      id="parent"
                      value={formData.parentId}
                      onChange={e => setFormData({ ...formData, parentId: e.target.value })}
                      className="w-full p-2.5 border rounded-md mt-1 focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">No Parent</option>
                      {getValidParentOptions(menuItems, '').map(item => (
                        <option key={item._id} value={item._id}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsAddDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleAddMenuItem}>Add Item</Button>
                  </DialogFooter>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          {menuItems.length === 0 ? (
            <p className="text-gray-500 text-center py-6">No menu items available. Add one to get started!</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[10%] line-clamp-1">Id</TableHead>
                    <TableHead className="w-[20%]">Name</TableHead>
                    <TableHead className="w-[20%]">Link</TableHead>
                    <TableHead className="w-[20%]">Slug</TableHead>
                    <TableHead className="w-[20%]">Order</TableHead>
                    <TableHead className="w-[20%] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {renderMenuItems(menuItems)}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Edit Menu Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-5">
            <div>
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className={cn('mt-1', formErrors.name && 'border-red-500')}
                placeholder="Enter menu name"
              />
              {formErrors.name && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle size={14} className="mr-1" /> {formErrors.name}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="edit-icon">Link (optional)</Label>
              <Input
                id="edit-link"
                value={formData.link}
                onChange={e => setFormData({ ...formData, link: e.target.value })}
                className="mt-1"
                placeholder="link class or URL"
              />
            </div>
            <div>
              <Label htmlFor="edit-slug">Slug</Label>
              <Input
                id="edit-slug"
                value={formData.slug}
                onChange={e => setFormData({ ...formData, slug: e.target.value })}
                className={cn('mt-1', formErrors.slug && 'border-red-500')}
                placeholder="enter-menu-slug"
              />
              {formErrors.slug && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle size={14} className="mr-1" /> {formErrors.slug}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="edit-icon">Icon (optional)</Label>
              <Input
                id="edit-icon"
                value={formData.icon}
                onChange={e => setFormData({ ...formData, icon: e.target.value })}
                className="mt-1"
                placeholder="Icon class or URL"
              />
            </div>
            <div>
              <Label htmlFor="edit-parent">Parent Menu</Label>
              <select
                id="edit-parent"
                value={formData.parentId}
                onChange={e => setFormData({ ...formData, parentId: e.target.value })}
                className="w-full p-2.5 border rounded-md mt-1 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">No Parent</option>
                {currentItem &&
                  getValidParentOptions(menuItems, currentItem._id).map(item => (
                    <option key={item._id} value={item._id}>
                      {item.name}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <Label htmlFor="edit-isActive">Active</Label>
              <input
                id="edit-isActive"
                type="checkbox"
                checked={formData.isActive}
                onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                className="mt-1"
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleEditMenuItem}>Save Changes</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p className="text-gray-600">Are you sure you want to delete this menu item? This action cannot be undone.</p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteMenuItem}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MenuAdmin;
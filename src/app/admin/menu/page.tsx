/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ChevronRight, 
  ChevronDown, 
  Trash2, 
  Edit3, 
  Plus,
  Menu as MenuIcon,
  Link2,
  Search,
  MoreHorizontal
} from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { IMenu } from '@/lib/types/imenu';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

interface MenuItem extends IMenu {
  children?: MenuItem[];
}

// SEPARATE FORM COMPONENT TO PREVENT RE-RENDERS
const MenuForm = ({ 
  isEdit = false,
  initialData = null,
  parentOptions = [],
  onSubmit,
  onCancel 
}: {
  isEdit?: boolean;
  initialData?: MenuItem | null;
  parentOptions?: MenuItem[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
}) => {
  const [formState, setFormState] = useState({
    name: initialData?.name || '',
    slug: initialData?.slug || '',
    link: initialData?.link || '',
    icon: initialData?.icon || '',
    order: initialData?.order || 0,
    parentId: initialData?.parentId || '',
    isActive: initialData?.isActive ?? true
  });
  
  const [errors, setErrors] = useState({ name: '', slug: '' });

  const validate = () => {
    const newErrors = { name: '', slug: '' };
    let isValid = true;

    if (!formState.name.trim()) {
      newErrors.name = 'Name is required';
      isValid = false;
    }
    if (!formState.slug.trim()) {
      newErrors.slug = 'Slug is required';
      isValid = false;
    } else if (!/^[a-z0-9-]+$/.test(formState.slug)) {
      newErrors.slug = 'Only lowercase letters, numbers, and hyphens';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSubmit(formState);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Name</Label>
        <Input
          value={formState.name}
          onChange={(e) => setFormState(prev => ({ ...prev, name: e.target.value }))}
          className={cn(errors.name && 'border-red-500')}
          placeholder="Menu name"
        />
        {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
      </div>
      
      <div className="space-y-2">
        <Label>Slug</Label>
        <Input
          value={formState.slug}
          onChange={(e) => setFormState(prev => ({ ...prev, slug: e.target.value }))}
          className={cn(errors.slug && 'border-red-500')}
          placeholder="menu-slug"
        />
        {errors.slug && <p className="text-red-500 text-sm">{errors.slug}</p>}
      </div>

      <div className="space-y-2">
        <Label>Link (optional)</Label>
        <Input
          value={formState.link}
          onChange={(e) => setFormState(prev => ({ ...prev, link: e.target.value }))}
          placeholder="/path or https://example.com"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Icon</Label>
          <Input
            value={formState.icon}
            onChange={(e) => setFormState(prev => ({ ...prev, icon: e.target.value }))}
            placeholder="icon-name"
          />
        </div>
        
        <div className="space-y-2">
          <Label>Order</Label>
          <Input
            type="number"
            value={formState.order}
            onChange={(e) => setFormState(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
            placeholder="0"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Parent Menu</Label>
        <select
          value={formState.parentId}
          onChange={(e) => setFormState(prev => ({ ...prev, parentId: e.target.value }))}
          className="w-full p-2 border rounded-md"
        >
          <option value="">No Parent</option>
          {parentOptions.map(item => (
            <option key={item._id} value={item._id}>
              {item.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center justify-between">
        <Label>Active</Label>
        <Switch
          checked={formState.isActive}
          onCheckedChange={(checked) => setFormState(prev => ({ ...prev, isActive: checked }))}
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSubmit}>
          {isEdit ? 'Save Changes' : 'Add Menu'}
        </Button>
      </div>
    </div>
  );
};

const MenuAdmin: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<MenuItem | null>(null);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchMenus();
  }, []);

  const fetchMenus = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/menus');
      const result = await response.json();
      
      if (result.success) {
        const buildTree = (items: MenuItem[], parentId: string | null = null): MenuItem[] => {
          return items
            .filter(item => item.parentId === parentId)
            .map(item => ({
              ...item,
              children: buildTree(items, item._id),
            }))
            .sort((a, b) => a.order - b.order);
        };
        setMenuItems(buildTree(result.data));
      } else {
        toast.error('Failed to fetch menus');
      }
    } catch {
      toast.error('Error fetching menus');
    } finally {
      setLoading(false);
    }
  };

  const getValidParentOptions = (items: MenuItem[], excludeId: string): MenuItem[] => {
    const result: MenuItem[] = [];
    const collectItems = (nodes: MenuItem[], level: number = 0) => {
      nodes.forEach(item => {
        if (item._id !== excludeId && (!item.children || !item.children.some(child => child._id === excludeId))) {
          result.push({ ...item, name: `${'  '.repeat(level)}${level > 0 ? '└ ' : ''}${item.name}` });
          if (item.children) {
            collectItems(item.children, level + 1);
          }
        }
      });
    };
    collectItems(items);
    return result;
  };

  const handleAddMenuItem = async (formData: any) => {
    try {
      const response = await fetch('/api/menus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      
      if (result.success) {
        await fetchMenus();
        toast.success('Menu added');
        setIsAddDialogOpen(false);
      } else {
        toast.error(result.message || 'Failed to add menu');
      }
    } catch {
      toast.error('Error adding menu');
    }
  };

  const handleEditMenuItem = async (formData: any) => {
    if (!currentItem) return;

    try {
      const response = await fetch(`/api/menus/${currentItem._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      if (result.success) {
        await fetchMenus();
        toast.success('Menu updated');
        setIsEditDialogOpen(false);
        setCurrentItem(null);
      } else {
        toast.error('Failed to update menu');
      }
    } catch {
      toast.error('Error updating menu');
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
        await fetchMenus();
        toast.success('Menu deleted');
        setDeleteItemId(null);
        setIsDeleteDialogOpen(false);
      } else {
        toast.error(result.message || 'Failed to delete menu');
      }
    } catch {
      toast.error('Error deleting menu');
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedItems(prev =>
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    );
  };

  const filterMenuItems = (items: MenuItem[]): MenuItem[] => {
    if (!searchTerm) return items;
    
    return items.filter(item => {
      const matchesSearch = 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.link.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesSearch;
    }).map(item => ({
      ...item,
      children: item.children ? filterMenuItems(item.children) : undefined
    }));
  };

  const renderMenuItems = (items: MenuItem[], level: number = 0): React.ReactNode => {
    return items.map((item) => (
      <React.Fragment key={item._id}>
        <TableRow className="group hover:bg-gray-50/80 transition-colors">
          <TableCell className="w-72">
            <div className="flex items-center gap-3">
              <div style={{ width: `${level * 24}px` }} />
              
              {item.children && item.children.length > 0 ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleExpand(item._id)}
                  className="h-6 w-6 p-0 hover:bg-gray-200"
                >
                  {expandedItems.includes(item._id) ? (
                    <ChevronDown size={14} />
                  ) : (
                    <ChevronRight size={14} />
                  )}
                </Button>
              ) : (
                <div className="w-6" />
              )}
              
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <MenuIcon size={16} className="text-gray-400 flex-shrink-0" />
                <span className="font-medium text-gray-900 truncate">{item.name}</span>
                <Badge variant={item.isActive ? "default" : "secondary"} className="text-xs">
                  {item.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </TableCell>
          
          <TableCell className="text-gray-600">
            {item.link ? (
              <div className="flex items-center gap-1">
                <Link2 size={14} />
                <span className="truncate max-w-32">{item.link}</span>
              </div>
            ) : (
              <span className="text-gray-400">—</span>
            )}
          </TableCell>
          
          <TableCell>
            <code className="text-sm bg-gray-100 px-2 py-1 rounded">{item.slug}</code>
          </TableCell>
          
          <TableCell className="text-center text-gray-600">{item.order}</TableCell>
          
          <TableCell className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-32">
                <DropdownMenuItem
                  onClick={() => {
                    setCurrentItem(item);
                    setIsEditDialogOpen(true);
                  }}
                >
                  <Edit3 size={14} className="mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setDeleteItemId(item._id);
                    setIsDeleteDialogOpen(true);
                  }}
                  className="text-red-600"
                >
                  <Trash2 size={14} className="mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>
        {item.children && expandedItems.includes(item._id) && renderMenuItems(item.children, level + 1)}
      </React.Fragment>
    ));
  };

  const filteredMenuItems = filterMenuItems(menuItems);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Menus</h1>
          <p className="text-gray-600 mt-1">Manage navigation structure</p>
        </div>
        
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus size={16} className="mr-2" />
          Add Menu
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search menus..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredMenuItems.length === 0 ? (
            <div className="text-center py-12">
              <MenuIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'No menus found' : 'No menus yet'}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? 'Try a different search term' : 'Create your first menu to get started'}
              </p>
              {!searchTerm && (
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus size={16} className="mr-2" />
                  Add Menu
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-72">Name</TableHead>
                  <TableHead>Link</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead className="text-center w-20">Order</TableHead>
                  <TableHead className="text-right w-20"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {renderMenuItems(filteredMenuItems)}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle>Add Menu</DialogTitle>
          </DialogHeader>
          <MenuForm
            parentOptions={getValidParentOptions(menuItems, '')}
            onSubmit={handleAddMenuItem}
            onCancel={() => setIsAddDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle>Edit Menu</DialogTitle>
          </DialogHeader>
          <MenuForm
            key={currentItem?._id} // Force re-mount on item change
            isEdit={true}
            initialData={currentItem}
            parentOptions={getValidParentOptions(menuItems, currentItem?._id || '')}
            onSubmit={handleEditMenuItem}
            onCancel={() => {
              setIsEditDialogOpen(false);
              setCurrentItem(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Menu</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure? This will also delete all child menus.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteMenuItem} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MenuAdmin;
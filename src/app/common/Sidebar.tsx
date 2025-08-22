// components/common/Sidebar.tsx
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { adminMenu } from '@/lib/menu';
import { Menu, X, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

interface SidebarProps {
  collapsed?: boolean;
  setCollapsed?: (collapsed: boolean) => void;
}

export function Sidebar({ collapsed = false, setCollapsed }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['Quản lý nội dung']);
  const pathname = usePathname();

  const toggleGroup = (title: string) => {
    if (collapsed) return; // Don't toggle when collapsed
    setExpandedGroups(prev => 
      prev.includes(title) 
        ? prev.filter(t => t !== title)
        : [...prev, title]
    );
  };

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed top-0 left-0 z-50 h-full bg-white border-r border-gray-200 shadow-xl transform transition-all duration-300',
          mobileOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64',
          'md:sticky md:top-0 md:translate-x-0 md:flex md:flex-col md:shadow-none md:h-screen',
          collapsed ? 'md:w-16' : 'md:w-64'
        )}
      >
        {/* Header */}
        <div className={clsx(
          'px-6 py-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600',
          collapsed && 'md:px-2'
        )}>
          <div className="flex justify-between items-center">
            {!collapsed && (
              <h2 className="text-xl font-bold text-white">Admin Panel</h2>
            )}
            
            <div className="flex items-center gap-2">
              {/* Desktop collapse button */}
              {setCollapsed && (
                <button
                  onClick={() => setCollapsed(!collapsed)}
                  className="hidden md:flex p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  {collapsed ? (
                    <ChevronRight className="h-4 w-4" />
                  ) : (
                    <ChevronLeft className="h-4 w-4" />
                  )}
                </button>
              )}
              
              {/* Mobile close button */}
              <button
                className="md:hidden p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          <div className="space-y-2">
            {adminMenu.map((item) => (
              <div key={item.title}>
                {item.children ? (
                  <div>
                    {!collapsed ? (
                      <div>
                        <button
                          onClick={() => toggleGroup(item.title)}
                          className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors group"
                        >
                          <span>{item.title}</span>
                          <ChevronDown 
                            className={clsx(
                              'h-4 w-4 transition-transform',
                              expandedGroups.includes(item.title) ? 'rotate-180' : ''
                            )}
                          />
                        </button>
                        
                        {expandedGroups.includes(item.title) && (
                          <div className="mt-1 ml-4 space-y-1">
                            {item.children.map((child) => (
                              <Link
                                key={child.title}
                                href={child.href}
                                className={clsx(
                                  'block px-3 py-2 text-sm rounded-lg transition-colors',
                                  pathname === child.href
                                    ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                )}
                                onClick={() => setMobileOpen(false)}
                              >
                                {child.title}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="relative group">
                        <div className="w-10 h-10 flex items-center justify-center text-gray-700 hover:bg-gray-50 rounded-lg cursor-pointer">
                          <span className="text-xs font-bold">
                            {item.title.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        
                        {/* Tooltip for collapsed sidebar */}
                        <div className="absolute left-full ml-2 top-0 invisible group-hover:visible bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-50">
                          {item.title}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    className={clsx(
                      'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                      pathname === item.href
                        ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900',
                      collapsed ? 'justify-center' : ''
                    )}
                    onClick={() => setMobileOpen(false)}
                  >
                    {collapsed ? (
                      <div className="relative group">
                        <span className="text-xs font-bold">
                          {item.title.charAt(0).toUpperCase()}
                        </span>
                        {/* Tooltip */}
                        <div className="absolute left-full ml-2 top-0 invisible group-hover:visible bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-50">
                          {item.title}
                        </div>
                      </div>
                    ) : (
                      <span>{item.title}</span>
                    )}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </nav>

        {/* Footer */}
        {!collapsed && (
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Online</span>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
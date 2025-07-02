'use client';

import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'react-hot-toast';
import ImageUploader from '@/components/cloudinaryUpload';

interface WebsiteConfig {
  siteName: string;
  logo: string;
  favicon: string;
  contact: {
    phone?: string;
    email?: string;
    address?: string;
  };
  socialLinks: {
    facebook?: string;
    youtube?: string;
    zalo?: string;
    instagram?: string;
  };
}

export default function WebsiteConfigPage() {
  const [config, setConfig] = useState<WebsiteConfig>({
    siteName: '',
    logo: '',
    favicon: '',
    contact: {
      phone: '',
      email: '',
      address: '',
    },
    socialLinks: {
      facebook: '',
      youtube: '',
      zalo: '',
      instagram: '',
    },
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/config');
      const data = await res.json();
      if (data.success && data.data) {
        setConfig(data.data);
      }
    } catch {
      toast.error('Lỗi khi tải cấu hình');
    } finally {
      setLoading(false);
    }
  };

const handleChange = (
  field: string,
  value: string,
  parent?: keyof Pick<WebsiteConfig, 'contact' | 'socialLinks'>
) => {
  if (parent) {
    setConfig((prev) => ({
      ...prev,
      [parent]: {
        ...(prev[parent] || {}),
        [field]: value,
      },
    }));
  } else {
    setConfig((prev) => ({ ...prev, [field]: value }));
  }
};

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const res = await fetch('/api/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Lưu cấu hình thành công');
      } else {
        toast.error(data.error || 'Lỗi khi lưu');
      }
    } catch {
      toast.error('Lỗi kết nối server');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    fetchConfig();
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Cấu hình website</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {loading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : (
            <>
              {/* Site Name */}
              <div>
                <Label htmlFor="siteName">Tên website</Label>
                <Input
                  id="siteName"
                  value={config.siteName}
                  onChange={(e) => handleChange('siteName', e.target.value)}
                />
              </div>

              {/* Logo */}
              <div>
                <Label className="mb-2.5" htmlFor="logo">Logo</Label>
                <ImageUploader onUploadSuccess={(url: string) => handleChange('logo', url)} />
                {config.logo && (
                  <p className="mt-2 text-sm text-gray-600">
                    Logo đã chọn:{' '}
                    <a href={config.logo} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                      {config.logo}
                    </a>
                  </p>
                )}
              </div>

              {/* Favicon */}
              <div>
                <Label className="mb-2.5" htmlFor="favicon">Favicon</Label>
                <ImageUploader onUploadSuccess={(url: string) => handleChange('favicon', url)} />
                {config.favicon && (
                  <p className="mt-2 text-sm text-gray-600">
                    Favicon đã chọn:{' '}
                    <a href={config.favicon} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                      {config.favicon}
                    </a>
                  </p>
                )}
              </div>

              {/* Contact */}
              <div className="border-t pt-4 space-y-2">
                <h2 className="text-lg font-semibold">Liên hệ</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Điện thoại</Label>
                    <Input
                      value={config.contact?.phone || ''}
                      onChange={(e) => handleChange('phone', e.target.value, 'contact')}
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input
                      value={config.contact?.email || ''}
                      onChange={(e) => handleChange('email', e.target.value, 'contact')}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Địa chỉ</Label>
                    <Input
                      value={config.contact?.address || ''}
                      onChange={(e) => handleChange('address', e.target.value, 'contact')}
                    />
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className="border-t pt-4 space-y-2">
                <h2 className="text-lg font-semibold">Mạng xã hội</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Facebook</Label>
                    <Input
                      value={config.socialLinks?.facebook || ''}
                      onChange={(e) => handleChange('facebook', e.target.value, 'socialLinks')}
                    />
                  </div>
                  <div>
                    <Label>YouTube</Label>
                    <Input
                      value={config.socialLinks?.youtube || ''}
                      onChange={(e) => handleChange('youtube', e.target.value, 'socialLinks')}
                    />
                  </div>
                  <div>
                    <Label>Zalo</Label>
                    <Input
                      value={config.socialLinks?.zalo || ''}
                      onChange={(e) => handleChange('zalo', e.target.value, 'socialLinks')}
                    />
                  </div>
                  <div>
                    <Label>Instagram</Label>
                    <Input
                      value={config.socialLinks?.instagram || ''}
                      onChange={(e) => handleChange('instagram', e.target.value, 'socialLinks')}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={handleReset}>
                  Reset
                </Button>
                <Button type="button" onClick={handleSubmit} disabled={submitting}>
                  {submitting ? 'Đang lưu...' : 'Lưu cấu hình'}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { 
  Settings, 
  Globe, 
  ImageIcon, 
  Phone, 
  Mail, 
  MapPin, 
  Facebook, 
  Youtube, 
  Instagram,
  MessageCircle,
  Save,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Link,
  ChevronRight,
  Search,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import ImageUploader from '@/components/cloudinaryUpload';

// Type definitions
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
  seo: {
    description?: string;
    keywords?: string;
    ogImage?: string;
    url?: string;
    twitterHandle?: string;
    author?: string;
    locale?: string;
  };
}

interface SectionConfig {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface SocialIconsMap {
  [key: string]: React.ComponentType<{ className?: string }>;
}

interface PlatformNamesMap {
  [key: string]: string;
}

const WebsiteConfigPage: React.FC = () => {
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
    seo: {
      description: '',
      keywords: '',
      ogImage: '',
      url: '',
      twitterHandle: '',
      author: '',
      locale: 'vi-VN',
    },
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [hasChanges, setHasChanges] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<string>('general');
  const [originalData, setOriginalData] = useState<WebsiteConfig | null>(null);

  const fetchConfig = async (): Promise<void> => {
    try {
      setLoading(true);
      const res = await fetch('/api/config');
      const data = await res.json();
      
      if (data.success && data.data) {
        setConfig(data.data);
        setOriginalData(data.data);
        setHasChanges(false);
      }
    } catch (error) {
      console.error('Error fetching config:', error);
      toast.error('Lỗi khi tải cấu hình');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string, parent?: keyof Pick<WebsiteConfig, 'contact' | 'socialLinks' | 'seo'>): void => {
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
    setHasChanges(true);
  };

  const handleSubmit = async (): Promise<void> => {
    if (!config.siteName.trim()) {
      toast.error('Tên website là bắt buộc');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      
      const data = await res.json();
      
      if (data.success) {
        toast.success('Lưu cấu hình thành công!');
        setHasChanges(false);
        setOriginalData(config);
      } else {
        toast.error(data.error || 'Lưu cấu hình thất bại');
      }
    } catch (error) {
      console.error('Error saving config:', error);
      toast.error('Lỗi kết nối server');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = (): void => {
    if (originalData) {
      setConfig(originalData);
      setHasChanges(false);
      toast.success('Đã reset về dữ liệu gốc');
    } else {
      fetchConfig();
    }
  };

  const sections: SectionConfig[] = [
    { id: 'general', name: 'Thông tin chung', icon: Globe },
    { id: 'media', name: 'Hình ảnh', icon: ImageIcon },
    { id: 'contact', name: 'Liên hệ', icon: Phone },
    { id: 'social', name: 'Mạng xã hội', icon: Link },
    { id: 'seo', name: 'SEO & Meta', icon: Search },
  ];

  const socialIcons: SocialIconsMap = {
    facebook: Facebook,
    youtube: Youtube,
    instagram: Instagram,
    zalo: MessageCircle,
  };

  const platformNames: PlatformNamesMap = {
    facebook: 'Facebook',
    youtube: 'YouTube',
    instagram: 'Instagram',
    zalo: 'Zalo'
  };

  // Check for changes
  useEffect(() => {
    if (originalData) {
      const changed = JSON.stringify(config) !== JSON.stringify(originalData);
      setHasChanges(changed);
    }
  }, [config, originalData]);

  // Fetch config on component mount
  useEffect(() => {
    fetchConfig();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-6 py-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
              <div>
                <div className="h-6 bg-gray-200 rounded w-48 animate-pulse mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-4xl mx-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-10 bg-gray-100 rounded animate-pulse"></div>
                  ))}
                </div>
              </div>
            </div>
            <div className="lg:col-span-3">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="space-y-4">
                  <div className="h-6 bg-gray-100 rounded w-1/3 animate-pulse"></div>
                  <div className="h-4 bg-gray-100 rounded w-1/2 animate-pulse"></div>
                  <div className="h-10 bg-gray-100 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
                <Settings className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Cấu hình website</h1>
                <p className="text-gray-600 text-sm">Quản lý thông tin và cấu hình trang web</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {hasChanges && (
                <div className="flex items-center gap-2 px-3 py-1 bg-orange-100 rounded-full">
                  <AlertCircle className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-medium text-orange-700">Có thay đổi chưa lưu</span>
                </div>
              )}
              
              <button
                onClick={handleReset}
                disabled={submitting}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </button>
              
              <button
                onClick={handleSubmit}
                disabled={submitting || !hasChanges}
                className="px-6 py-2 bg-black hover:bg-gray-800 disabled:bg-gray-300 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Lưu cấu hình
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden sticky top-24">
              <nav>
                {sections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center justify-between px-4 py-3 text-left border-b border-gray-100 last:border-b-0 transition-colors ${
                        activeSection === section.id
                          ? 'bg-gray-50 text-black'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-4 w-4" />
                        <span className="font-medium">{section.name}</span>
                      </div>
                      {activeSection === section.id && (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="space-y-6">
              {/* General Settings */}
              {activeSection === 'general' && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-1">Thông tin chung</h2>
                    <p className="text-gray-600 text-sm">Cấu hình thông tin cơ bản của website</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Tên website *
                      </label>
                      <input
                        type="text"
                        value={config.siteName}
                        onChange={(e) => handleChange('siteName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                        placeholder="Nhập tên website..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Media Settings */}
              {activeSection === 'media' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="mb-6">
                      <h2 className="text-lg font-semibold text-gray-900 mb-1">Logo chính</h2>
                      <p className="text-gray-600 text-sm">Tải lên logo chính của website</p>
                    </div>
                    
                    <ImageUploader 
                      onUploadSuccess={(url: string) => handleChange('logo', url)}
                      initialImage={config.logo}
                    />
                  </div>

                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="mb-6">
                      <h2 className="text-lg font-semibold text-gray-900 mb-1">Favicon</h2>
                      <p className="text-gray-600 text-sm">Biểu tượng nhỏ hiển thị trên tab trình duyệt</p>
                    </div>
                    
                    <ImageUploader 
                      onUploadSuccess={(url: string) => handleChange('favicon', url)}
                      initialImage={config.favicon}
                    />
                  </div>
                </div>
              )}

              {/* Contact Settings */}
              {activeSection === 'contact' && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-1">Thông tin liên hệ</h2>
                    <p className="text-gray-600 text-sm">Cập nhật thông tin liên hệ của bạn</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          Số điện thoại
                        </label>
                        <input
                          type="tel"
                          value={config.contact?.phone || ''}
                          onChange={(e) => handleChange('phone', e.target.value, 'contact')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                          placeholder="+84 123 456 789"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Email
                        </label>
                        <input
                          type="email"
                          value={config.contact?.email || ''}
                          onChange={(e) => handleChange('email', e.target.value, 'contact')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                          placeholder="hello@website.com"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Địa chỉ
                      </label>
                      <textarea
                        value={config.contact?.address || ''}
                        onChange={(e) => handleChange('address', e.target.value, 'contact')}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all resize-none"
                        placeholder="Nhập địa chỉ của bạn..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Social Links */}
              {activeSection === 'social' && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-1">Mạng xã hội</h2>
                    <p className="text-gray-600 text-sm">Liên kết các trang mạng xã hội của bạn</p>
                  </div>
                  
                  <div className="space-y-4">
                    {Object.entries(config.socialLinks).map(([platform, url]) => {
                      const Icon = socialIcons[platform];
                      const platformName = platformNames[platform];
                      
                      return (
                        <div key={platform}>
                          <label className="block text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            {platformName}
                          </label>
                          <input
                            type="url"
                            value={url || ''}
                            onChange={(e) => handleChange(platform, e.target.value, 'socialLinks')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                            placeholder={`https://${platform}.com/...`}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SEO Settings */}
              {activeSection === 'seo' && (
                <div className="space-y-6">
                  {/* Basic SEO */}
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="mb-6">
                      <h2 className="text-lg font-semibold text-gray-900 mb-1">Thông tin SEO cơ bản</h2>
                      <p className="text-gray-600 text-sm">Cấu hình meta tags và thông tin SEO cho website</p>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          Mô tả website (Meta Description)
                        </label>
                        <textarea
                          value={config.seo?.description || ''}
                          onChange={(e) => handleChange('description', e.target.value, 'seo')}
                          rows={3}
                          maxLength={160}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all resize-none"
                          placeholder="Mô tả ngắn gọn về website của bạn (160 ký tự)"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>Mô tả này sẽ hiển thị trong kết quả tìm kiếm Google</span>
                          <span>{(config.seo?.description || '').length}/160</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          Từ khóa (Keywords)
                        </label>
                        <input
                          type="text"
                          value={config.seo?.keywords || ''}
                          onChange={(e) => handleChange('keywords', e.target.value, 'seo')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                          placeholder="art, fine art, murals, sculptures, decor"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Phân cách các từ khóa bằng dấu phẩy
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          URL chính của website
                        </label>
                        <input
                          type="url"
                          value={config.seo?.url || ''}
                          onChange={(e) => handleChange('url', e.target.value, 'seo')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                          placeholder="https://jennypham.com.au"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          Tác giả/Người tạo
                        </label>
                        <input
                          type="text"
                          value={config.seo?.author || ''}
                          onChange={(e) => handleChange('author', e.target.value, 'seo')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                          placeholder="Jenny Pham"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Social Media SEO */}
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="mb-6">
                      <h2 className="text-lg font-semibold text-gray-900 mb-1">Social Media SEO</h2>
                      <p className="text-gray-600 text-sm">Cấu hình hiển thị khi chia sẻ trên mạng xã hội</p>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          Ảnh Open Graph (OG Image)
                        </label>
                        <ImageUploader 
                          onUploadSuccess={(url: string) => handleChange('ogImage', url, 'seo')}
                          initialImage={config.seo?.ogImage || ''}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Ảnh này sẽ hiển thị khi chia sẻ website trên Facebook, Twitter, LinkedIn... (1200x630px)
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          Twitter Handle
                        </label>
                        <input
                          type="text"
                          value={config.seo?.twitterHandle || ''}
                          onChange={(e) => handleChange('twitterHandle', e.target.value, 'seo')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                          placeholder="@JennyPham"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          Ngôn ngữ/Locale
                        </label>
                        <select
                          value={config.seo?.locale || 'vi-VN'}
                          onChange={(e) => handleChange('locale', e.target.value, 'seo')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                        >
                          <option value="vi-VN">Tiếng Việt (Vietnam)</option>
                          <option value="en-US">English (US)</option>
                          <option value="en-AU">English (Australia)</option>
                          <option value="en-GB">English (UK)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* SEO Preview */}
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="mb-6">
                      <h2 className="text-lg font-semibold text-gray-900 mb-1">Xem trước SEO</h2>
                      <p className="text-gray-600 text-sm">Xem website sẽ hiển thị như thế nào trong kết quả tìm kiếm</p>
                    </div>
                    
                    {/* Google Search Preview */}
                    <div className="space-y-4">
                      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                          <Search className="h-4 w-4" />
                          Google Search Preview
                        </h3>
                        <div className="space-y-1">
                          <div className="text-blue-600 text-lg font-medium hover:underline cursor-pointer">
                            {config.siteName || 'Tên website'}
                          </div>
                          <div className="text-green-700 text-sm">
                            {config.seo?.url || 'https://website.com'}
                          </div>
                          <div className="text-gray-600 text-sm leading-relaxed">
                            {config.seo?.description || 'Mô tả website sẽ hiển thị ở đây...'}
                          </div>
                        </div>
                      </div>

                      {/* Social Media Preview */}
                      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                          <Facebook className="h-4 w-4" />
                          Facebook/Social Media Preview
                        </h3>
                        <div className="border border-gray-300 rounded-lg overflow-hidden bg-white max-w-md">
                          {config.seo?.ogImage && (
                            <img 
                              src={config.seo.ogImage} 
                              alt="OG Preview" 
                              className="w-full h-32 object-cover"
                            />
                          )}
                          <div className="p-3">
                            <div className="text-gray-500 text-xs uppercase mb-1">
                              {config.seo?.url?.replace('https://', '').replace('http://', '') || 'website.com'}
                            </div>
                            <div className="font-semibold text-gray-900 text-sm mb-1">
                              {config.siteName || 'Tên website'}
                            </div>
                            <div className="text-gray-600 text-xs">
                              {config.seo?.description || 'Mô tả website...'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Success Message */}
              {!hasChanges && !submitting && originalData && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <h3 className="font-medium text-green-800">Cấu hình đã được lưu</h3>
                      <p className="text-green-600 text-sm">Tất cả thay đổi của bạn đã được lưu thành công.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebsiteConfigPage;
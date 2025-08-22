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
  ExternalLink,
  Upload,
  Link,
  ChevronRight
} from 'lucide-react';

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
}

interface ImageUploaderProps {
  onUploadSuccess: (url: string) => void;
  initialImage?: string;
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

// Mock ImageUploader component
const ImageUploader: React.FC<ImageUploaderProps> = ({ onUploadSuccess, initialImage = '' }) => {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [previewImage, setPreviewImage] = useState<string>(initialImage);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (file) {
      const mockUrl = `https://via.placeholder.com/300x300?text=${encodeURIComponent(file.name)}`;
      setPreviewImage(mockUrl);
      onUploadSuccess(mockUrl);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      const mockUrl = `https://via.placeholder.com/300x300?text=${encodeURIComponent(file.name)}`;
      setPreviewImage(mockUrl);
      onUploadSuccess(mockUrl);
    }
  };

  const handleViewImage = (): void => {
    if (previewImage) {
      window.open(previewImage, '_blank');
    }
  };

  return (
    <div className="space-y-4">
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 transition-all duration-200 cursor-pointer ${
          isDragging 
            ? 'border-blue-500 bg-blue-50/50' 
            : 'border-gray-300 hover:border-gray-400 bg-gray-50/30'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <Upload className="h-5 w-5 text-gray-600" />
          </div>
          <p className="text-sm font-medium text-gray-900 mb-1">
            {isDragging ? 'Drop file here' : 'Click to upload or drag and drop'}
          </p>
          <p className="text-xs text-gray-500">PNG, JPG, WebP up to 10MB</p>
        </div>
      </div>
      
      {previewImage && (
        <div className="relative">
          <img
            src={previewImage}
            alt="Preview"
            className="w-full h-32 object-cover rounded-lg border border-gray-200"
          />
          <button 
            onClick={handleViewImage}
            className="absolute top-2 right-2 bg-white/90 hover:bg-white text-gray-700 p-1.5 rounded-md text-xs font-medium flex items-center gap-1 transition-colors"
          >
            <ExternalLink className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  );
};

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
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string, parent?: keyof Pick<WebsiteConfig, 'contact' | 'socialLinks'>): void => {
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
      alert('Site name is required');
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
        setHasChanges(false);
        setOriginalData(config);
      } else {
        alert(data.error || 'Failed to save configuration');
      }
    } catch (error) {
      console.error('Error saving config:', error);
      alert('Network error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = (): void => {
    if (originalData) {
      setConfig(originalData);
      setHasChanges(false);
    } else {
      fetchConfig();
    }
  };

  const sections: SectionConfig[] = [
    { id: 'general', name: 'General', icon: Globe },
    { id: 'media', name: 'Media', icon: ImageIcon },
    { id: 'contact', name: 'Contact', icon: Phone },
    { id: 'social', name: 'Social', icon: Link },
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
                <h1 className="text-2xl font-semibold text-gray-900">Website Settings</h1>
                <p className="text-gray-600 text-sm">Manage your website configuration</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {hasChanges && (
                <div className="flex items-center gap-2 px-3 py-1 bg-orange-100 rounded-full">
                  <AlertCircle className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-medium text-orange-700">Unsaved changes</span>
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
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save
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
                    <h2 className="text-lg font-semibold text-gray-900 mb-1">General Settings</h2>
                    <p className="text-gray-600 text-sm">Basic website information</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Site Name
                      </label>
                      <input
                        type="text"
                        value={config.siteName}
                        onChange={(e) => handleChange('siteName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                        placeholder="Enter site name..."
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
                      <h2 className="text-lg font-semibold text-gray-900 mb-1">Logo</h2>
                      <p className="text-gray-600 text-sm">Upload your website logo</p>
                    </div>
                    
                    <ImageUploader 
                      onUploadSuccess={(url: string) => handleChange('logo', url)}
                      initialImage={config.logo}
                    />
                  </div>

                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="mb-6">
                      <h2 className="text-lg font-semibold text-gray-900 mb-1">Favicon</h2>
                      <p className="text-gray-600 text-sm">Small icon displayed in browser tabs</p>
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
                    <h2 className="text-lg font-semibold text-gray-900 mb-1">Contact Information</h2>
                    <p className="text-gray-600 text-sm">Update your contact details</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          Phone Number
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
                          Email Address
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
                        Address
                      </label>
                      <textarea
                        value={config.contact?.address || ''}
                        onChange={(e) => handleChange('address', e.target.value, 'contact')}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all resize-none"
                        placeholder="Enter your address..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Social Links */}
              {activeSection === 'social' && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-1">Social Media</h2>
                    <p className="text-gray-600 text-sm">Connect your social media accounts</p>
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

              {/* Success Message */}
              {!hasChanges && !submitting && originalData && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <h3 className="font-medium text-green-800">Settings saved</h3>
                      <p className="text-green-600 text-sm">Your configuration has been saved successfully.</p>
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
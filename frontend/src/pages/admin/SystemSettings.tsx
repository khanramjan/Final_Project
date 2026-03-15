import { useState, useEffect } from 'react';
import {
  CogIcon,
  CurrencyDollarIcon,
  EnvelopeIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  DocumentTextIcon,
  KeyIcon,
} from '@heroicons/react/24/outline';

interface SystemSetting {
  id: number;
  key: string;
  value: string;
  description: string;
  category: string;
  isPublic: boolean;
  dataType: 'string' | 'number' | 'boolean' | 'json';
}

interface SettingsCategory {
  name: string;
  description: string;
  icon: React.ElementType;
  settings: SystemSetting[];
}

const SystemSettings = () => {
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('general');

  // Mock settings data - replace with actual API calls
  useEffect(() => {
    const mockSettings: SystemSetting[] = [
      // General Settings
      { id: 1, key: 'site_name', value: 'DonationMS', description: 'Website name', category: 'general', isPublic: true, dataType: 'string' },
      { id: 2, key: 'site_description', value: 'Donation Management System', description: 'Site description', category: 'general', isPublic: true, dataType: 'string' },
      { id: 3, key: 'default_language', value: 'bn', description: 'Default language (bn/en)', category: 'general', isPublic: true, dataType: 'string' },
      { id: 4, key: 'timezone', value: 'Asia/Dhaka', description: 'System timezone', category: 'general', isPublic: false, dataType: 'string' },
      
      // Payment Settings
      { id: 5, key: 'payment_gateway', value: 'stripe', description: 'Primary payment gateway', category: 'payment', isPublic: false, dataType: 'string' },
      { id: 6, key: 'stripe_public_key', value: 'pk_test_...', description: 'Stripe public key', category: 'payment', isPublic: false, dataType: 'string' },
      { id: 7, key: 'minimum_donation', value: '100', description: 'Minimum donation amount (BDT)', category: 'payment', isPublic: true, dataType: 'number' },
      { id: 8, key: 'payment_fee_percentage', value: '2.5', description: 'Payment processing fee %', category: 'payment', isPublic: false, dataType: 'number' },
      
      // Email Settings
      { id: 9, key: 'smtp_host', value: 'smtp.gmail.com', description: 'SMTP server host', category: 'email', isPublic: false, dataType: 'string' },
      { id: 10, key: 'smtp_port', value: '587', description: 'SMTP server port', category: 'email', isPublic: false, dataType: 'number' },
      { id: 11, key: 'from_email', value: 'noreply@donationms.com', description: 'Default from email', category: 'email', isPublic: false, dataType: 'string' },
      { id: 12, key: 'email_notifications', value: 'true', description: 'Enable email notifications', category: 'email', isPublic: false, dataType: 'boolean' },
      
      // Security Settings
      { id: 13, key: 'max_login_attempts', value: '5', description: 'Max failed login attempts', category: 'security', isPublic: false, dataType: 'number' },
      { id: 14, key: 'session_timeout', value: '24', description: 'Session timeout (hours)', category: 'security', isPublic: false, dataType: 'number' },
      { id: 15, key: 'require_email_verification', value: 'true', description: 'Require email verification', category: 'security', isPublic: false, dataType: 'boolean' },
      { id: 16, key: 'two_factor_auth', value: 'false', description: 'Enable 2FA for admins', category: 'security', isPublic: false, dataType: 'boolean' },
    ];
    
    setSettings(mockSettings);
    setLoading(false);
  }, []);

  const categories: SettingsCategory[] = [
    {
      name: 'general',
      description: 'সাধারণ সেটিংস',
      icon: CogIcon,
      settings: settings.filter(s => s.category === 'general')
    },
    {
      name: 'payment',
      description: 'পেমেন্ট সেটিংস',
      icon: CurrencyDollarIcon,
      settings: settings.filter(s => s.category === 'payment')
    },
    {
      name: 'email',
      description: 'ইমেইল সেটিংস',
      icon: EnvelopeIcon,
      settings: settings.filter(s => s.category === 'email')
    },
    {
      name: 'security',
      description: 'নিরাপত্তা সেটিংস',
      icon: ShieldCheckIcon,
      settings: settings.filter(s => s.category === 'security')
    }
  ];

  const handleSettingChange = async (settingId: number, newValue: string) => {
    try {
      setSaving(settingId.toString());
      
      // Mock API call - replace with actual service
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSettings(prev => 
        prev.map(setting => 
          setting.id === settingId 
            ? { ...setting, value: newValue }
            : setting
        )
      );
    } catch (error) {
      console.error('Failed to update setting:', error);
    } finally {
      setSaving(null);
    }
  };

  const resetToDefaults = async () => {
    if (window.confirm('Are you sure you want to reset all settings to defaults?')) {
      try {
        setLoading(true);
        // Mock API call for reset
        await new Promise(resolve => setTimeout(resolve, 1000));
        // Reload settings
        window.location.reload();
      } catch (error) {
        console.error('Failed to reset settings:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const renderSettingInput = (setting: SystemSetting) => {
    const isLoading = saving === setting.id.toString();
    
    switch (setting.dataType) {
      case 'boolean':
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={setting.value === 'true'}
              onChange={(e) => handleSettingChange(setting.id, e.target.checked.toString())}
              disabled={isLoading}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 disabled:opacity-50"
            />
            {isLoading && (
              <div className="ml-2 animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
            )}
          </div>
        );
      
      case 'number':
        return (
          <div className="flex items-center">
            <input
              type="number"
              value={setting.value}
              onChange={(e) => handleSettingChange(setting.id, e.target.value)}
              disabled={isLoading}
              className="block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50"
            />
            {isLoading && (
              <div className="ml-2 animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
            )}
          </div>
        );
      
      default:
        return (
          <div className="flex items-center">
            <input
              type={setting.key.includes('password') || setting.key.includes('key') ? 'password' : 'text'}
              value={setting.value}
              onChange={(e) => handleSettingChange(setting.id, e.target.value)}
              disabled={isLoading}
              className="block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50"
            />
            {isLoading && (
              <div className="ml-2 animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
            )}
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const activeSettings = categories.find(cat => cat.name === activeCategory)?.settings || [];

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
            <p className="mt-1 text-sm text-gray-600">
              Configure platform settings and preferences
            </p>
          </div>
          <button
            onClick={resetToDefaults}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm font-medium"
          >
            Reset to Defaults
          </button>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="col-span-3">
            <nav className="space-y-2">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.name}
                    onClick={() => setActiveCategory(category.name)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      activeCategory === category.name
                        ? 'bg-primary-100 text-primary-700 border border-primary-200'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {category.description}
                  </button>
                );
              })}
            </nav>
            
            {/* Quick Stats */}
            <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Setting Statistics</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Settings</span>
                  <span className="font-medium">{settings.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Public Settings</span>
                  <span className="font-medium">{settings.filter(s => s.isPublic).length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Categories</span>
                  <span className="font-medium">{categories.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-span-9">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {/* Category Header */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center">
                  {(() => {
                    const category = categories.find(cat => cat.name === activeCategory);
                    if (category) {
                      const Icon = category.icon;
                      return (
                        <>
                          <Icon className="h-6 w-6 text-primary-600 mr-3" />
                          <div>
                            <h2 className="text-xl font-semibold text-gray-900">{category.description}</h2>
                            <p className="text-sm text-gray-600 mt-1">
                              Configure {category.description.toLowerCase()} for your platform
                            </p>
                          </div>
                        </>
                      );
                    }
                    return null;
                  })()}
                </div>
              </div>

              {/* Settings List */}
              <div className="p-6">
                <div className="space-y-6">
                  {activeSettings.map((setting) => (
                    <div key={setting.id} className="flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0">
                      <div className="flex-1 mr-6">
                        <div className="flex items-center">
                          <label className="text-sm font-medium text-gray-900">
                            {setting.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </label>
                          {!setting.isPublic && (
                            <KeyIcon className="h-4 w-4 text-red-500 ml-2" title="Private Setting" />
                          )}
                          {setting.isPublic && (
                            <GlobeAltIcon className="h-4 w-4 text-green-500 ml-2" title="Public Setting" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{setting.description}</p>
                        <div className="flex items-center mt-2">
                          <span className="text-xs text-gray-400">
                            Type: {setting.dataType} • 
                          </span>
                          <span className={`text-xs ml-1 ${setting.isPublic ? 'text-green-600' : 'text-red-600'}`}>
                            {setting.isPublic ? 'Public' : 'Private'}
                          </span>
                        </div>
                      </div>
                      <div className="flex-shrink-0 w-64">
                        {renderSettingInput(setting)}
                      </div>
                    </div>
                  ))}
                </div>

                {activeSettings.length === 0 && (
                  <div className="text-center py-8">
                    <CogIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No settings found in this category</p>
                  </div>
                )}
              </div>
            </div>

            {/* Help Section */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <DocumentTextIcon className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-blue-900">Settings Help</h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <ul className="list-disc list-inside space-y-1">
                      <li><strong>Public Settings:</strong> Visible to frontend applications</li>
                      <li><strong>Private Settings:</strong> Server-side only, not exposed to clients</li>
                      <li><strong>Boolean Settings:</strong> True/False toggle switches</li>
                      <li><strong>Number Settings:</strong> Numeric values with validation</li>
                      <li><strong>String Settings:</strong> Text values, passwords are hidden</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;
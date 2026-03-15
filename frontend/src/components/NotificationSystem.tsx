import { useState, useEffect } from 'react';
import {
  BellIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  XMarkIcon,
  EyeIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

export interface Notification {
  id: number;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
  relatedEntity?: {
    type: 'donation' | 'campaign' | 'user';
    id: number;
    name: string;
  };
}

interface NotificationSystemProps {
  className?: string;
}

const NotificationSystem = ({ className = '' }: NotificationSystemProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showPanel, setShowPanel] = useState(false);
  // const [loading, setLoading] = useState(false);

  // Mock notifications - replace with actual API call
  useEffect(() => {
    const mockNotifications: Notification[] = [
      {
        id: 1,
        type: 'success',
        title: 'নতুন ডোনেশন',
        message: 'রহিম আহমেদ ৫,০০০ টাকা দান করেছেন "শিক্ষা কার্যক্রম" এ',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        isRead: false,
        relatedEntity: {
          type: 'donation',
          id: 123,
          name: 'শিক্ষা কার্যক্রম'
        }
      },
      {
        id: 2,
        type: 'warning',
        title: 'ক্যাম্পেইন অনুমোদন প্রয়োজন',
        message: '৩টি নতুন ক্যাম্পেইন অনুমোদনের জন্য অপেক্ষমান',
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        isRead: false,
        actionUrl: '/admin/campaigns?filter=pending'
      },
      {
        id: 3,
        type: 'info',
        title: 'নতুন ভলান্টিয়ার রেজিস্ট্রেশন',
        message: 'ফাতিমা খাতুন ভলান্টিয়ার হিসেবে নিবন্ধন করেছেন',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        isRead: true,
        relatedEntity: {
          type: 'user',
          id: 456,
          name: 'ফাতিমা খাতুন'
        }
      },
      {
        id: 4,
        type: 'error',
        title: 'পেমেন্ট ব্যর্থ',
        message: 'একটি ডোনেশন পেমেন্ট ব্যর্থ হয়েছে, তদন্ত প্রয়োজন',
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        isRead: false,
        relatedEntity: {
          type: 'donation',
          id: 789,
          name: 'ব্যর্থ পেমেন্ট'
        }
      },
      {
        id: 5,
        type: 'success',
        title: 'ক্যাম্পেইন সম্পন্ন',
        message: '"পানি সরবরাহ প্রকল্প" সফলভাবে টার্গেট অর্জন করেছে',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        isRead: true,
        relatedEntity: {
          type: 'campaign',
          id: 101,
          name: 'পানি সরবরাহ প্রকল্প'
        }
      }
    ];
    
    setNotifications(mockNotifications);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = (notificationId: number) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, isRead: true } : n
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, isRead: true }))
    );
  };

  const deleteNotification = (notificationId: number) => {
    setNotifications(prev => 
      prev.filter(n => n.id !== notificationId)
    );
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      case 'info':
        return <InformationCircleIcon className="h-5 w-5 text-blue-500" />;
      default:
        return <BellIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  // const getNotificationBgColor = (type: string, isRead: boolean) => {
  //   const opacity = isRead ? '50' : '100';
  //   switch (type) {
  //     case 'success':
  //       return `bg-green-${opacity} border-green-200`;
  //     case 'warning':
  //       return `bg-yellow-${opacity} border-yellow-200`;
  //     case 'error':
  //       return `bg-red-${opacity} border-red-200`;
  //     case 'info':
  //       return `bg-blue-${opacity} border-blue-200`;
  //     default:
  //       return `bg-gray-${opacity} border-gray-200`;
  //   }
  // };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'এখনই';
    if (diffInMinutes < 60) return `${diffInMinutes} মিনিট আগে`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} ঘন্টা আগে`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} দিন আগে`;
  };

  return (
    <div className={`relative ${className}`}>
      {/* Notification Bell */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="relative p-2 text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-lg"
      >
        <BellIcon className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {showPanel && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">নোটিফিকেশন</h3>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-primary-600 hover:text-primary-800"
                >
                  সব পড়া হয়েছে
                </button>
              )}
              <button
                onClick={() => setShowPanel(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500">
                <BellIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p>কোন নোটিফিকেশন নেই</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    !notification.isRead ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm font-medium ${
                          !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          {notification.title}
                        </p>
                        <div className="flex items-center space-x-1">
                          {!notification.isRead && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="text-gray-400 hover:text-gray-600"
                              title="পড়া হয়েছে চিহ্নিত করুন"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="text-gray-400 hover:text-red-600"
                            title="মুছে ফেলুন"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-gray-400">
                          {formatTimestamp(notification.timestamp)}
                        </p>
                        {notification.actionUrl && (
                          <button
                            onClick={() => window.location.href = notification.actionUrl!}
                            className="text-xs text-primary-600 hover:text-primary-800"
                          >
                            বিস্তারিত দেখুন →
                          </button>
                        )}
                      </div>
                      {notification.relatedEntity && (
                        <div className="mt-2">
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                            {notification.relatedEntity.type === 'donation' && '💰'}
                            {notification.relatedEntity.type === 'campaign' && '🎯'}
                            {notification.relatedEntity.type === 'user' && '👤'}
                            {notification.relatedEntity.name}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => window.location.href = '/admin/notifications'}
                className="w-full text-center text-sm text-primary-600 hover:text-primary-800"
              >
                সব নোটিফিকেশন দেখুন
              </button>
            </div>
          )}
        </div>
      )}

      {/* Overlay */}
      {showPanel && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowPanel(false)}
        />
      )}
    </div>
  );
};

export default NotificationSystem;
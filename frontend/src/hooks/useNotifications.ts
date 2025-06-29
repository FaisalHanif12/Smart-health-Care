import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import notificationService from '../services/notificationService';

interface NotificationHookReturn {
  notificationService: typeof notificationService;
  isSupported: boolean;
  permission: NotificationPermission;
  requestPermission: () => Promise<boolean>;
  sendWorkoutReminder: () => void;
  testNotification: () => void;
  scheduleReminders: (enabled: boolean, time: string) => void;
}

export const useNotifications = (): NotificationHookReturn => {
  const { user } = useAuth();
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if (notificationService.isSupported()) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async (): Promise<boolean> => {
    const granted = await notificationService.requestPermission();
    setPermission(Notification.permission);
    return granted;
  };

  const sendWorkoutReminder = (): void => {
    notificationService.sendWorkoutReminder();
  };

  const testNotification = (): void => {
    notificationService.testNotification();
  };

  const scheduleReminders = (enabled: boolean, time: string): void => {
    if (!user?._id) return;
    
    notificationService.scheduleWorkoutReminder({
      enabled,
      time,
      userId: user._id
    });
  };

  return {
    notificationService,
    isSupported: notificationService.isSupported(),
    permission,
    requestPermission,
    sendWorkoutReminder,
    testNotification,
    scheduleReminders
  };
}; 
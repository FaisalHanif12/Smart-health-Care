interface NotificationPermission {
  granted: boolean;
  denied: boolean;
  default: boolean;
}

interface WorkoutNotificationOptions {
  enabled: boolean;
  time: string; // Format: "HH:MM"
  userId: string;
}

class NotificationService {
  private static instance: NotificationService;
  private notificationInterval: number | null = null;
  
  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Check if browser supports notifications
  isSupported(): boolean {
    return 'Notification' in window && 'serviceWorker' in navigator;
  }

  // Get current permission status
  getPermissionStatus(): NotificationPermission {
    if (!this.isSupported()) {
      return { granted: false, denied: true, default: false };
    }

    const permission = Notification.permission;
    return {
      granted: permission === 'granted',
      denied: permission === 'denied',
      default: permission === 'default'
    };
  }

  // Request notification permission
  async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) {
      console.warn('Notifications not supported in this browser');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      console.warn('Notification permission denied');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  // Send immediate notification
  sendNotification(title: string, options: NotificationOptions = {}): Notification | null {
    if (!this.isSupported() || Notification.permission !== 'granted') {
      console.warn('Cannot send notification: permission not granted');
      return null;
    }

    const defaultOptions: NotificationOptions = {
      icon: '/vite.svg', // Using the default icon, you can change this
      badge: '/vite.svg',
      requireInteraction: true,
      tag: 'workout-reminder',
      ...options
    };

    try {
      const notification = new Notification(title, defaultOptions);
      
      // Auto-close after 10 seconds if not interacted with
      setTimeout(() => {
        notification.close();
      }, 10000);

      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      return null;
    }
  }

  // Send workout reminder notification
  sendWorkoutReminder(): void {
    const workoutMessages = [
      "💪 Time for your workout! Let's get stronger today!",
      "🏃‍♂️ Your body is calling - time to exercise!",
      "🔥 Ready to crush your fitness goals? Let's go!",
      "⚡ Workout time! Your future self will thank you!",
      "🎯 Consistency is key - time for your workout!",
      "🚀 Transform your day with a great workout!",
      "💯 Your workout is waiting - let's make it count!"
    ];

    const randomMessage = workoutMessages[Math.floor(Math.random() * workoutMessages.length)];
    
    const notification = this.sendNotification('🏋️ Workout Reminder', {
      body: randomMessage,
      data: {
        url: '/dashboard/workout',
        action: 'workout-reminder'
      }
    });

    if (notification) {
      // Handle notification click
      notification.onclick = () => {
        window.focus();
        // Navigate to workout page
        if (window.location.pathname !== '/dashboard/workout') {
          window.location.href = '/dashboard/workout';
        }
        notification.close();
      };
    }
  }

  // Calculate milliseconds until target time today or tomorrow
  private getMillisecondsUntilTime(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number);
    const now = new Date();
    const targetTime = new Date();
    
    targetTime.setHours(hours, minutes, 0, 0);
    
    // If target time has passed today, schedule for tomorrow
    if (targetTime.getTime() <= now.getTime()) {
      targetTime.setDate(targetTime.getDate() + 1);
    }
    
    return targetTime.getTime() - now.getTime();
  }

  // Schedule daily workout reminders
  scheduleWorkoutReminder(options: WorkoutNotificationOptions): void {
    // Clear existing interval
    this.clearWorkoutReminder();

    if (!options.enabled || !this.isSupported() || Notification.permission !== 'granted') {
      return;
    }

    // Calculate time until first notification
    const timeUntilNotification = this.getMillisecondsUntilTime(options.time);

    // Schedule first notification
    setTimeout(() => {
      this.sendWorkoutReminder();
      
      // Then schedule daily recurring notifications
      this.notificationInterval = setInterval(() => {
        this.sendWorkoutReminder();
      }, 24 * 60 * 60 * 1000); // 24 hours in milliseconds

    }, timeUntilNotification);

    // Save scheduling info
    localStorage.setItem(`notificationScheduled_${options.userId}`, JSON.stringify({
      enabled: true,
      time: options.time,
      scheduledAt: new Date().toISOString()
    }));

    console.log(`Workout reminder scheduled for ${options.time} daily`);
  }

  // Clear scheduled workout reminders
  clearWorkoutReminder(): void {
    if (this.notificationInterval) {
      clearInterval(this.notificationInterval);
      this.notificationInterval = null;
    }
  }

  // Test notification (for debugging)
  testNotification(): void {
    this.sendNotification('🧪 Test Notification', {
      body: 'This is a test notification from your Fitness Planner app!',
      tag: 'test-notification'
    });
  }

  // Initialize from saved settings
  initializeFromSettings(userId: string): void {
    if (!userId) return;

    try {
      const savedAppSettings = localStorage.getItem(`appSettings_${userId}`);
      if (savedAppSettings) {
        const settings = JSON.parse(savedAppSettings);
        if (settings.workoutReminders && settings.workoutTime) {
          this.scheduleWorkoutReminder({
            enabled: settings.workoutReminders,
            time: settings.workoutTime,
            userId: userId
          });
        }
      }
    } catch (error) {
      console.error('Error initializing notifications from settings:', error);
    }
  }

  // Get notification statistics (for debugging)
  getNotificationStats(): object {
    return {
      supported: this.isSupported(),
      permission: Notification.permission,
      scheduled: this.notificationInterval !== null
    };
  }
}

const notificationService = NotificationService.getInstance();
export default notificationService;
export { NotificationService }; 
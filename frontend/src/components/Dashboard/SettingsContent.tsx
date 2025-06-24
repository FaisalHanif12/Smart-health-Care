import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface AppSettings {
  workoutReminders: boolean;
  workoutTime: string;
  units: 'metric' | 'imperial';
  autoSave: boolean;
}

export default function SettingsContent() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // State for app settings
  const [appSettings, setAppSettings] = useState<AppSettings>({
    workoutReminders: true,
    workoutTime: '08:00',
    units: 'metric',
    autoSave: true
  });

  // State for UI interactions
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Notification states
  const [notificationPermission, setNotificationPermission] = useState<'granted' | 'denied' | 'default'>('default');
  const [notificationSupported, setNotificationSupported] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    if (user?._id) {
      const savedAppSettings = localStorage.getItem(`appSettings_${user._id}`);

      if (savedAppSettings) {
        try {
          const settings = JSON.parse(savedAppSettings);
          const newAppSettings = {
            workoutReminders: settings.workoutReminders ?? true,
            workoutTime: settings.workoutTime ?? '08:00',
            units: settings.units ?? 'metric',
            autoSave: settings.autoSave ?? true
          };
          setAppSettings(newAppSettings);
          
          // Initialize notification scheduling if enabled and permission granted
          if (newAppSettings.workoutReminders && Notification.permission === 'granted') {
            scheduleWorkoutNotifications(true, newAppSettings.workoutTime);
          }
        } catch (error) {
          console.error('Error loading app settings:', error);
        }
      }
    }
  }, [user?._id]);

  // Initialize notification support check
  useEffect(() => {
    const supported = 'Notification' in window;
    setNotificationSupported(supported);
    
    if (supported) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  // Cleanup notifications on unmount
  useEffect(() => {
    return () => {
      if (user?._id) {
        const existingTimer = localStorage.getItem(`notificationTimer_${user._id}`);
        if (existingTimer) {
          clearTimeout(Number(existingTimer));
          localStorage.removeItem(`notificationTimer_${user._id}`);
        }
      }
    };
  }, [user]);

  // Handle app setting changes
  const updateAppSetting = async (key: keyof AppSettings, value: any) => {
    setAppSettings(prev => ({ ...prev, [key]: value }));
    
    // Auto-save settings
    if (user?._id) {
      const newSettings = { ...appSettings, [key]: value };
      localStorage.setItem(`appSettings_${user._id}`, JSON.stringify(newSettings));
      
      // Handle workout reminder changes
      if (key === 'workoutReminders' || key === 'workoutTime') {
        if (key === 'workoutReminders' && value === true) {
          // Request permission when enabling reminders
          const hasPermission = await requestNotificationPermission();
          if (!hasPermission) {
            // Revert the setting if permission denied
            setAppSettings(prev => ({ ...prev, workoutReminders: false }));
            const revertedSettings = { ...newSettings, workoutReminders: false };
            localStorage.setItem(`appSettings_${user._id}`, JSON.stringify(revertedSettings));
            return;
          }
        }
        
        // Update notification scheduling
        const finalSettings = key === 'workoutTime' ? newSettings : { ...newSettings, [key]: value };
        scheduleWorkoutNotifications(finalSettings.workoutReminders, finalSettings.workoutTime);
      }
    }
  };

  // Request notification permission
  const requestNotificationPermission = async (): Promise<boolean> => {
    if (!notificationSupported) {
      alert('Notifications are not supported in your browser.');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      alert('Notification permission denied. You can enable it in your browser settings.');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  };

  // Schedule workout notifications
  const scheduleWorkoutNotifications = (enabled: boolean, time: string) => {
    // Clear any existing scheduled notification
    const existingTimer = localStorage.getItem(`notificationTimer_${user?._id}`);
    if (existingTimer) {
      clearTimeout(Number(existingTimer));
      localStorage.removeItem(`notificationTimer_${user?._id}`);
    }

    if (!enabled || !user?._id || notificationPermission !== 'granted') {
      return;
    }

    const scheduleNext = () => {
      const [hours, minutes] = time.split(':').map(Number);
      const now = new Date();
      const targetTime = new Date();
      
      targetTime.setHours(hours, minutes, 0, 0);
      
      // If target time has passed today, schedule for tomorrow
      if (targetTime.getTime() <= now.getTime()) {
        targetTime.setDate(targetTime.getDate() + 1);
      }
      
      const timeUntilNotification = targetTime.getTime() - now.getTime();
      
      const timerId = setTimeout(() => {
        sendWorkoutReminder();
        // Schedule the next one for 24 hours later
        scheduleNext();
      }, timeUntilNotification);
      
      // Save timer ID for cleanup
      localStorage.setItem(`notificationTimer_${user._id}`, timerId.toString());
      
      console.log(`Next workout reminder scheduled for: ${targetTime.toLocaleString()}`);
    };

    scheduleNext();
  };

  // Send workout reminder notification
  const sendWorkoutReminder = () => {
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
    
    try {
      // Play notification sound
      playNotificationSound();
      
      const notification = new Notification('🏋️ Workout Reminder', {
        body: randomMessage,
        icon: '/fitness tracker.webp',
        requireInteraction: true,
        tag: 'workout-reminder',
        badge: '/fitness tracker.webp'
      });

      notification.onclick = () => {
        window.focus();
        // Navigate to workout page
        window.location.href = '/dashboard/workout';
        notification.close();
      };

      // Auto-close after 15 seconds if not clicked
      setTimeout(() => {
        notification.close();
      }, 15000);
      
    } catch (error) {
      console.error('Error creating workout reminder:', error);
    }
  };

  // Play notification sound
  const playNotificationSound = () => {
    try {
      // Create audio context for better browser support
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create a simple workout motivation sound using Web Audio API
      const createWorkoutSound = () => {
        const duration = 0.8;
        const sampleRate = audioContext.sampleRate;
        const buffer = audioContext.createBuffer(1, duration * sampleRate, sampleRate);
        const data = buffer.getChannelData(0);
        
        // Create energetic workout sound with multiple tones
        for (let i = 0; i < buffer.length; i++) {
          const t = i / sampleRate;
          // Main motivational tone (440Hz - A note)
          const tone1 = Math.sin(2 * Math.PI * 440 * t);
          // Higher energy tone (660Hz - E note)
          const tone2 = Math.sin(2 * Math.PI * 660 * t);
          // Power chord effect (880Hz - A octave)
          const tone3 = Math.sin(2 * Math.PI * 880 * t);
          
          // Envelope for natural sound decay
          const envelope = Math.exp(-t * 3);
          
          // Mix tones with different weights for energetic sound
          data[i] = (tone1 * 0.4 + tone2 * 0.3 + tone3 * 0.3) * envelope * 0.1;
        }
        
        return buffer;
      };
      
      const source = audioContext.createBufferSource();
      source.buffer = createWorkoutSound();
      source.connect(audioContext.destination);
      source.start(0);
      
    } catch (error) {
      console.log('Audio not supported or permission denied:', error);
      // Fallback: try to use a system beep or simple audio
      try {
        // Create a simple beep sound as fallback
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+D0u2gbBDWH0fPTgjEGHm7A7+OZURE');
        audio.volume = 0.1;
        audio.play().catch(() => {
          // Silent fallback if audio fails
        });
      } catch (fallbackError) {
        // Silent fallback
      }
    }
  };

  // Export user data
  const exportUserData = () => {
    if (!user?._id) return;

    const userData = {
      profile: user.profile,
      dietPlan: localStorage.getItem(`dietPlan_${user._id}`),
      workoutPlan: localStorage.getItem(`workoutPlan_${user._id}`),
      dietProgress: localStorage.getItem(`dietProgress_${user._id}`),
      workoutProgress: localStorage.getItem(`workoutProgress_${user._id}`),
      settings: {
        appSettings
      },
      exportDate: new Date().toISOString()
    };

    const dataStr = JSON.stringify(userData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `fitness-planner-data-${user.username}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Delete account (clears local data and logs out)
  const deleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE MY ACCOUNT') {
      alert('Please type "DELETE MY ACCOUNT" exactly to confirm.');
      return;
    }

    setIsLoading(true);
    try {
      // Clear all local data for this user
      if (user?._id) {
        const keys = [
          `dietPlan_${user._id}`,
          `workoutPlan_${user._id}`,
          `dietProgress_${user._id}`,
          `workoutProgress_${user._id}`,
          `waterIntake_${user._id}`,
          `planDuration_${user._id}`,
          `cart_${user._id}`,
          `dietPlanMetadata_${user._id}`,
          `workoutPlanMetadata_${user._id}`,
          `planStartDate_${user._id}`,
          `lastRecommendationGeneration_${user._id}`,
          `cachedRecommendations_${user._id}`,
          `appSettings_${user._id}`
        ];

        keys.forEach(key => localStorage.removeItem(key));
      }
      
      // Logout the user
      await logout();
      navigate('/login');
      alert('Your local account data has been cleared. You will be redirected to the login page.');
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('There was an error clearing your data. Please try again.');
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false);
      setDeleteConfirmText('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">⚙️ Settings</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">Manage your preferences and account</p>
        </div>



        {/* Settings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Workout Reminders Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center mb-6">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full p-3 mr-4">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Workout Reminders</h3>
                <p className="text-gray-600 dark:text-gray-400">Daily workout notifications</p>
              </div>
            </div>
            
            <div className="space-y-4">
              {/* Notification Permission Status */}
              {notificationSupported && (
                <div className={`p-3 rounded-lg border ${
                  notificationPermission === 'granted' 
                    ? 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700' 
                    : notificationPermission === 'denied'
                    ? 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700'
                    : 'bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-700'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">
                        {notificationPermission === 'granted' ? '✅' : 
                         notificationPermission === 'denied' ? '❌' : '⚠️'}
                      </span>
                      <div>
                        <span className={`font-medium ${
                          notificationPermission === 'granted' 
                            ? 'text-green-800 dark:text-green-200' 
                            : notificationPermission === 'denied'
                            ? 'text-red-800 dark:text-red-200'
                            : 'text-yellow-800 dark:text-yellow-200'
                        }`}>
                          {notificationPermission === 'granted' ? 'Notifications Enabled' : 
                           notificationPermission === 'denied' ? 'Notifications Blocked' : 'Permission Required'}
                        </span>
                        <p className={`text-xs ${
                          notificationPermission === 'granted' 
                            ? 'text-green-600 dark:text-green-300' 
                            : notificationPermission === 'denied'
                            ? 'text-red-600 dark:text-red-300'
                            : 'text-yellow-600 dark:text-yellow-300'
                        }`}>
                          {notificationPermission === 'granted' ? 'You will receive workout reminders' : 
                           notificationPermission === 'denied' ? 'Enable in browser settings to receive reminders' : 
                           'Click enable to allow workout reminders'}
                        </p>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* Enable/Disable Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div>
                  <span className="font-medium text-gray-900 dark:text-white">Enable Reminders</span>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Get daily workout notifications</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={appSettings.workoutReminders}
                    onChange={(e) => updateAppSetting('workoutReminders', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                </label>
              </div>

              {/* Time Picker */}
              {appSettings.workoutReminders && (
                <div className="p-4 bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700/50 rounded-xl">
                  <label className="block text-sm font-medium text-purple-800 dark:text-purple-200 mb-2">
                    🕐 Reminder Time
                  </label>
                  <input
                    type="time"
                    value={appSettings.workoutTime}
                    onChange={(e) => updateAppSetting('workoutTime', e.target.value)}
                    className="w-full p-3 border border-purple-300 dark:border-purple-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <p className="text-xs text-purple-600 dark:text-purple-300 mt-2">
                    💡 You'll receive a reminder at this time every day
                  </p>
                  {notificationPermission === 'granted' && (
                    <div className="mt-3 p-2 bg-purple-100 dark:bg-purple-800/50 rounded-lg">
                      <p className="text-xs text-purple-700 dark:text-purple-200">
                        🔔 Next reminder: {appSettings.workoutTime} {new Date().toLocaleDateString()}
                      </p>
                  </div>
                  )}
                </div>
              )}

              {!notificationSupported && (
                <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    ⚠️ Notifications are not supported in your browser
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Account Information Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center mb-6">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full p-3 mr-4">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Account</h3>
                <p className="text-gray-600 dark:text-gray-400">Your profile details</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-600">
                <span className="text-gray-600 dark:text-gray-400 font-medium">Username</span>
                <span className="text-gray-900 dark:text-white font-semibold">{user?.username}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-600">
                <span className="text-gray-600 dark:text-gray-400 font-medium">Email</span>
                <span className="text-gray-900 dark:text-white font-semibold">{user?.email}</span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-gray-600 dark:text-gray-400 font-medium">Member Since</span>
                <span className="text-gray-900 dark:text-white font-semibold">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* App Preferences Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center mb-6">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-full p-3 mr-4">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">App Preferences</h3>
                <p className="text-gray-600 dark:text-gray-400">Units and behavior settings</p>
              </div>
            </div>
            
            <div className="space-y-6">
              {/* Measurement Units */}
              <div>
                <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">📏 Measurement Units</h4>
            <div className="space-y-3">
              {[
                { value: 'metric', label: 'Metric', desc: 'kg, cm, liters', icon: '📏' },
                { value: 'imperial', label: 'Imperial', desc: 'lbs, ft/in, oz', icon: '📐' }
              ].map((unit) => (
                <label
                  key={unit.value}
                      className={`flex items-center p-3 rounded-lg cursor-pointer transition-all ${
                    appSettings.units === unit.value
                      ? 'bg-green-50 dark:bg-green-900/30 border-2 border-green-500'
                      : 'bg-gray-50 dark:bg-gray-700 border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="units"
                    value={unit.value}
                    checked={appSettings.units === unit.value}
                    onChange={(e) => updateAppSetting('units', e.target.value)}
                    className="sr-only"
                  />
                  <div className="flex items-center flex-1">
                        <span className="text-xl mr-3">{unit.icon}</span>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{unit.label}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{unit.desc}</div>
                    </div>
                  </div>
                  {appSettings.units === unit.value && (
                        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </label>
              ))}
                </div>
              </div>

              {/* Auto-Save Setting */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <span className="font-medium text-gray-900 dark:text-white">💾 Auto-Save Progress</span>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Automatically save your workout and diet progress</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={appSettings.autoSave}
                      onChange={(e) => updateAppSetting('autoSave', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Export Data Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center mb-6">
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-full p-3 mr-4">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Export Data</h3>
                <p className="text-gray-600 dark:text-gray-400">Download your information</p>
              </div>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
              Get a complete backup of your fitness data including diet plans, workout plans, and progress tracking.
            </p>
            
            <button
              onClick={exportUserData}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
            >
              📥 Download My Data
            </button>
          </div>

        </div>

        {/* Danger Zone */}
        <div className="mt-12 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border-2 border-red-200 dark:border-red-800">
          <div className="flex items-center mb-6">
            <div className="bg-gradient-to-r from-red-500 to-rose-500 rounded-full p-3 mr-4">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-red-700 dark:text-red-400">Danger Zone</h3>
              <p className="text-red-600 dark:text-red-400">Irreversible actions</p>
            </div>
          </div>
          
          <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 border border-red-200 dark:border-red-800">
            <h4 className="font-bold text-red-800 dark:text-red-300 mb-2">Clear Account Data</h4>
            <p className="text-red-700 dark:text-red-400 mb-6 leading-relaxed">
              This will permanently remove all your local data including diet plans, workout plans, and progress. You will be logged out immediately.
            </p>
            
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105"
            >
              🗑️ Clear My Data
            </button>
          </div>
        </div>

      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="text-center mb-6">
              <div className="bg-red-100 dark:bg-red-900/30 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Clear Account Data</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                This action will clear all your local fitness data and log you out immediately.
              </p>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type <span className="font-bold text-red-600 dark:text-red-400">"DELETE MY ACCOUNT"</span> to confirm:
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Type here..."
                className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteConfirmText('');
                }}
                className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={deleteAccount}
                disabled={isLoading || deleteConfirmText !== 'DELETE MY ACCOUNT'}
                className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Clearing...' : 'Clear Data'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
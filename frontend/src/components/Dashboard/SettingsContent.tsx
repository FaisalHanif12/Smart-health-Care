import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';

interface AppSettings {
  theme: 'light' | 'dark';
  units: 'metric' | 'imperial';
}

export default function SettingsContent() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  
  // State for app settings
  const [appSettings, setAppSettings] = useState<AppSettings>({
    theme: 'dark',
    units: 'metric'
  });

  // State for UI interactions
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Load settings from localStorage on mount and sync with theme context
  useEffect(() => {
    if (user?._id) {
      const savedAppSettings = localStorage.getItem(`appSettings_${user._id}`);

      if (savedAppSettings) {
        try {
          const settings = JSON.parse(savedAppSettings);
          setAppSettings(settings);
        } catch (error) {
          console.error('Error loading app settings:', error);
        }
      }
    }
  }, [user?._id]);

  // Sync settings with theme context
  useEffect(() => {
    setAppSettings(prev => ({ ...prev, theme }));
  }, [theme]);

  // Save settings to localStorage
  const saveSettings = async () => {
    if (!user?._id) return;

    setSaveStatus('saving');
    try {
      localStorage.setItem(`appSettings_${user._id}`, JSON.stringify(appSettings));
      
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  // Handle app setting changes
  const updateAppSetting = (key: keyof AppSettings, value: any) => {
    if (key === 'theme') {
      setTheme(value); // Use theme context for theme changes
    }
    setAppSettings(prev => ({ ...prev, [key]: value }));
    
    // Auto-save when theme or units change
    if (user?._id) {
      const newSettings = { ...appSettings, [key]: value };
      localStorage.setItem(`appSettings_${user._id}`, JSON.stringify(newSettings));
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

        {/* Save Status */}
        {saveStatus !== 'idle' && (
          <div className={`mb-8 p-4 rounded-xl text-center font-medium ${
            saveStatus === 'saving' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200' :
            saveStatus === 'saved' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' :
            'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
          }`}>
            {saveStatus === 'saving' && '💾 Saving settings...'}
            {saveStatus === 'saved' && '✅ Settings saved successfully!'}
            {saveStatus === 'error' && '❌ Error saving settings. Please try again.'}
          </div>
        )}

        {/* Settings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Theme Preference Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center mb-6">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full p-3 mr-4">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Theme</h3>
                <p className="text-gray-600 dark:text-gray-400">Appearance preference</p>
              </div>
            </div>
            
            <div className="space-y-3">
              {['light', 'dark'].map((themeOption) => (
                <label
                  key={themeOption}
                  className={`flex items-center p-4 rounded-xl cursor-pointer transition-all ${
                    appSettings.theme === themeOption
                      ? 'bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-500'
                      : 'bg-gray-50 dark:bg-gray-700 border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="theme"
                    value={themeOption}
                    checked={appSettings.theme === themeOption}
                    onChange={(e) => updateAppSetting('theme', e.target.value)}
                    className="sr-only"
                  />
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">
                      {themeOption === 'light' ? '🌞' : '🌙'}
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white capitalize">
                      {themeOption}
                    </span>
                  </div>
                  {appSettings.theme === themeOption && (
                    <svg className="w-5 h-5 text-blue-500 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </label>
              ))}
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

          {/* Measurement Units Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center mb-6">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-full p-3 mr-4">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Units</h3>
                <p className="text-gray-600 dark:text-gray-400">Measurement system</p>
              </div>
            </div>
            
            <div className="space-y-3">
              {[
                { value: 'metric', label: 'Metric', desc: 'kg, cm, liters', icon: '📏' },
                { value: 'imperial', label: 'Imperial', desc: 'lbs, ft/in, oz', icon: '📐' }
              ].map((unit) => (
                <label
                  key={unit.value}
                  className={`flex items-center p-4 rounded-xl cursor-pointer transition-all ${
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
                    <span className="text-2xl mr-3">{unit.icon}</span>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{unit.label}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{unit.desc}</div>
                    </div>
                  </div>
                  {appSettings.units === unit.value && (
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </label>
              ))}
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
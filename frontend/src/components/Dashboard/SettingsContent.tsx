import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';

interface AppSettings {
  theme: 'light' | 'dark';
  units: 'metric' | 'imperial';
  autoSave: boolean;
}

export default function SettingsContent() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  
  // State for app settings
  const [appSettings, setAppSettings] = useState<AppSettings>({
    theme: 'dark',
    units: 'metric',
    autoSave: true
  });

  // State for UI interactions
  const [activeSection, setActiveSection] = useState<'general' | 'account'>('general');
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
          // Don't set theme here - ThemeContext handles it
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

  const sectionTabs = [
    { id: 'general' as const, name: 'General', icon: '⚙️' },
    { id: 'account' as const, name: 'Account', icon: '👤' }
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your preferences and account settings</p>
      </div>

      {/* Save Status */}
      {saveStatus !== 'idle' && (
        <div className={`mb-6 p-4 rounded-lg ${
          saveStatus === 'saving' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200' :
          saveStatus === 'saved' ? 'bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-200' :
          'bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200'
        }`}>
          {saveStatus === 'saving' && '💾 Saving settings...'}
          {saveStatus === 'saved' && '✅ Settings saved successfully!'}
          {saveStatus === 'error' && '❌ Error saving settings. Please try again.'}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Settings Categories</h3>
            <nav className="space-y-2">
              {sectionTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveSection(tab.id)}
                  className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors ${
                    activeSection === tab.id
                      ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-700'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span className="font-medium">{tab.name}</span>
                </button>
              ))}
            </nav>

            {/* Quick Actions */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">Quick Actions</h4>
              <div className="space-y-2">
                <button
                  onClick={saveSettings}
                  disabled={saveStatus === 'saving'}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  💾 Save Settings
                </button>
                <button
                  onClick={exportUserData}
                  className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  📥 Export Data
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            
            {/* General Settings */}
            {activeSection === 'general' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">⚙️ General Settings</h2>
                
                <div className="space-y-6">
                  {/* Theme Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Theme Preference
                    </label>
                    <select
                      value={appSettings.theme}
                      onChange={(e) => updateAppSetting('theme', e.target.value)}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="light">🌞 Light</option>
                      <option value="dark">🌙 Dark</option>
                    </select>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Choose your preferred theme for the dashboard</p>
                  </div>

                  {/* Units Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Measurement Units
                    </label>
                    <select
                      value={appSettings.units}
                      onChange={(e) => updateAppSetting('units', e.target.value)}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="metric">📏 Metric (kg, cm)</option>
                      <option value="imperial">📐 Imperial (lbs, ft/in)</option>
                    </select>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Units used for weight, height, and measurements</p>
                  </div>

                  {/* Auto Save */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">Auto-save Progress</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Automatically save your workout and diet progress as you complete them</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={appSettings.autoSave}
                        onChange={(e) => updateAppSetting('autoSave', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Account Management */}
            {activeSection === 'account' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">👤 Account Management</h2>
                
                <div className="space-y-6">
                  {/* Account Info */}
                  <div className="p-6 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg">
                    <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-2">📋 Account Information</h3>
                    <div className="space-y-2 text-blue-700 dark:text-blue-300">
                      <p><strong>Username:</strong> {user?.username}</p>
                      <p><strong>Email:</strong> {user?.email}</p>
                      <p><strong>Member Since:</strong> {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
                    </div>
                  </div>

                  {/* Export Data */}
                  <div className="p-6 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg">
                    <h3 className="text-lg font-semibold text-green-900 dark:text-green-200 mb-2">📥 Export Your Data</h3>
                    <p className="text-green-700 dark:text-green-300 mb-4">Download a complete copy of all your fitness data, including diet plans, workout plans, and progress.</p>
                    <button
                      onClick={exportUserData}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors"
                    >
                      Download Data Export
                    </button>
                  </div>

                  {/* Delete Account */}
                  <div className="p-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg">
                    <h3 className="text-lg font-semibold text-red-900 dark:text-red-200 mb-2">🗑️ Clear Account Data</h3>
                    <p className="text-red-700 dark:text-red-300 mb-4">This will clear all your local data including diet plans, workout plans, and progress. You will be logged out after this action.</p>
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
                    >
                      Clear My Data
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-red-900 dark:text-red-200 mb-4">⚠️ Clear Account Data</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              This action will clear all your local fitness data including diet plans, workout plans, and progress. You will be logged out immediately.
            </p>
            <p className="text-sm text-red-600 dark:text-red-400 mb-4">
              Type <strong>"DELETE MY ACCOUNT"</strong> below to confirm:
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="Type here..."
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg mb-6 focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteConfirmText('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={deleteAccount}
                disabled={isLoading || deleteConfirmText !== 'DELETE MY ACCOUNT'}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
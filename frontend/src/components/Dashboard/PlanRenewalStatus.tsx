import { useState, useEffect } from 'react';
import { PlanRenewalService } from '../../services/planRenewalService';

export default function PlanRenewalStatus() {
  const [renewalStatus, setRenewalStatus] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const updateStatus = () => {
      const renewalService = PlanRenewalService.getInstance();
      const status = renewalService.getRenewalStatus();
      setRenewalStatus(status);

      // Load notifications
      const saved = localStorage.getItem('planRenewalNotifications');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setNotifications(parsed.filter((n: any) => !n.read).slice(0, 3)); // Show only unread, max 3
        } catch (error) {
          console.error('Error loading notifications:', error);
        }
      }
    };

    updateStatus();
    const interval = setInterval(updateStatus, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const markNotificationAsRead = (id: number) => {
    const saved = localStorage.getItem('planRenewalNotifications');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const updated = parsed.map((n: any) => 
          n.id === id ? { ...n, read: true } : n
        );
        localStorage.setItem('planRenewalNotifications', JSON.stringify(updated));
        setNotifications(updated.filter((n: any) => !n.read).slice(0, 3));
      } catch (error) {
        console.error('Error updating notifications:', error);
      }
    }
  };

  if (!renewalStatus || (!renewalStatus.diet && !renewalStatus.workout)) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        📅 Plan Progress & Renewal Status
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Diet Plan Status */}
        {renewalStatus.diet && (
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-green-800">🥗 Diet Plan</h4>
              <span className="text-sm text-green-600 font-medium">
                Week {renewalStatus.diet.currentWeek} / {renewalStatus.diet.totalWeeks}
              </span>
            </div>
            <div className="text-sm text-green-700">
              {renewalStatus.diet.daysUntilRenewal > 0 ? (
                <p>
                  Next renewal in <span className="font-semibold">{renewalStatus.diet.daysUntilRenewal} days</span>
                  <br />
                  <span className="text-xs opacity-75">
                    {new Date(renewalStatus.diet.renewalDate).toLocaleDateString()}
                  </span>
                </p>
              ) : (
                <p className="text-orange-600 font-medium">
                  ⏰ Plan renewal due! New week will be generated automatically.
                </p>
              )}
            </div>
            <div className="mt-2 bg-green-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${(renewalStatus.diet.currentWeek / renewalStatus.diet.totalWeeks) * 100}%` 
                }}
              />
            </div>
          </div>
        )}

        {/* Workout Plan Status */}
        {renewalStatus.workout && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-blue-800">💪 Workout Plan</h4>
              <span className="text-sm text-blue-600 font-medium">
                Week {renewalStatus.workout.currentWeek} / {renewalStatus.workout.totalWeeks}
              </span>
            </div>
            <div className="text-sm text-blue-700">
              {renewalStatus.workout.daysUntilRenewal > 0 ? (
                <p>
                  Next renewal in <span className="font-semibold">{renewalStatus.workout.daysUntilRenewal} days</span>
                  <br />
                  <span className="text-xs opacity-75">
                    {new Date(renewalStatus.workout.renewalDate).toLocaleDateString()}
                  </span>
                </p>
              ) : (
                <p className="text-orange-600 font-medium">
                  ⏰ Plan renewal due! New week will be generated automatically.
                </p>
              )}
            </div>
            <div className="mt-2 bg-blue-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${(renewalStatus.workout.currentWeek / renewalStatus.workout.totalWeeks) * 100}%` 
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Renewal Notifications */}
      {notifications.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-800 mb-3">Recent Plan Updates</h4>
          <div className="space-y-2">
            {notifications.map((notification) => (
              <div 
                key={notification.id}
                className="flex items-start justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
              >
                <div className="flex-1">
                  <p className="text-sm text-yellow-800">{notification.message}</p>
                  <p className="text-xs text-yellow-600 mt-1">
                    {new Date(notification.timestamp).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => markNotificationAsRead(notification.id)}
                  className="ml-2 text-yellow-600 hover:text-yellow-800 transition-colors"
                  title="Mark as read"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Information Note */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-xs text-gray-600">
            ℹ️ <strong>Auto-Renewal System:</strong> Your diet plan renews every 7 days and workout plan every 6 days with progressive difficulty and new exercises. Plans automatically advance to the next week when the renewal date is reached.
          </p>
        </div>
      </div>
    </div>
  );
} 
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface UserProfile {
  username: string;
  age: string;
  gender: string;
  height: string;
  weight: string;
  healthConditions: string[];
  fitnessGoal: string;
  profileImage?: string;
}

export default function ProfileContent() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, updateProfile } = useAuth();
  
  const [profile, setProfile] = useState<UserProfile>(() => ({
    username: user?.username || '',
    age: user?.profile?.age?.toString() || '',
    gender: user?.profile?.gender || 'male',
    height: user?.profile?.height?.toString() || '',
    weight: user?.profile?.weight?.toString() || '',
    healthConditions: user?.profile?.healthConditions || ['None'],
    fitnessGoal: user?.profile?.fitnessGoal || 'General Fitness',
    profileImage: user?.profile?.profileImage || ''
  }));

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPrompt, setShowPrompt] = useState(false);
  const [generatedPrompt] = useState('');
  const [promptType] = useState<'diet' | 'workout' | 'general'>('general');

  useEffect(() => {
    if (user) {
      setProfile({
        username: user.username,
        age: user.profile?.age?.toString() || '',
        gender: user.profile?.gender || 'male',
        height: user.profile?.height?.toString() || '',
        weight: user.profile?.weight?.toString() || '',
        healthConditions: user.profile?.healthConditions || ['None'],
        fitnessGoal: user.profile?.fitnessGoal || 'General Fitness',
        profileImage: user.profile?.profileImage || ''
      });
    }
  }, [user]);

  const healthConditionOptions = ['Diabetes', 'PCOS', 'High Blood Pressure', 'None'];
  const fitnessGoalOptions = ['Muscle Building', 'Fat Burning', 'Weight Gain', 'General Fitness'];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleHealthConditionChange = (condition: string) => {
    setProfile(prev => ({
      ...prev,
      healthConditions: prev.healthConditions.includes(condition)
        ? prev.healthConditions.filter(c => c !== condition)
        : [...prev.healthConditions, condition]
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        setProfile(prev => ({ ...prev, profileImage: imageUrl }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = () => {
    if (isEditing) {
      fileInputRef.current?.click();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const profileData = {
        age: parseInt(profile.age),
        gender: profile.gender,
        height: parseInt(profile.height),
        weight: parseInt(profile.weight),
        healthConditions: profile.healthConditions,
        fitnessGoal: profile.fitnessGoal,
        profileImage: profile.profileImage
      };

      await updateProfile(profileData);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  // Calculate BMI
  const calculateBMI = () => {
    const heightInM = parseFloat(profile.height) / 100;
    const weightInKg = parseFloat(profile.weight);
    if (heightInM && weightInKg) {
      return (weightInKg / (heightInM * heightInM)).toFixed(1);
    }
    return 'N/A';
  };

  const getBMICategory = (bmi: string) => {
    const bmiValue = parseFloat(bmi);
    if (bmiValue < 18.5) return { category: 'Underweight', color: 'text-blue-600' };
    if (bmiValue < 25) return { category: 'Normal', color: 'text-green-600' };
    if (bmiValue < 30) return { category: 'Overweight', color: 'text-yellow-600' };
    return { category: 'Obese', color: 'text-red-600' };
  };

  const bmi = calculateBMI();
  const bmiInfo = getBMICategory(bmi);

  const copyPromptToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedPrompt);
      alert('Prompt copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy prompt:', err);
      alert('Failed to copy prompt. Please copy manually.');
    }
  };

  return (
    <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <p className="mt-2 text-gray-600">Manage your personal information and preferences</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center">
              <div className="relative inline-block">
                <div
                  className={`w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold text-white ${
                    profile.profileImage ? 'bg-cover bg-center' : 'bg-gradient-to-r from-blue-500 to-purple-600'
                  } ${isEditing ? 'cursor-pointer hover:opacity-80' : ''}`}
                  style={profile.profileImage ? { backgroundImage: `url(${profile.profileImage})` } : {}}
                  onClick={handleImageClick}
                >
                  {!profile.profileImage && (profile.username?.charAt(0)?.toUpperCase() || 'U')}
                </div>
                {isEditing && (
                  <div className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-1">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </div>
                )}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
              <h2 className="text-xl font-semibold text-gray-900">{profile.username}</h2>
              <p className="text-gray-600">{profile.age} years old</p>
            </div>

            {/* BMI Card */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">BMI Information</h3>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{bmi}</div>
                <div className={`text-sm font-medium ${bmiInfo.color}`}>{bmiInfo.category}</div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="mt-6 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Height:</span>
                <span className="font-medium">{profile.height} cm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Weight:</span>
                <span className="font-medium">{profile.weight} kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Goal:</span>
                <span className="font-medium">{profile.fitnessGoal}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Edit Profile
                </button>
              ) : (
                <div className="space-x-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={profile.username}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Age
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={profile.age}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={profile.gender}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    name="height"
                    value={profile.height}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    name="weight"
                    value={profile.weight}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fitness Goal
                  </label>
                  <select
                    name="fitnessGoal"
                    value={profile.fitnessGoal}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  >
                    {fitnessGoalOptions.map((goal) => (
                      <option key={goal} value={goal}>
                        {goal}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Health Conditions
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {healthConditionOptions.map((condition) => (
                    <label key={condition} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={profile.healthConditions.includes(condition)}
                        onChange={() => handleHealthConditionChange(condition)}
                        disabled={!isEditing}
                        className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                      />
                      <span className="text-sm text-gray-700">{condition}</span>
                    </label>
                  ))}
                </div>
              </div>

              {isEditing && (
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Prompt Modal */}
      {showPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                Generated {promptType.charAt(0).toUpperCase() + promptType.slice(1)} Prompt
              </h3>
              <button
                onClick={() => setShowPrompt(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <pre className="whitespace-pre-wrap text-sm">{generatedPrompt}</pre>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={copyPromptToClipboard}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Copy to Clipboard
              </button>
              <button
                onClick={() => setShowPrompt(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
} 
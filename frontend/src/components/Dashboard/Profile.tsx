import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getOpenAIKey, setOpenAIKey } from '../../config/api';

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

export default function Profile() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, logout, updateProfile } = useAuth();
  
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
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [promptType, setPromptType] = useState<'diet' | 'workout' | 'general'>('general');
  const [apiKey, setApiKey] = useState(getOpenAIKey());
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);

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

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
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

  const generatePersonalizedPrompt = (type: 'diet' | 'workout' | 'general') => {
    const healthConditionsText = profile.healthConditions.length > 0 && !profile.healthConditions.includes('None') 
      ? profile.healthConditions.join(', ') 
      : 'no specific health conditions';
    
    let prompt = '';
    
    if (type === 'diet') {
      prompt = `Create a detailed daily diet plan for a ${profile.age}-year-old ${profile.gender} who is ${profile.height}cm tall and weighs ${profile.weight}kg (BMI: ${bmi} - ${bmiInfo.category}).

Their primary fitness goal is: ${profile.fitnessGoal}
Health considerations: ${healthConditionsText}

Please provide a structured daily meal plan with:
1. Breakfast (8:00 AM) - Include specific foods, portions, and calories
2. Lunch (12:00 PM) - Include specific foods, portions, and calories  
3. Dinner (6:00 PM) - Include specific foods, portions, and calories
4. 2 healthy snacks between meals
5. Daily water intake recommendations
6. Total daily calorie target and macro breakdown (protein, carbs, fats)
7. Special dietary considerations for their health conditions
8. Weekly meal prep suggestions

Format the response as a structured daily plan that can be easily followed. Consider their fitness goal of ${profile.fitnessGoal} when calculating nutritional needs.`;
    } else if (type === 'workout') {
      prompt = `Create a detailed weekly workout plan for a ${profile.age}-year-old ${profile.gender} who is ${profile.height}cm tall and weighs ${profile.weight}kg (BMI: ${bmi} - ${bmiInfo.category}).

Their primary fitness goal is: ${profile.fitnessGoal}
Health considerations: ${healthConditionsText}

Please provide a structured 6-day weekly workout schedule:
1. Monday - Specific exercises with sets, reps, and rest periods
2. Tuesday - Specific exercises with sets, reps, and rest periods
3. Wednesday - Specific exercises with sets, reps, and rest periods
4. Thursday - Specific exercises with sets, reps, and rest periods
5. Friday - Specific exercises with sets, reps, and rest periods
6. Saturday - Specific exercises with sets, reps, and rest periods
7. Sunday - Rest day with light activity suggestions

For each day, include:
- Warm-up routine (5-10 minutes)
- Main workout with specific exercises, sets, reps
- Cool-down and stretching routine
- Estimated workout duration
- Equipment needed (if any)
- Modifications for their fitness level and health conditions

Focus on exercises that support their goal of ${profile.fitnessGoal} while considering their health conditions.`;
    } else {
      prompt = `Create a comprehensive fitness and nutrition plan for a ${profile.age}-year-old ${profile.gender} who is ${profile.height}cm tall and weighs ${profile.weight}kg (BMI: ${bmi} - ${bmiInfo.category}). 

Their primary fitness goal is: ${profile.fitnessGoal}
Health considerations: ${healthConditionsText}

Please provide:
1. A detailed weekly workout schedule with specific exercises, sets, and reps
2. Daily nutrition recommendations with calorie targets and macro breakdowns
3. Specific dietary suggestions considering their health conditions
4. Progress tracking milestones and realistic timeline expectations
5. Safety precautions and modifications based on their current fitness level

Make the plan practical, achievable, and tailored to their specific profile and goals.`;
    }

    setGeneratedPrompt(prompt);
    setPromptType(type);
    setShowPrompt(true);
  };

  const copyPromptToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedPrompt);
      // You could add a toast notification here
      alert('Prompt copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy prompt:', err);
      alert('Failed to copy prompt. Please copy manually.');
    }
  };

  const saveApiKey = () => {
    setOpenAIKey(apiKey);
    setShowApiKeyInput(false);
    alert('OpenAI API Key saved successfully!');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="bg-gray-900 p-4 flex justify-between items-center md:hidden">
        <h1 className="text-xl font-bold text-white">Health Tracker</h1>
        <button className="text-white" onClick={toggleMobileMenu}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
      
      {/* Side Navigation */}
      <nav className={`w-64 bg-gray-900 min-h-screen p-4 flex flex-col ${isMobileMenuOpen ? 'block' : 'hidden'} md:block fixed md:relative z-50`}>
        <div className="flex items-center mb-8">
          <h1 className="text-xl font-bold text-yellow-400">HEALTH TRACKER</h1>
        </div>
        
        {/* Navigation Links Container */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Main Navigation Links */}
          <div className="space-y-2 flex-grow-0">
            <Link
              to="/dashboard"
              className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${location.pathname === '/dashboard' ? 'bg-gray-800 text-yellow-400' : 'text-gray-300 hover:text-yellow-400'}`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              <span>Dashboard</span>
            </Link>
            <Link
              to="/dashboard/workout"
              className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${location.pathname === '/dashboard/workout' ? 'bg-gray-800 text-yellow-400' : 'text-gray-300 hover:text-yellow-400'}`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                <path fillRule="evenodd" d="M3 10a7 7 0 1114 0 7 7 0 01-14 0zm7-9a9 9 0 100 18 9 9 0 000-18z" clipRule="evenodd" />
              </svg>
              <span>Workout Plan</span>
            </Link>
            <Link
              to="/dashboard/diet"
              className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${location.pathname === '/dashboard/diet' ? 'bg-gray-800 text-yellow-400' : 'text-gray-300 hover:text-yellow-400'}`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
              </svg>
              <span>Diet Plan</span>
            </Link>
            <Link
              to="/dashboard/store"
              className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${location.pathname === '/dashboard/store' ? 'bg-gray-800 text-yellow-400' : 'text-gray-300 hover:text-yellow-400'}`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
              </svg>
              <span>Store</span>
            </Link>
            <Link
              to="/dashboard/profile"
              className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${location.pathname === '/dashboard/profile' ? 'bg-gray-800 text-yellow-400' : 'text-gray-300 hover:text-yellow-400'}`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              <span>Profile</span>
            </Link>
          </div>
          
          {/* Spacer to push logout to bottom */}
          <div className="flex-1"></div>
          
          {/* Logout Button - Always visible at bottom */}
          <div className="mt-auto py-4 border-t border-gray-800">          
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 p-3 rounded-lg transition-colors w-full text-left text-gray-300 hover:bg-gray-800 hover:text-yellow-400"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm3 6V7a1 1 0 012 0v2h2a1 1 0 110 2H8v2a1 1 0 11-2 0v-2H4a1 1 0 110-2h2z" clipRule="evenodd" />
              </svg>
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto max-h-screen">
        <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8 min-h-full">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 mb-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div 
                    className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center cursor-pointer overflow-hidden"
                    onClick={handleImageClick}
                  >
                    {profile.profileImage ? (
                      <img 
                        src={profile.profileImage} 
                        alt="Profile" 
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  {isEditing && (
                    <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1 cursor-pointer" onClick={handleImageClick}>
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{profile.username}</h1>
                  <p className="text-blue-100">Health Tracker Member</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => apiKey ? generatePersonalizedPrompt('diet') : alert('Please configure your OpenAI API key first')}
                  className={`px-3 py-2 rounded-lg transition-colors flex items-center space-x-2 text-sm ${
                    apiKey 
                      ? 'bg-green-500 bg-opacity-90 hover:bg-opacity-100' 
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                  disabled={!apiKey}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
                  </svg>
                  <span>Diet Plan</span>
                </button>
                <button
                  onClick={() => apiKey ? generatePersonalizedPrompt('workout') : alert('Please configure your OpenAI API key first')}
                  className={`px-3 py-2 rounded-lg transition-colors flex items-center space-x-2 text-sm ${
                    apiKey 
                      ? 'bg-blue-500 bg-opacity-90 hover:bg-opacity-100' 
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                  disabled={!apiKey}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Workout Plan</span>
                </button>
                <button
                  onClick={() => apiKey ? generatePersonalizedPrompt('general') : alert('Please configure your OpenAI API key first')}
                  className={`px-3 py-2 rounded-lg transition-colors flex items-center space-x-2 text-sm ${
                    apiKey 
                      ? 'bg-purple-500 bg-opacity-90 hover:bg-opacity-100' 
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                  disabled={!apiKey}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Full Plan</span>
                </button>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-colors"
                >
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </button>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Age</p>
                  <p className="text-lg font-semibold text-gray-900">{profile.age} years</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Height</p>
                  <p className="text-lg font-semibold text-gray-900">{profile.height} cm</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16l3-1m-3 1l-3-1" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Weight</p>
                  <p className="text-lg font-semibold text-gray-900">{profile.weight} kg</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">BMI</p>
                  <p className={`text-lg font-semibold ${bmiInfo.color}`}>{bmi}</p>
                  <p className={`text-xs ${bmiInfo.color}`}>{bmiInfo.category}</p>
                </div>
              </div>
            </div>
          </div>

          {/* API Configuration */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">AI Configuration</h2>
              <button
                onClick={() => setShowApiKeyInput(!showApiKeyInput)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                {apiKey ? 'Update API Key' : 'Add API Key'}
              </button>
            </div>
            
            {showApiKeyInput && (
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-2">
                  OpenAI API Key
                </label>
                <div className="flex space-x-3">
                  <input
                    type="password"
                    id="apiKey"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    onClick={saveApiKey}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    Save
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Your API key is stored locally and used to generate personalized plans. Get your key from{' '}
                  <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    OpenAI Platform
                  </a>
                </p>
              </div>
            )}
            
            <div className="flex items-center space-x-2 text-sm">
              <div className={`w-3 h-3 rounded-full ${apiKey ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className={apiKey ? 'text-green-700' : 'text-red-700'}>
                {apiKey ? 'API Key Configured' : 'API Key Required for AI Features'}
              </span>
            </div>
          </div>

          {/* Profile Details */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Profile Information</h2>
            
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={profile.username}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                    !isEditing ? 'bg-gray-50 text-gray-600' : 'bg-white text-gray-900'
                  }`}
                />
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                  <input
                    type="number"
                    id="age"
                    name="age"
                    value={profile.age}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                      !isEditing ? 'bg-gray-50 text-gray-600' : 'bg-white text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                  <select
                    id="gender"
                    name="gender"
                    value={profile.gender}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                      !isEditing ? 'bg-gray-50 text-gray-600' : 'bg-white text-gray-900'
                    }`}
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-2">Height (cm)</label>
                  <input
                    type="number"
                    id="height"
                    name="height"
                    value={profile.height}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                      !isEditing ? 'bg-gray-50 text-gray-600' : 'bg-white text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
                  <input
                    type="number"
                    id="weight"
                    name="weight"
                    value={profile.weight}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                      !isEditing ? 'bg-gray-50 text-gray-600' : 'bg-white text-gray-900'
                    }`}
                  />
                </div>
              </div>

              {/* Health Conditions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Health Conditions</label>
                <div className="grid grid-cols-2 gap-4">
                  {healthConditionOptions.map(condition => (
                    <label key={condition} className={`flex items-center p-3 border rounded-lg transition-colors cursor-pointer ${
                      !isEditing ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-300 hover:bg-gray-50'
                    }`}>
                      <input
                        type="checkbox"
                        checked={profile.healthConditions.includes(condition)}
                        onChange={() => isEditing && handleHealthConditionChange(condition)}
                        disabled={!isEditing}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <span className={`ml-3 text-sm ${!isEditing ? 'text-gray-600' : 'text-gray-700'}`}>{condition}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Fitness Goal */}
              <div>
                <label htmlFor="fitnessGoal" className="block text-sm font-medium text-gray-700 mb-2">Fitness Goal</label>
                <select
                  id="fitnessGoal"
                  name="fitnessGoal"
                  value={profile.fitnessGoal}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                    !isEditing ? 'bg-gray-50 text-gray-600' : 'bg-white text-gray-900'
                  }`}
                >
                  {fitnessGoalOptions.map(goal => (
                    <option key={goal} value={goal}>{goal}</option>
                  ))}
                </select>
              </div>

              {isEditing && (
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Prompt Modal */}
          {showPrompt && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Your Personalized {promptType === 'diet' ? 'Diet Plan' : promptType === 'workout' ? 'Workout Plan' : 'Fitness'} Prompt
                  </h3>
                  <button
                    onClick={() => setShowPrompt(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="p-6 overflow-y-auto max-h-[60vh]">
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <p className="text-sm text-gray-600 mb-2">
                      This prompt is generated based on your profile information. You can copy it and use it with AI assistants like ChatGPT, Claude, or other fitness AI tools.
                    </p>
                  </div>
                  
                  <textarea
                    value={generatedPrompt}
                    readOnly
                    className="w-full h-64 p-4 border border-gray-300 rounded-lg bg-white text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Your personalized prompt will appear here..."
                  />
                </div>
                
                <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
                  <div className="text-sm text-gray-500">
                    Prompt generated based on your current profile data
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => setShowPrompt(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                    >
                      Close
                    </button>
                    <button
                      onClick={copyPromptToClipboard}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors flex items-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <span>Copy Prompt</span>
                    </button>
                    {(promptType === 'diet' || promptType === 'workout') && (
                      <button
                        onClick={() => {
                          // Navigate to the respective page and trigger AI generation
                          if (promptType === 'diet') {
                            navigate('/dashboard/diet', { state: { generateAI: true, prompt: generatedPrompt } });
                          } else {
                            navigate('/dashboard/workout', { state: { generateAI: true, prompt: generatedPrompt } });
                          }
                          setShowPrompt(false);
                        }}
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors flex items-center space-x-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span>Generate AI {promptType === 'diet' ? 'Diet' : 'Workout'} Plan</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
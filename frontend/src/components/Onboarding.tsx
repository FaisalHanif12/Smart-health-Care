import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface UserProfile {
  age: string;
  gender: string;
  height: string;
  weight: string;
  healthConditions: string[];
  fitnessGoal: string;
}

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<UserProfile>({
    age: '',
    gender: '',
    height: '',
    weight: '',
    healthConditions: [],
    fitnessGoal: ''
  });

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // For now, just log the data and navigate to dashboard
    console.log('Profile data:', profile);
    navigate('/dashboard');
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[url('/Gym.jpg')] bg-cover bg-center bg-no-repeat">
      <div className="max-w-md w-full space-y-8 p-8 bg-white/30 backdrop-blur-md rounded-xl shadow-lg border border-white/20">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">Complete Your Profile</h2>
          <p className="mt-2 text-gray-600">Step {step} of 3</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label htmlFor="age" className="block text-sm font-medium text-gray-700">Age</label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  value={profile.age}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Gender</label>
                <select
                  id="gender"
                  name="gender"
                  value={profile.gender}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label htmlFor="height" className="block text-sm font-medium text-gray-700">Height (cm)</label>
                <input
                  type="number"
                  id="height"
                  name="height"
                  value={profile.height}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="weight" className="block text-sm font-medium text-gray-700">Weight (kg)</label>
                <input
                  type="number"
                  id="weight"
                  name="weight"
                  value={profile.weight}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Health Conditions</label>
                <div className="space-y-2">
                  {healthConditionOptions.map(condition => (
                    <label key={condition} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={profile.healthConditions.includes(condition)}
                        onChange={() => handleHealthConditionChange(condition)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-gray-700">{condition}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label htmlFor="fitnessGoal" className="block text-sm font-medium text-gray-700">Fitness Goal</label>
                <select
                  id="fitnessGoal"
                  name="fitnessGoal"
                  value={profile.fitnessGoal}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  <option value="">Select your goal</option>
                  {fitnessGoalOptions.map(goal => (
                    <option key={goal} value={goal}>{goal}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="flex justify-between">
            {step > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Previous
              </button>
            )}
            {step < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Complete Profile
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
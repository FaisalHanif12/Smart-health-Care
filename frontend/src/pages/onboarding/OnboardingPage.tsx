import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const OnboardingPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    height: '',
    weight: '',
    healthConditions: [] as string[],
    goal: ''
  });

  const healthConditionOptions = [
    'None',
    'Diabetes',
    'Hypertension',
    'PCOS',
    'Heart Disease',
    'Thyroid Issues'
  ];

  const goalOptions = [
    { id: 'muscle_building', label: 'Muscle Building' },
    { id: 'fat_burning', label: 'Fat Burning' },
    { id: 'weight_gain', label: 'Weight Gain' },
    { id: 'general_fitness', label: 'General Fitness' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleHealthConditionChange = (condition: string) => {
    setFormData(prev => {
      if (condition === 'None') {
        return { ...prev, healthConditions: [] };
      }
      
      // If already selected, remove it
      if (prev.healthConditions.includes(condition)) {
        return {
          ...prev,
          healthConditions: prev.healthConditions.filter(c => c !== condition)
        };
      }
      
      // Otherwise add it
      return {
        ...prev,
        healthConditions: [...prev.healthConditions, condition]
      };
    });
  };

  const handleGoalSelect = (goalId: string) => {
    setFormData(prev => ({
      ...prev,
      goal: goalId
    }));
  };

  const nextStep = () => {
    setStep(prev => prev + 1);
  };

  const prevStep = () => {
    setStep(prev => prev - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, we would send this data to the backend
    console.log('Submitting onboarding data:', formData);
    
    // For now, just navigate to the dashboard
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900">
      <div className="w-full max-w-md p-8 space-y-8 bg-black/20 backdrop-blur-sm rounded-xl border border-white/10 shadow-xl">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Let's Get Started</h2>
          <p className="text-white/70">Step {step} of 3</p>
          
          {/* Progress bar */}
          <div className="w-full bg-white/10 rounded-full h-2.5 my-4">
              <div 
              className="bg-slate-500 h-2.5 rounded-full transition-all duration-300" 
              style={{ width: `${(step / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label htmlFor="age" className="block text-sm font-medium text-white mb-1">Age</label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  required
                  min="12"
                  max="100"
                  value={formData.age}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-md text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-slate-500"
                />
              </div>
              
              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-white mb-1">Gender</label>
                <select
                  id="gender"
                  name="gender"
                  required
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-md text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-slate-500"
                >
                  <option value="" disabled>Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div className="flex justify-end mt-6">
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400 transition-colors duration-200"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Body Measurements */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label htmlFor="height" className="block text-sm font-medium text-white mb-1">Height (cm)</label>
                <input
                  type="number"
                  id="height"
                  name="height"
                  required
                  min="100"
                  max="250"
                  value={formData.height}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-md text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-slate-500"
                />
              </div>
              
              <div>
                <label htmlFor="weight" className="block text-sm font-medium text-white mb-1">Weight (kg)</label>
                <input
                  type="number"
                  id="weight"
                  name="weight"
                  required
                  min="30"
                  max="200"
                  value={formData.weight}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-md text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-slate-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">Health Conditions</label>
                <div className="grid grid-cols-2 gap-2">
                  {healthConditionOptions.map(condition => (
                    <div 
                      key={condition}
                      onClick={() => handleHealthConditionChange(condition)}
                      className={`px-3 py-2 border rounded-md cursor-pointer transition-colors duration-200 ${
                        condition === 'None' && formData.healthConditions.length === 0 || 
                        formData.healthConditions.includes(condition)
                          ? 'bg-slate-600 border-slate-700 text-white'
                          : 'bg-white/10 border-white/30 text-white hover:bg-white/20'
                      }`}
                    >
                      {condition}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-between mt-6">
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-6 py-2 bg-white/10 text-white rounded-md hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 transition-colors duration-200"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400 transition-colors duration-200"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Fitness Goals */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Select Your Goal</label>
                <div className="grid grid-cols-1 gap-3">
                  {goalOptions.map(goal => (
                    <div 
                      key={goal.id}
                      onClick={() => handleGoalSelect(goal.id)}
                      className={`p-4 border rounded-md cursor-pointer transition-colors duration-200 ${
                        formData.goal === goal.id
                          ? 'bg-slate-600 border-slate-700 text-white'
                          : 'bg-white/10 border-white/30 text-white hover:bg-white/20'
                      }`}
                    >
                      <h3 className="font-medium">{goal.label}</h3>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-between mt-6">
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-6 py-2 bg-white/10 text-white rounded-md hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 transition-colors duration-200"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400 transition-colors duration-200"
                >
                  Complete
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default OnboardingPage;
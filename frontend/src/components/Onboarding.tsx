import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface UserProfile {
  age: string;
  gender: string;
  height: string;
  weight: string;
  healthConditions: string[];
  fitnessGoal: string;
}

interface ValidationErrors {
  age?: string;
  gender?: string;
  height?: string;
  weight?: string;
  healthConditions?: string;
  fitnessGoal?: string;
}

export default function Onboarding() {
  const navigate = useNavigate();
  const { updateProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [profile, setProfile] = useState<UserProfile>({
    age: '',
    gender: '',
    height: '',
    weight: '',
    healthConditions: [],
    fitnessGoal: ''
  });

  const healthConditionOptions = ['Diabetes', 'PCOS', 'High Blood Pressure', 'Heart Disease', 'Thyroid Issues', 'None'];
  const fitnessGoalOptions = ['Muscle Building', 'Fat Burning', 'Weight Gain', 'General Fitness', 'Endurance Training', 'Strength Training'];

  const setFieldError = (field: keyof ValidationErrors, message?: string) => {
    setValidationErrors(prev => ({
      ...prev,
      [field]: message
    }));
  };

  const validateField = (field: keyof UserProfile): boolean => {
    // Validate individual fields so we can show errors onBlur / onChange
    if (field === 'age') {
      if (!profile.age.trim()) {
        setFieldError('age', 'Age is required (13–120).');
        return false;
      }
      const ageNum = parseInt(profile.age, 10);
      if (Number.isNaN(ageNum) || ageNum < 13 || ageNum > 120) {
        setFieldError('age', 'Please enter a valid age between 13 and 120.');
        return false;
      }
      setFieldError('age', undefined);
      return true;
    }

    if (field === 'gender') {
      const allowed = new Set(['male', 'female', 'other']);
      if (!profile.gender) {
        setFieldError('gender', 'Please select your gender.');
        return false;
      }
      if (!allowed.has(profile.gender)) {
        setFieldError('gender', 'Invalid gender selection. Please choose from the list.');
        return false;
      }
      setFieldError('gender', undefined);
      return true;
    }

    if (field === 'height') {
      if (!profile.height.trim()) {
        setFieldError('height', 'Height is required (100–250 cm).');
        return false;
      }
      const heightNum = parseFloat(profile.height);
      if (Number.isNaN(heightNum) || heightNum < 100 || heightNum > 250) {
        setFieldError('height', 'Please enter a valid height between 100 and 250 cm.');
        return false;
      }
      setFieldError('height', undefined);
      return true;
    }

    if (field === 'weight') {
      if (!profile.weight.trim()) {
        setFieldError('weight', 'Weight is required (30–300 kg).');
        return false;
      }
      const weightNum = parseFloat(profile.weight);
      if (Number.isNaN(weightNum) || weightNum < 30 || weightNum > 300) {
        setFieldError('weight', 'Please enter a valid weight between 30 and 300 kg.');
        return false;
      }
      setFieldError('weight', undefined);
      return true;
    }

    if (field === 'healthConditions') {
      if (profile.healthConditions.length === 0) {
        setFieldError('healthConditions', 'Select at least one option (choose "None" if you have no conditions).');
        return false;
      }
      if (profile.healthConditions.includes('None') && profile.healthConditions.length > 1) {
        setFieldError('healthConditions', 'If you select "None", you cannot select any other condition.');
        return false;
      }
      setFieldError('healthConditions', undefined);
      return true;
    }

    if (field === 'fitnessGoal') {
      if (!profile.fitnessGoal) {
        setFieldError('fitnessGoal', 'Please select your fitness goal.');
        return false;
      }
      if (!fitnessGoalOptions.includes(profile.fitnessGoal)) {
        setFieldError('fitnessGoal', 'Invalid goal selection. Please choose from the list.');
        return false;
      }
      setFieldError('fitnessGoal', undefined);
      return true;
    }

    return true;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Clear validation error for this field when user starts typing
    if (validationErrors[name as keyof ValidationErrors]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
    
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleHealthConditionChange = (condition: string) => {
    // Clear validation error when user selects something
    if (validationErrors.healthConditions) {
      setValidationErrors(prev => ({
        ...prev,
        healthConditions: undefined
      }));
    }

    setProfile(prev => {
      const currentlySelected = prev.healthConditions;

      // Toggle off
      if (currentlySelected.includes(condition)) {
        return { ...prev, healthConditions: currentlySelected.filter(c => c !== condition) };
      }

      // Enforce exclusive "None" selection
      if (condition === 'None') {
        return { ...prev, healthConditions: ['None'] };
      }

      // Selecting any real condition should remove "None" if it was selected
      const withoutNone = currentlySelected.filter(c => c !== 'None');
      return { ...prev, healthConditions: [...withoutNone, condition] };
    });

    // Re-validate after change so the user gets immediate feedback
    setTimeout(() => validateField('healthConditions'), 0);
  };

  const validateStep = (stepNumber: number): boolean => {
    const errors: ValidationErrors = {};
    let isValid = true;

    if (stepNumber === 1) {
      // Validate age
      if (!validateField('age')) isValid = false;
      if (validationErrors.age) errors.age = validationErrors.age;

      // Validate gender
      if (!validateField('gender')) isValid = false;
      if (validationErrors.gender) errors.gender = validationErrors.gender;
    }

    if (stepNumber === 2) {
      // Validate height
      if (!validateField('height')) isValid = false;
      if (validationErrors.height) errors.height = validationErrors.height;

      // Validate weight
      if (!validateField('weight')) isValid = false;
      if (validationErrors.weight) errors.weight = validationErrors.weight;
    }

    if (stepNumber === 3) {
      // Validate health conditions
      if (!validateField('healthConditions')) isValid = false;
      if (validationErrors.healthConditions) errors.healthConditions = validationErrors.healthConditions;

      // Validate fitness goal
      if (!validateField('fitnessGoal')) isValid = false;
      if (validationErrors.fitnessGoal) errors.fitnessGoal = validationErrors.fitnessGoal;
    }

    setValidationErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all steps before submitting
    const step1Valid = validateStep(1);
    const step2Valid = validateStep(2);
    const step3Valid = validateStep(3);
    
    if (!step1Valid || !step2Valid || !step3Valid) {
      setError('Please fill all required fields correctly');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Convert string values to numbers for backend
      const profileData = {
        age: parseInt(profile.age),
        gender: profile.gender,
        height: parseFloat(profile.height),
        weight: parseFloat(profile.weight),
        healthConditions: profile.healthConditions,
        fitnessGoal: profile.fitnessGoal
      };

      await updateProfile(profileData);
      
      // Set profile completion flag
      localStorage.setItem('userProfileComplete', 'true');
      
      // Navigate to dashboard and prevent going back to onboarding
      navigate('/dashboard', { replace: true });
    } catch (error: any) {
      console.error('Error saving profile:', error);
      setError(error.message || 'Failed to save profile. Please try again.');
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    // Validate current step before proceeding
    if (validateStep(step)) {
      setStep(prev => prev + 1);
      setError(''); // Clear any general errors
    }
  };
  
  const prevStep = () => {
    setStep(prev => prev - 1);
    setError(''); // Clear any general errors
    setValidationErrors({}); // Clear validation errors when going back
  };

  const renderFieldError = (fieldName: keyof ValidationErrors) => {
    const error = validationErrors[fieldName];
    if (error) {
      return (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      );
    }
    return null;
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center auth-background">
      <div className="max-w-md w-full space-y-8 p-8 bg-white/30 dark:bg-gray-900/80 backdrop-blur-md rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Complete Your Profile</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Step {step} of 3</p>
          
          {/* Progress bar */}
          <div className="mt-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label htmlFor="age" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Age <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  value={profile.age}
                  onChange={handleInputChange}
                  onBlur={() => validateField('age')}
                  min="13"
                  max="120"
                  placeholder="Enter your age"
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                    validationErrors.age ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                {renderFieldError('age')}
              </div>
              
              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={profile.gender}
                  onChange={handleInputChange}
                  onBlur={() => validateField('gender')}
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    validationErrors.gender ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                  }`}
                >
                  <option value="">Select your gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                {renderFieldError('gender')}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label htmlFor="height" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Height (cm) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="height"
                  name="height"
                  value={profile.height}
                  onChange={handleInputChange}
                  onBlur={() => validateField('height')}
                  min="100"
                  max="250"
                  step="0.1"
                  placeholder="e.g., 175.5"
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                    validationErrors.height ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Enter height in centimeters (e.g., 175.5 cm)</p>
                {renderFieldError('height')}
              </div>
              
              <div>
                <label htmlFor="weight" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Weight (kg) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="weight"
                  name="weight"
                  value={profile.weight}
                  onChange={handleInputChange}
                  onBlur={() => validateField('weight')}
                  min="30"
                  max="300"
                  step="0.1"
                  placeholder="e.g., 70.5"
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                    validationErrors.weight ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Enter weight in kilograms (e.g., 70.5 kg)</p>
                {renderFieldError('weight')}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Health Conditions <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {healthConditionOptions.map(condition => (
                    <label key={condition} className="flex items-center p-2 hover:bg-white/20 dark:hover:bg-gray-700/30 rounded transition-colors">
                      <input
                        type="checkbox"
                        checked={profile.healthConditions.includes(condition)}
                        onChange={() => handleHealthConditionChange(condition)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded"
                      />
                      <span className="ml-2 text-gray-700 dark:text-gray-300">{condition}</span>
                    </label>
                  ))}
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Select all that apply. Choose "None" if no conditions apply.</p>
                {renderFieldError('healthConditions')}
              </div>
              
              <div>
                <label htmlFor="fitnessGoal" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Fitness Goal <span className="text-red-500">*</span>
                </label>
                <select
                  id="fitnessGoal"
                  name="fitnessGoal"
                  value={profile.fitnessGoal}
                  onChange={handleInputChange}
                  onBlur={() => validateField('fitnessGoal')}
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    validationErrors.fitnessGoal ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                  }`}
                >
                  <option value="">Select your primary goal</option>
                  {fitnessGoalOptions.map(goal => (
                    <option key={goal} value={goal}>{goal}</option>
                  ))}
                </select>
                {renderFieldError('fitnessGoal')}
              </div>
            </div>
          )}

          <div className="flex justify-between pt-4">
            {step > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="inline-flex items-center justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </button>
            )}
            
            <div className="flex-1"></div>
            
            {step < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                className="inline-flex items-center justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                Next
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ) : (
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving Profile...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Complete Profile
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
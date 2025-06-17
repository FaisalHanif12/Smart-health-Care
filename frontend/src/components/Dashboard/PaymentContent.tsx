import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface PaymentFormData {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
  email: string;
  billingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

interface FormErrors {
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
  cardholderName?: string;
  email?: string;
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

export default function PaymentContent() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<PaymentFormData>({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    email: '',
    billingAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'US'
    }
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [cartTotal, setCartTotal] = useState(0);

  useEffect(() => {
    // Load cart data
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      const cart = JSON.parse(savedCart);
      // In a real app, you'd fetch product details from an API
      // For now, we'll calculate a simple total
      setCartItems(cart);
      setCartTotal(cart.length * 10); // Simplified calculation
    }
  }, []);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Card number validation (simplified)
    if (!formData.cardNumber.replace(/\s/g, '')) {
      newErrors.cardNumber = 'Card number is required';
    } else if (formData.cardNumber.replace(/\s/g, '').length < 16) {
      newErrors.cardNumber = 'Card number must be 16 digits';
    }

    // Expiry date validation
    if (!formData.expiryDate) {
      newErrors.expiryDate = 'Expiry date is required';
    } else if (!/^\d{2}\/\d{2}$/.test(formData.expiryDate)) {
      newErrors.expiryDate = 'Invalid format (MM/YY)';
    }

    // CVV validation
    if (!formData.cvv) {
      newErrors.cvv = 'CVV is required';
    } else if (formData.cvv.length < 3) {
      newErrors.cvv = 'CVV must be 3-4 digits';
    }

    // Cardholder name validation
    if (!formData.cardholderName.trim()) {
      newErrors.cardholderName = 'Cardholder name is required';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    // Billing address validation
    if (!formData.billingAddress.street.trim()) {
      newErrors.street = 'Street address is required';
    }
    if (!formData.billingAddress.city.trim()) {
      newErrors.city = 'City is required';
    }
    if (!formData.billingAddress.state.trim()) {
      newErrors.state = 'State is required';
    }
    if (!formData.billingAddress.zipCode.trim()) {
      newErrors.zipCode = 'ZIP code is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('billingAddress.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        billingAddress: {
          ...prev.billingAddress,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const formatCardNumber = (value: string) => {
    // Remove all spaces and non-digits
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    
    // Add space every 4 digits
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setFormData(prev => ({ ...prev, cardNumber: formatted }));
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    setFormData(prev => ({ ...prev, expiryDate: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Clear cart
      localStorage.removeItem('cart');
      
      // Navigate to success page
      navigate('/dashboard/payment-success');
    } catch (error) {
      console.error('Payment failed:', error);
      // Handle error
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8 min-h-full">
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <div className="flex items-center mb-6">
          <Link to="/dashboard/cart" className="mr-4 text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h2 className="text-2xl font-bold text-gray-900">Payment Details</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payment Form */}
          <div>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Card Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Card Information</h3>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700">
                      Card Number
                    </label>
                    <input
                      type="text"
                      id="cardNumber"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleCardNumberChange}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                        errors.cardNumber ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors.cardNumber && (
                      <p className="mt-1 text-sm text-red-600">{errors.cardNumber}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        id="expiryDate"
                        name="expiryDate"
                        value={formData.expiryDate}
                        onChange={handleExpiryChange}
                        placeholder="MM/YY"
                        maxLength={5}
                        className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                          errors.expiryDate ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {errors.expiryDate && (
                        <p className="mt-1 text-sm text-red-600">{errors.expiryDate}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="cvv" className="block text-sm font-medium text-gray-700">
                        CVV
                      </label>
                      <input
                        type="text"
                        id="cvv"
                        name="cvv"
                        value={formData.cvv}
                        onChange={handleInputChange}
                        placeholder="123"
                        maxLength={4}
                        className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                          errors.cvv ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {errors.cvv && (
                        <p className="mt-1 text-sm text-red-600">{errors.cvv}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="cardholderName" className="block text-sm font-medium text-gray-700">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      id="cardholderName"
                      name="cardholderName"
                      value={formData.cardholderName}
                      onChange={handleInputChange}
                      placeholder="John Doe"
                      className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                        errors.cardholderName ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors.cardholderName && (
                      <p className="mt-1 text-sm text-red-600">{errors.cardholderName}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="john@example.com"
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>
              </div>

              {/* Billing Address */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Billing Address</h3>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="billingAddress.street" className="block text-sm font-medium text-gray-700">
                      Street Address
                    </label>
                    <input
                      type="text"
                      id="billingAddress.street"
                      name="billingAddress.street"
                      value={formData.billingAddress.street}
                      onChange={handleInputChange}
                      placeholder="123 Main St"
                      className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                        errors.street ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors.street && (
                      <p className="mt-1 text-sm text-red-600">{errors.street}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="billingAddress.city" className="block text-sm font-medium text-gray-700">
                        City
                      </label>
                      <input
                        type="text"
                        id="billingAddress.city"
                        name="billingAddress.city"
                        value={formData.billingAddress.city}
                        onChange={handleInputChange}
                        placeholder="New York"
                        className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                          errors.city ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {errors.city && (
                        <p className="mt-1 text-sm text-red-600">{errors.city}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="billingAddress.state" className="block text-sm font-medium text-gray-700">
                        State
                      </label>
                      <input
                        type="text"
                        id="billingAddress.state"
                        name="billingAddress.state"
                        value={formData.billingAddress.state}
                        onChange={handleInputChange}
                        placeholder="NY"
                        className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                          errors.state ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {errors.state && (
                        <p className="mt-1 text-sm text-red-600">{errors.state}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="billingAddress.zipCode" className="block text-sm font-medium text-gray-700">
                        ZIP Code
                      </label>
                      <input
                        type="text"
                        id="billingAddress.zipCode"
                        name="billingAddress.zipCode"
                        value={formData.billingAddress.zipCode}
                        onChange={handleInputChange}
                        placeholder="10001"
                        className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                          errors.zipCode ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {errors.zipCode && (
                        <p className="mt-1 text-sm text-red-600">{errors.zipCode}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="billingAddress.country" className="block text-sm font-medium text-gray-700">
                        Country
                      </label>
                      <select
                        id="billingAddress.country"
                        name="billingAddress.country"
                        value={formData.billingAddress.country}
                        onChange={handleInputChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="US">United States</option>
                        <option value="CA">Canada</option>
                        <option value="UK">United Kingdom</option>
                        <option value="AU">Australia</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  `Complete Payment ($${cartTotal.toFixed(2)})`
                )}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Items ({cartItems.length})</span>
                  <span className="font-medium">${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">Free</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">${(cartTotal * 0.08).toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-medium text-gray-900">Total</span>
                    <span className="text-lg font-bold text-indigo-600">${(cartTotal * 1.08).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex">
                  <svg className="flex-shrink-0 w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      Your payment information is secure and encrypted.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 
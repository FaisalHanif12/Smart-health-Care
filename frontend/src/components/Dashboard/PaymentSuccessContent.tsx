import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function PaymentSuccessContent() {
  const location = useLocation();
  const [showConfetti, setShowConfetti] = useState(true);

  // Get order details from navigation state
  const orderDetails = location.state || {
    orderTotal: 0,
    email: '',
    cardLast4: ''
  };

  useEffect(() => {
    // Hide confetti after 3 seconds
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // Generate a random order number
  const orderNumber = `HT${Date.now().toString().slice(-6)}`;

  return (
    <div className="relative">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <div className="confetti-container">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  backgroundColor: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'][Math.floor(Math.random() * 5)]
                }}
              />
            ))}
          </div>
        </div>
      )}

      <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8 min-h-full">
        <div className="text-center">
          {/* Success Icon */}
          <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-indigo-100 mb-8">
            <svg
              className="h-12 w-12 text-indigo-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          {/* Success Message */}
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Payment Successful! 🎉
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Thank you for your order! Your healthy food items are on their way.
          </p>

          {/* Order Details Card */}
          <div className="bg-white shadow-lg rounded-lg p-8 mb-8 max-w-md mx-auto">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Order Details</h2>
            
            <div className="space-y-4 text-left">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Order Number:</span>
                <span className="font-semibold text-gray-900">#{orderNumber}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Amount:</span>
                <span className="font-semibold text-gray-900">${(orderDetails.orderTotal * 1.08).toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Payment Method:</span>
                <span className="font-semibold text-gray-900">•••• {orderDetails.cardLast4}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Email:</span>
                <span className="font-semibold text-gray-900">{orderDetails.email}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Status:</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                  Confirmed
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
            <Link
              to="/dashboard/store"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Continue Shopping
            </Link>
            
            <Link
              to="/dashboard"
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Back to Dashboard
            </Link>
          </div>

          {/* Delivery Information */}
          <div className="mt-12 bg-indigo-50 rounded-lg p-6">
            <h3 className="text-lg font-medium text-indigo-900 mb-4">
              📦 What happens next?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-indigo-700">
              <div className="text-center">
                <div className="bg-indigo-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                  <span className="text-lg">📋</span>
                </div>
                <p className="font-medium">Order Processing</p>
                <p>We're preparing your healthy items</p>
              </div>
              <div className="text-center">
                <div className="bg-indigo-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                  <span className="text-lg">🚚</span>
                </div>
                <p className="font-medium">Shipping</p>
                <p>Your order will be shipped within 24 hours</p>
              </div>
              <div className="text-center">
                <div className="bg-indigo-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                  <span className="text-lg">📬</span>
                </div>
                <p className="font-medium">Delivery</p>
                <p>Expected delivery in 2-3 business days</p>
              </div>
            </div>
          </div>

          {/* Support Information */}
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Questions about your order? Contact our support team at{' '}
              <a href="mailto:support@healthtacker.com" className="text-indigo-600 hover:text-indigo-500">
                support@healthtacker.com
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
} 
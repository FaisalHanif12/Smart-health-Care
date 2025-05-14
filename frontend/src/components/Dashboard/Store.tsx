import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

interface Product {
  id: number;
  name: string;
  price: number;
  calories: number;
  protein: number;
  image: string;
  category: string;
}

export default function Store() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [products] = useState<Product[]>([
    {
      id: 1,
      name: 'Organic Eggs',
      price: 5.99,
      calories: 70,
      protein: 6,
      image: '🥚',
      category: 'Protein',
    },
    {
      id: 2,
      name: 'Greek Yogurt',
      price: 4.99,
      calories: 120,
      protein: 15,
      image: '🥛',
      category: 'Dairy',
    },
    {
      id: 3,
      name: 'Quinoa',
      price: 7.99,
      calories: 120,
      protein: 4,
      image: '🌾',
      category: 'Grains',
    },
    {
      id: 4,
      name: 'Almonds',
      price: 8.99,
      calories: 160,
      protein: 6,
      image: '🥜',
      category: 'Nuts',
    },
    {
      id: 5,
      name: 'Chicken Breast',
      price: 12.99,
      calories: 165,
      protein: 31,
      image: '🍗',
      category: 'Protein',
    },
    {
      id: 6,
      name: 'Avocado',
      price: 2.99,
      calories: 160,
      protein: 2,
      image: '🥑',
      category: 'Fruits',
    },
    {
      id: 7,
      name: 'Salmon Fillet',
      price: 15.99,
      calories: 208,
      protein: 22,
      image: '🐟',
      category: 'Protein',
    },
    {
      id: 8,
      name: 'Sweet Potato',
      price: 1.99,
      calories: 103,
      protein: 2,
      image: '🍠',
      category: 'Vegetables',
    },
  ]);

  const [cart, setCart] = useState<number[]>([]);

  const addToCart = (productId: number) => {
    setCart([...cart, productId]);
  };

  const removeFromCart = (productId: number) => {
    setCart(cart.filter(id => id !== productId));
  };

  const isInCart = (productId: number) => cart.includes(productId);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('userProfileComplete');
    localStorage.removeItem('userProfile');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row">
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
      <nav className={`w-64 bg-gray-900 min-h-screen p-4 ${isMobileMenuOpen ? 'block' : 'hidden'} md:block fixed md:relative z-50`}>
        <div className="flex items-center mb-8">
          <h1 className="text-xl font-bold text-yellow-400">HEALTH TRACKER</h1>
        </div>
        
        {/* Navigation Links */}
        <div className="mb-8 flex flex-col">
          <div className="space-y-2">
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
          </div>
          
          {/* Logout Button */}
          <div className="mt-auto pt-8">          
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 p-3 rounded-lg transition-colors w-full text-left text-gray-300 hover:bg-gray-800"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm1 2h10v10H4V5zm4 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto">
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Health Food Store</h2>
        <div className="relative">
          <span className="absolute -top-2 -right-2 bg-indigo-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
            {cart.length}
          </span>
          <button className="p-2 text-gray-500 hover:text-gray-700">
            <svg
              className="h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map(product => (
          <div key={product.id} className="bg-gray-50 rounded-lg p-4 flex flex-col">
            <div className="text-4xl mb-2">{product.image}</div>
            <h3 className="text-lg font-medium text-gray-900">{product.name}</h3>
            <div className="mt-2 text-sm text-gray-500">
              <p>{product.calories} calories</p>
              <p>{product.protein}g protein</p>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-lg font-medium text-gray-900">${product.price}</span>
              <button
                onClick={() =>
                  isInCart(product.id) ? removeFromCart(product.id) : addToCart(product.id)
                }
                className={`px-4 py-2 rounded-md text-sm font-medium ${isInCart(product.id)
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
              >
                {isInCart(product.id) ? 'Remove' : 'Add to Cart'}
              </button>
            </div>
          </div>
        ))}
      </div>
          </div>
        </main>
      </div>
    </div>
  );
}
import { useState, useEffect } from 'react';
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

export default function Cart() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<number[]>([]);
  const [cartProducts, setCartProducts] = useState<Product[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalCalories, setTotalCalories] = useState(0);
  const [totalProtein, setTotalProtein] = useState(0);

  useEffect(() => {
    // Load products data
    const loadProducts = () => {
      // In a real app, this would come from an API or context
      // For now, we'll use the same product data as in Store.tsx
      const productsList: Product[] = [
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
        {
          id: 9,
          name: 'Blueberries',
          price: 6.99,
          calories: 84,
          protein: 1,
          image: '🫐',
          category: 'Fruits',
        },
        {
          id: 10,
          name: 'Spinach',
          price: 3.49,
          calories: 23,
          protein: 3,
          image: '🥬',
          category: 'Vegetables',
        },
        {
          id: 11,
          name: 'Brown Rice',
          price: 4.99,
          calories: 111,
          protein: 3,
          image: '🍚',
          category: 'Grains',
        },
        {
          id: 12,
          name: 'Protein Powder',
          price: 24.99,
          calories: 120,
          protein: 25,
          image: '🥤',
          category: 'Supplements',
        },
        {
          id: 13,
          name: 'Chia Seeds',
          price: 9.99,
          calories: 137,
          protein: 4,
          image: '🌱',
          category: 'Seeds',
        },
        {
          id: 14,
          name: 'Kale',
          price: 2.99,
          calories: 33,
          protein: 3,
          image: '🥬',
          category: 'Vegetables',
        },
        {
          id: 15,
          name: 'Turkey Breast',
          price: 11.99,
          calories: 135,
          protein: 30,
          image: '🦃',
          category: 'Protein',
        },
        {
          id: 16,
          name: 'Coconut Oil',
          price: 13.99,
          calories: 121,
          protein: 0,
          image: '🥥',
          category: 'Oils',
        },
      ];
      setProducts(productsList);
    };

    // Load cart items from localStorage
    const loadCartItems = () => {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        setCartItems(parsedCart);
      }
    };

    loadProducts();
    loadCartItems();
  }, []);

  useEffect(() => {
    // Update cart products whenever cartItems changes
    const filteredProducts = products.filter(product => cartItems.includes(product.id));
    setCartProducts(filteredProducts);

    // Calculate totals
    let price = 0;
    let calories = 0;
    let protein = 0;

    filteredProducts.forEach(product => {
      price += product.price;
      calories += product.calories;
      protein += product.protein;
    });

    setTotalPrice(price);
    setTotalCalories(calories);
    setTotalProtein(protein);
    
    // Save total to localStorage for payment page
    localStorage.setItem('cartTotal', price.toString());
  }, [products, cartItems]);

  const removeFromCart = (productId: number) => {
    const newCart = cartItems.filter(id => id !== productId);
    setCartItems(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cart');
  };

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
      <nav className={`w-64 bg-gray-900 min-h-screen p-4 flex flex-col ${isMobileMenuOpen ? 'block' : 'hidden'} md:block fixed md:relative z-50`}>
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
            <Link
              to="/dashboard/cart"
              className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${location.pathname === '/dashboard/cart' ? 'bg-gray-800 text-yellow-400' : 'text-gray-300 hover:text-yellow-400'}`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
              </svg>
              <span>Cart</span>
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
              <h2 className="text-2xl font-bold text-gray-900">Your Cart</h2>
              {cartProducts.length > 0 && (
                <button
                  onClick={clearCart}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Clear Cart
                </button>
              )}
            </div>

            {cartProducts.length === 0 ? (
              <div className="text-center py-12">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-900">Your cart is empty</h3>
                <p className="mt-1 text-sm text-gray-500">Start adding some healthy items to your cart!</p>
                <div className="mt-6">
                  <Link
                    to="/dashboard/store"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <svg
                      className="-ml-1 mr-2 h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Continue Shopping
                  </Link>
                </div>
              </div>
            ) : (
              <div>
                <div className="mt-4 border-t border-gray-200 pt-4">
                  {cartProducts.map(product => (
                    <div key={product.id} className="flex items-center py-4 border-b">
                      <div className="text-4xl mr-4">{product.image}</div>
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900">{product.name}</h3>
                        <div className="mt-1 flex text-sm text-gray-500">
                          <p>{product.calories} calories</p>
                          <span className="mx-1">•</span>
                          <p>{product.protein}g protein</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-medium text-gray-900">${product.price.toFixed(2)}</p>
                        <button
                          onClick={() => removeFromCart(product.id)}
                          className="mt-1 text-sm font-medium text-red-600 hover:text-red-500"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 border-t border-gray-200 pt-8">
                  <div className="flex justify-between text-base font-medium text-gray-900">
                    <p>Subtotal</p>
                    <p>${totalPrice.toFixed(2)}</p>
                  </div>
                  <div className="mt-2 flex justify-between text-sm text-gray-500">
                    <p>Total Calories</p>
                    <p>{totalCalories} cal</p>
                  </div>
                  <div className="mt-1 flex justify-between text-sm text-gray-500">
                    <p>Total Protein</p>
                    <p>{totalProtein}g</p>
                  </div>
                  <div className="mt-6">
                    <Link
                      to="/dashboard/payment"
                      className="w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      Checkout
                    </Link>
                  </div>
                  <div className="mt-6 flex justify-center text-sm text-gray-500">
                    <p>
                      or{' '}
                      <Link
                        to="/dashboard/store"
                        className="text-indigo-600 font-medium hover:text-indigo-500"
                      >
                        Continue Shopping<span aria-hidden="true"> &rarr;</span>
                      </Link>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
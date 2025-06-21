import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface Product {
  id: number;
  name: string;
  price: number;
  calories: number;
  protein: number;
  image: string;
  category: string;
}

export default function StoreContent() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showMoreItems, setShowMoreItems] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  // Initial 12 products
  const initialProducts: Product[] = [
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
  ];

  // Additional 4 products that appear when "Load More" is clicked
  const additionalProducts: Product[] = [
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
      category: 'Supplements',
    },
  ];

  // Combine products based on showMoreItems state
  const [products] = useState<Product[]>(initialProducts);
  const allProducts = showMoreItems ? [...products, ...additionalProducts] : products;
  
  // Filter products by category
  const displayedProducts = selectedCategory === 'All' 
    ? allProducts 
    : allProducts.filter(product => product.category === selectedCategory);

  const [cart, setCart] = useState<number[]>(() => {
    if (!user?._id) return [];
    const savedCart = localStorage.getItem(`cart_${user._id}`);
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const addToCart = (productId: number) => {
    if (!user?._id) return;
    const newCart = [...cart, productId];
    setCart(newCart);
    localStorage.setItem(`cart_${user._id}`, JSON.stringify(newCart));
  };

  const removeFromCart = (productId: number) => {
    if (!user?._id) return;
    const newCart = cart.filter(id => id !== productId);
    setCart(newCart);
    localStorage.setItem(`cart_${user._id}`, JSON.stringify(newCart));
  };

  const isInCart = (productId: number) => cart.includes(productId);

  const handleLoadMore = () => {
    setShowMoreItems(true);
  };

  const handleViewCart = () => {
    navigate('/dashboard/cart');
  };

  const cartItemCount = cart.length;
  const cartTotal = cart.reduce((total, productId) => {
    const product = [...allProducts, ...additionalProducts].find(p => p.id === productId);
    return total + (product?.price || 0);
  }, 0);

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category);
  };

  return (
    <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 space-y-4 sm:space-y-0">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Healthy Food Store</h1>
          <p className="mt-2 text-gray-600 text-sm sm:text-base">Fresh, organic, and nutritious foods for your fitness journey</p>
        </div>
        
        {/* Cart Button */}
        <button
          onClick={handleViewCart}
          className="relative bg-green-600 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 w-full sm:w-auto"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
          </svg>
          <span className="text-sm sm:text-base">Cart ({cartItemCount})</span>
          {cartItemCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 sm:h-6 sm:w-6 flex items-center justify-center">
              {cartItemCount}
            </span>
          )}
        </button>
      </div>

      {/* Category Filter */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Shop by Category</h2>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          {['All', 'Protein', 'Dairy', 'Grains', 'Nuts', 'Fruits', 'Vegetables', 'Supplements'].map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryFilter(category)}
              className={`px-3 py-2 sm:px-4 sm:py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Cart Summary */}
      {cartItemCount > 0 && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
            <span className="text-green-800 text-sm sm:text-base">
              {cartItemCount} item{cartItemCount !== 1 ? 's' : ''} in cart
            </span>
            <span className="text-green-800 font-semibold text-sm sm:text-base">
              Total: ${cartTotal.toFixed(2)}
            </span>
          </div>
        </div>
      )}

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {displayedProducts.map((product) => (
          <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="p-4 sm:p-6">
              <div className="text-3xl sm:text-4xl mb-3 sm:mb-4 text-center">{product.image}</div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
              <p className="text-xs sm:text-sm text-gray-600 mb-2">{product.category}</p>
              
              <div className="space-y-1 text-xs sm:text-sm text-gray-600 mb-4">
                <div className="flex justify-between">
                  <span>Calories:</span>
                  <span>{product.calories}</span>
                </div>
                <div className="flex justify-between">
                  <span>Protein:</span>
                  <span>{product.protein}g</span>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
                <span className="text-lg sm:text-xl font-bold text-green-600">${product.price}</span>
                <button
                  onClick={() => isInCart(product.id) ? removeFromCart(product.id) : addToCart(product.id)}
                  className={`px-3 py-2 sm:px-4 sm:py-2 rounded-lg transition-colors text-sm sm:text-base w-full sm:w-auto ${
                    isInCart(product.id)
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {isInCart(product.id) ? 'Remove' : 'Add to Cart'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More Button */}
      {!showMoreItems && selectedCategory === 'All' && (
        <div className="text-center mt-6 sm:mt-8">
          <button
            onClick={handleLoadMore}
            className="bg-green-600 text-white px-6 py-2 sm:px-8 sm:py-3 rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base w-full sm:w-auto"
          >
            Load More Items
          </button>
        </div>
      )}

      {/* Results Info */}
      <div className="mt-6 sm:mt-8 text-center">
        <p className="text-gray-600 text-sm sm:text-base">
          {displayedProducts.length === 0 
            ? `No products found in "${selectedCategory}" category` 
            : `Showing ${displayedProducts.length} product${displayedProducts.length !== 1 ? 's' : ''} ${selectedCategory !== 'All' ? `in "${selectedCategory}" category` : ''}`
          }
        </p>
      </div>
    </main>
  );
} 
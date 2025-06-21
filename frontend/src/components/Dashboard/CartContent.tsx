import { useState, useEffect } from 'react';
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

export default function CartContent() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<number[]>([]);
  const [cartProducts, setCartProducts] = useState<Product[]>([]);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [totalCalories, setTotalCalories] = useState<number>(0);
  const [totalProtein, setTotalProtein] = useState<number>(0);

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
      if (!user?._id) return;
      const savedCart = localStorage.getItem(`cart_${user._id}`);
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        setCartItems(parsedCart);
      }
    };

    loadProducts();
    loadCartItems();
  }, [user]);

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
  }, [products, cartItems]);

  const removeFromCart = (productId: number) => {
    if (!user?._id) return;
    const newCart = cartItems.filter(id => id !== productId);
    setCartItems(newCart);
    localStorage.setItem(`cart_${user._id}`, JSON.stringify(newCart));
  };

  const clearCart = () => {
    if (!user?._id) return;
    setCartItems([]);
    localStorage.removeItem(`cart_${user._id}`);
  };

  const handleCheckout = () => {
    navigate('/dashboard/payment');
  };

  const handleContinueShopping = () => {
    navigate('/dashboard/store');
  };

  return (
    <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Your Cart</h1>
        {cartProducts.length > 0 && (
          <button
            onClick={clearCart}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Clear Cart
          </button>
        )}
      </div>

      {cartProducts.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.68 4.28a1 1 0 00.95 1.72h9.46a1 1 0 00.95-1.72L15 13H7z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Your cart is empty</h3>
          <p className="mt-1 text-sm text-gray-500">
            Start adding some healthy items to your cart!
          </p>
          <div className="mt-6">
            <button
              onClick={handleContinueShopping}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Cart Items ({cartProducts.length})
                </h3>
                <div className="space-y-4">
                  {cartProducts.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="text-3xl">{product.image}</div>
                        <div>
                          <h4 className="text-lg font-medium text-gray-900">{product.name}</h4>
                          <p className="text-sm text-gray-500">{product.category}</p>
                          <p className="text-sm text-gray-600">
                            {product.calories} calories • {product.protein}g protein
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-lg font-bold text-green-600">${product.price.toFixed(2)}</span>
                        <button
                          onClick={() => removeFromCart(product.id)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Subtotal
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Calories</span>
                    <span className="font-medium">{totalCalories} cal</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Protein</span>
                    <span className="font-medium">{totalProtein}g</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between">
                      <span className="text-lg font-medium text-gray-900">Total</span>
                      <span className="text-lg font-bold text-green-600">${totalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-6">
                  <button
                    onClick={handleCheckout}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Checkout
                  </button>
                </div>
                <div className="mt-3 text-center">
                  <button
                    onClick={handleContinueShopping}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    or Continue Shopping →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
} 
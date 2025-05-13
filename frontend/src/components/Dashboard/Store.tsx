import { useState } from 'react';

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

  return (
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
  );
}
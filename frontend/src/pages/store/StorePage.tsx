import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

type StoreItem = {
  id: number;
  name: string;
  price: string;
  image: string;
};

const StorePage = () => {    
  const navigate = useNavigate();
  
  const [storeItems] = useState<StoreItem[]>([
    { id: 1, name: 'Organic Eggs', price: '$3.99', image: '🥚' },
    { id: 2, name: 'Protein Powder', price: '$24.99', image: '💪' },
    { id: 3, name: 'Quinoa Pack', price: '$5.99', image: '🌾' },
    { id: 4, name: 'Avocados (3)', price: '$4.99', image: '🥑' }
  ]);

  const addToCart = (itemId: number) => {
    console.log(`Added item ${itemId} to cart`);
  };

  const markAsBought = (itemId: number) => {
    console.log(`Marked item ${itemId} as bought`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 p-8">
      <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-white/10 shadow-xl p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">Healthy Food Store</h1>
        
        <div className="grid grid-cols-2 gap-4">
          {storeItems.map(item => (
            <div key={item.id} className="bg-white/10 rounded-lg p-4">
              <div className="text-4xl mb-2">{item.image}</div>
              <h3 className="font-medium text-white">{item.name}</h3>
              <p className="text-white/70 mb-3">{item.price}</p>
              <div className="flex space-x-2">
                <button 
                  onClick={() => addToCart(item.id)}
                  className="px-3 py-1 bg-white/10 text-white rounded-md hover:bg-white/20 transition-colors duration-200"
                >
                  Add to Cart
                </button>
                <button 
                  onClick={() => markAsBought(item.id)}
                  className="px-3 py-1 bg-slate-600 text-white rounded-md hover:bg-slate-500 transition-colors duration-200"
                >
                  Mark Bought
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StorePage;
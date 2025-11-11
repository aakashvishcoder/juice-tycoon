import React from 'react';
import { FRUITS } from '../data';

export default function OrderCard({ order, customer, timeLeft }) {
  if (!order || !customer) return <div className="text-amber-600 text-center py-4">Getting order...</div>;

  const getTimeColor = () => {
    if (timeLeft <= 3) return "text-red-500 font-bold animate-pulse";
    if (timeLeft <= 7) return 'text-orange-500 font-bold';
    return 'time-green-600';
  };

  return (
    <div className={`${customer.color} rounded-xl p-3 shadow-md border-2 ${customer.id === 'critic' ? 'border-purple-500' : customer.id === 'hungry' ? 'border-yellow-500' : customer.id === 'rushed' ? 'border-blue-500' : 'border-gray-400'}`}>
      <div className="flex items-center mb-2">
        <span className="text-2xl mr-2">{customer.emoji}</span>
        <div>
          <div className="font-bold text-amber-900 text-sm">{customer.name} CUSTOMER</div>
          <div className="text-xs text-amber-700">Bonus: ×{customer.bonus}</div>
          <div className={`text-xs font-bold ${getTimeColor()}`}>
            ⏱️ {timeLeft}s left • -{customer.penalty} pts if late
          </div>
        </div>
      </div>
      <div className="font-bold text-amber-900 text-sm mb-2">"{order.name}"</div>
      <div className="flex flex-wrap gap-1 justify-center">
        {order.fruits.map(fruitId => {
          const fruit = FRUITS.find(f => f.id === fruitId);
          return (
            <div key={fruitId} className="bg-white bg-opacity-70 px-2 py-1 rounded-full text-xs flex items-center border border-amber-200">
              <span className="mr-1">{fruit?.emoji}</span>
              {fruit?.name}
            </div>
          );
        })}
      </div>
      <div className="mt-2 text-center font-bold text-amber-700 text-sm">
        +{Math.round(order.points * customer.bonus)} PTS
      </div>
    </div>
  );
};
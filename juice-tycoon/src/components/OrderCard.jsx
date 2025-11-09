import React from 'react';
import { FRUITS } from '../data'; 

export default function OrderCard({ order, customer }) {
  if (!order || !customer) return null;

  return (
    <div className={`${customer.color} rounded-2xl p-4 shadow-lg`}>
      <div className="flex items-center mb-3">
        <span className="text-3xl mr-3">{customer.emoji}</span>
        <div>
          <div className="font-bold text-lg">{customer.name}</div>
          <div className="text-sm opacity-75">Bonus: ×{customer.bonus}</div>
        </div>
      </div>
      <div className="font-bold text-lg mb-2">{order.name}</div>
      <div className="flex flex-wrap gap-1">
        {order.fruits.map(fruitId => {
          const fruit = FRUITS.find(f => f.id === fruitId);
          return (
            <span key={fruitId} className="bg-white bg-opacity-60 px-2 py-1 rounded-full text-sm flex items-center">
              <span className="mr-1">{fruit?.emoji}</span> {fruit?.name}
            </span>
          );
        })}
      </div>
      <div className="mt-2 text-right font-bold text-juice-orange">
        +{Math.round(order.points * customer.bonus)} PTS
      </div>
    </div>
  );
}
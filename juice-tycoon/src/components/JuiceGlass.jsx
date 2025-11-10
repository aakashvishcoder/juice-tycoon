// src/components/JuiceGlass.jsx
import { useState, useEffect } from 'react';

export default function JuiceGlass({ glass, onDrop, onSubmit, index }) {
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (glass?.shake) {
      setShake(true);
      const timer = setTimeout(() => setShake(false), 500);
      return () => clearTimeout(timer);
    }
  }, [glass?.shake]);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation(); // Stop bubbling
    onDrop(e, index);
  };

  if (!glass || !glass.fruits) {
    return (
      <div
        className="w-20 h-32 border-4 border-gray-800 rounded-b-lg bg-white flex items-end justify-center"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <span className="text-gray-500 text-xs">Empty</span>
      </div>
    );
  }

  const juiceColor = glass.fruits[0]?.color || "juice-brown";
  const juiceHeight = Math.min(100, 20 * glass.fruits.length);

  return (
    <div
      className={`w-20 h-32 border-4 border-gray-800 rounded-b-lg relative overflow-hidden cursor-pointer ${shake ? 'animate-shake' : ''}`}
      onClick={() => onSubmit(index)}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Juice liquid - NO DRAG HANDLERS HERE */}
      <div
        className={`absolute bottom-0 w-full bg-${juiceColor} rounded-t-lg`}
        style={{ height: `${juiceHeight}%` }}
      />
      <div className="absolute top-1 left-0 right-0 text-center">
        <span className="bg-black bg-opacity-40 text-white text-xs px-1 rounded">
          {glass.fruits.length}
        </span>
      </div>
    </div>
  );
}
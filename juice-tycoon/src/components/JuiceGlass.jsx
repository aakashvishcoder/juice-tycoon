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
    e.stopPropogation();
    onDrop(e, index);
  };

  if (!glass || !glass.fruits) {
    return (
      <div
        className="w-16 h-28 border-4 border-dashed border-amber-300 rounded-b-xl bg-gradient-to-b from-amber-50 to-white flex items-end justify-center cursor-pointer hover:bg-amber-100 transition-all duration-200"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => onSubmit(index)}
      >
        <span className="text-amber-400 text-xs font-bold">+ DRAG FRUIT</span>
      </div>
    );
  }

  const juiceColor = glass.fruits[0]?.color || 'juice-brown';
  const juiceHeight = Math.min(100, 25 * glass.fruits.length);

  return (
    <div
      className={`w-16 h-28 border-4 boredr-amber-800 rounded-b-xl relative overflow-hidden cursor-pointer ${shake ? 'animate-shake' : ''} transform hover:scale-105 transition-transform duration-200`}
      onClick={() => onSubmit(index)}
      onDragover={handleDragOver}
      onDrop={handleDrop} 
    >
      <div
        className={`absolute bottom-0 w-full bg-${juiceColor} rounded-t-lg transition-all duration-500`}
        style={{ height: `${juiceHeight}%` }}
      />

      <div className="absolute top-0 left-2 w-2 h-full bg-white bg-opacity-30 rounded-full"></div>

      <div className="absolute -top-2 -right-2 bg-amber-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-md">
        {glass.fruits.length}
      </div>
    </div>
  );
};
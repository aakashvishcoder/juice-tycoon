import { useState, useEffect, useCallback } from 'react';
import JuiceGlass from './components/JuiceGlass';
import OrderCard from './components/OrderCard';
import { FRUITS, RECIPES, CUSTOMERS } from './data';
import { playSound } from './utils/sound';

export default function App() {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameActive, setGameActive] = useState(true);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [juiceGlasses, setJuiceGlasses] = useState([null, null, null]);
  const [streak, setStreak] = useState(0);
  const [comboPoints, setComboPoints] = useState(0);
  const [showCombo, setShowCombo] = useState(false);

  const generateOrder = useCallback(() => {
    const recipe = RECIPES[Math.floor(Math.random() * RECIPES.length)];
    const cust = CUSTOMERS[Math.floor(Math.random() * CUSTOMERS.length)];
    setCurrentOrder({ ...recipe, id: Date.now() });
    setCustomer(cust);
  }, []);

  useEffect(() => {
    generateOrder();
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setGameActive(false);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [generateOrder]);

  const handleDragStart = (e, fruit) => {
    e.dataTransfer.setData('text/plain', JSON.stringify(fruit));
  };

  const handleDrop = (e, glassIndex) => {
    e.preventDefault();

    const fruitData = e.dataTransfer.getData('text/plain');
    if (!fruitData || !currentOrder) return;

    let fruit;
    try {
      fruit = JSON.parse(fruitData);
    } catch (err) {
      console.error("Failed to parse fruit:", err);
      return;
    }

    //da pour effect
    const pour = document.createElement('div');
    pour.className = 'fixed text-2xl pointer-events-none animate-pour z-50';
    pour.style.left = `${e.clientX - 20}px`;
    pour.style.top = `${e.clientY - 20}px`;
    pour.textContent = fruit.emoji;
    document.body.appendChild(pour);
    setTimeout(() => document.body.removeChild(pour), 800);

    setJuiceGlasses(prev => {
      const newGlasses = [...prev];
      if (!newGlasses[glassIndex]) {
        newGlasses[glassIndex] = { fruits: [] };
      }
      newGlasses[glassIndex].fruits.push(fruit);
      return newGlasses;
    });

    playSound('pour');
  };

  const handleSubmit = (glassIndex) => {
    const glass = juiceGlasses[glassIndex];
    if (!glass || glass.fruits.length === 0 || !currentOrder) {
      return;
    }

    const glassFruits = glass.fruits.map(f => f.id).sort();
    const orderFruits = [...currentOrder.fruits].sort();
    const isMatch = JSON.stringify(glassFruits) === JSON.stringify(orderFruits);

    if (isMatch) {
      const points = Math.round(currentOrder.points * customer.bonus);
      setScore(s => s + points);
      const newStreak = streak + 1;
      setStreak(newStreak);

      if (newStreak >= 3) {
        const combo = Math.floor(points * 0.5);
        setScore(s => s + combo);
        setShowCombo(true);
        setTimeout(() => setShowCombo(false), 2000);
        playSound('combo');
      }

      playSound('success');
      generateOrder();
    } else {
      setTimeLeft(t => Math.max(0, t - 5));
      playSound('error');
      setJuiceGlasses(prev => {
        const copy = [...prev];
        if (copy[glassIndex]) copy[glassIndex] = { ...copy[glassIndex], shake: true };
        return copy;
      });
    }

    setJuiceGlasses(prev => {
      const copy = [...prev];
      copy[glassIndex] = null;
      return copy;
    });
  };

  const resetGame = () => {
    setScore(0);
    setTimeLeft(60);
    setGameActive(true);
    setStreak(0);
    setShowCombo(false);
    setJuiceGlasses([null, null, null]);
    generateOrder();
  };

  if (!gameActive) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
        <div className="bg-gradient-to-br from-juice-orange to-juice-pink rounded-3xl p-8 max-w-md w-80 text-center">
          <h2 className="text-3xl font-bold text-white mb-2">Time's Up!</h2>
          <p className="text-xl text-white mb-1">Score: <span className="font-bold">{score}</span></p>
          <p className="text-lg text-white mb-4">Streak: {streak}</p>
          <button
            onClick={resetGame}
            className="bg-white text-juice-orange font-bold py-2 px-6 rounded-full"
          >
            Play Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center p-4 text-white">
      <div className="w-full max-w-6xl flex justify-between items-center mb-6">
        <h1 className="text-3xl md:text-4xl font-bold drop-shadow">Juice Tycoon</h1>
        <div className="flex gap-4">
          <div className="bg-black bg-opacity-40 px-4 py-2 rounded-full">
            Score : <span className="font-bold text-yellow-300">{score}</span>
          </div>
          <div className="bg-black bg-opacity-40 px-4 py-2 rounded-full">
            Time: <span className={`font-bold ${timeLeft < 10 ? 'text-red-400' : 'text-green-300'}`}>{timeLeft}s</span>
          </div>
          {streak > 0 && (
            <div className="bg-black bg-opacity-40 px-4 py-2 rounded-full">
              Streak: <span className="font-bold text-purple-300">{streak}</span>
            </div>
          )}
        </div>
      </div>

      {showCombo && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold text-lg px-6 py-3 rounded-full shadow-lg animate-pulse-slow z-50">
          COMBO! +{comboPoints} POINTS!
        </div>
      )}

      <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-6">
        <div className="bg-black bg-opacity-30 rounded-2xl p-4 flex-1">
          <h2 className="text-xl font-bold mb-3">Fruits</h2>
          <div className="grid grid-cols-4 gap-3">
            {FRUITS.map(fruit => (
              <div
                key={fruit.id}
                draggable
                onDragStart={(e) => handleDragStart(e, fruit)}
                className="fruit bg-white bg-opacity-20 rounded-xl p-3 flex flex-col items-center h-20 justify-center hover:bg-opacity-30"
              >
                <span className="text-2xl">{fruit.emoji}</span>
                <span className="text-xs mt-1">{fruit.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-black bg-opacity-30 rounded-2xl flex-1 flex flex-col">
          <h2 className="text-xl font-bold mb-4">Juice Station</h2>
          <div className="flex justify-center gap-6 mb-6">
            {juiceGlasses.map((glass, i) => (
              <div key={i} className="flex flex-col items-center">
                <JuiceGlass
                  glass={glass}
                  onDrop={handleDrop}
                  onSubmit={handleSubmit}
                  index={i}
                />
                <button
                  onClick={() => handleSubmit(i)}
                  className="mt-2 bg-juice-orange hover:bg-opacity-90 text-white text-sm font-bold py-1 px-3 rounded-full"
                >
                  Serve
                </button>
                <div className="text-xs mt-1 text-center">
                  <span className={glass?.fruits.length > (currentOrder?.fruits.length || 0) ? 'text-red-400' : 'text-white'}>
                    {glass?.fruits.length || 0}/{currentOrder?.fruits.length || '?'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-auto">
            <h3 className="text-lg font-bold mb-2">Current Order</h3>
            <OrderCard order={currentOrder} customer={customer} />
          </div>
        </div>

        <div className="bg-black bg-opacity-30 rounded-2xl p-4 flex-1">
          <h2 className="text-xl font-bold mb-3">How to Play</h2>
          <ul className="text-sm space-y-2">
            <li>1. Drag fruits to juice glasses!</li>
            <li>2. Match the order exactly</li>
            <li>3. Click glass or "Serve" to submit</li>
            <li>4. 3+ correct = combo points!</li>
            <li>5. Different customers = different bonuses!</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
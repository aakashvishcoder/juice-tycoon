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
  const [isProcessingDrop, setIsProcessingDrop] = useState(false);

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
    //preventing overlap
    if (isProcessingDrop) return;
    setIsProcessingDrop(true);
    
    e.preventDefault();

    const fruitData = e.dataTransfer.getData('text/plain');
    if (!fruitData || !currentOrder) {
      setIsProcessingDrop(false);
      return;
    }

    let fruit;
    try {
      fruit = JSON.parse(fruitData);
    } catch (err) {
      console.error("Failed to parse fruit:", err);
      setIsProcessingDrop(false);
      return;
    }

    //checking the state continuously
    const currentGlasses = [...juiceGlasses];
    const glass = currentGlasses[glassIndex];
    const currentCount = glass ? glass.fruits.length : 0;
    const maxFruits = currentOrder.fruits.length;
    
    //no overfilling!!
    if (currentCount >= maxFruits) {
      playSound('error');
      setIsProcessingDrop(false);
      return;
    }

    //extra check for duplicate fruits
    if (glass && glass.fruits.some(f => f.id === fruit.id)) {
      playSound('error');
      setIsProcessingDrop(false);
      return;
    }

    //pouring animation
    const pour = document.createElement('div');
    pour.className = 'fixed text-2xl pointer-events-none animate-pour z-50';
    pour.style.left = `${e.clientX - 20}px`;
    pour.style.top = `${e.clientY - 20}px`;
    pour.textContent = fruit.emoji;
    document.body.appendChild(pour);
    setTimeout(() => {
      if (pour.parentNode) {
        document.body.removeChild(pour);
      }
    }, 800);

    //update the glass state
    const newGlasses = [...juiceGlasses];
    if (!newGlasses[glassIndex]) {
      newGlasses[glassIndex] = { fruits: [] };
    }
    newGlasses[glassIndex].fruits.push(fruit);
    setJuiceGlasses(newGlasses);

    playSound('pour');
    setIsProcessingDrop(false);
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
        setComboPoints(combo);
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
      //shake animation (need to debug)
      setJuiceGlasses(prev => {
        const copy = [...prev];
        if (copy[glassIndex]) {
          copy[glassIndex] = { ...copy[glassIndex], shake: true };
        }
        return copy;
      });
    }

    //cleaning the glasses
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
      <div className="fixed inset-0 bg-gradient-to-br from-amber-900 via-red-800 to-purple-900 flex items-center justify-center z-50 p-4">
        <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl border-4 border-amber-300">
          <div className="text-5xl mb-4">🍊</div>
          <h2 className="text-3xl font-bold text-white drop-shadow-lg mb-2">Game Over!</h2>
          <p className="text-xl font-bold text-white mb-1">Final Score: <span className="text-amber-900">{score}</span></p>
          <p className="text-lg font-bold text-white mb-6">Streak: {streak}</p>
          <button
            onClick={resetGame}
            className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg transform hover:scale-105 transition-all duration-200 border-2 border-amber-400"
          >
            PLAY AGAIN
          </button>
          <div className="mt-6 text-sm text-amber-900 font-bold">
            Made with ❤️ for Hack Club Milkyway
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 p-2 font-fredoka">
      <div className="max-w-6xl mx-auto mb-4">
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl p-4 shadow-lg border-4 border-amber-400">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg font-press-start text-center md:text-left">
              JUICE TYCOON
            </h1>
            <div className="flex flex-wrap justify-center gap-3 mt-3 md:mt-0">
              <div className="bg-white bg-opacity-20 backdrop-blur-sm px-4 py-2 rounded-full flex items-center">
                <span className="text-white font-bold mr-2">SCORE:</span>
                <span className={`text-2xl font-bold ${timeLeft < 10 ? 'text-red-300 animate-pulse' : 'text-green-300'}`}>
                  {timeLeft}s
                </span>
              </div>
              {streak > 0 && (
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 rounded-full flex items-center animate-pulse-slow">
                  <span className="text-white font-bold mr-2">STREAK:</span>
                  <span className="text-2xl font-bold text-yellow-300">{streak}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showCombo && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold text-xl px-6 py-3 rounded-full shadow-2xl z-50 animate-bounce">
          🎉 COMBO! +{comboPoints} POINTS! 🎉
        </div>
      )}

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white bg-opacity-70 backdrop-blur-sm rounded-2xl p-4 shadow-lg border-2 border-amber-200">
          <h2 className="text-xl font-bold text-amber-800 mb-3 flex items-center">
            <span className="text-2xl mr-2">🍓</span> FRUITS
          </h2>
          <div className="grid grid-cols-4 gap-2">
            {FRUITS.map(fruit => (
              <div
                key={fruit.id}
                draggable
                onDragStart={(e) => handleDragStart(e, fruit)}
                className="fruit bg-gradient-to-br from-white to-amber-50 rounded-xl p-2 flex flex-col items-center h-16 justify-center hover:from-amber-50 hover:to-orange-50 transition-all duration-200 border border-amber-100 hover:border-amber-300 hover:scale-105 cursor-grab active:cursor-grabbing"
              >
                <span className="text-2xl">{fruit.emoji}</span>
                <span className="text-xs mt-1 font-bold text-amber-800">{fruit.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white bg-opacity-70 backdrop-blur-sm rounded-2xl p-4 shadow-lg border-2 border-amber-200 flex flex-col">
          <h2 className="text-xl font-bold text-amber-800 mb-3 flex items-center">
            <span className="text-2xl mr-2">🥤</span> JUICE STATION
          </h2>
          <div className="flex justify-center gap-3 mb-4">
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
                  disabled={!glass || glass.fruits.length === 0}
                  className="mt-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white text-sm font-bold py-1.5 px-4 rounded-full transition-all duration-200 disabled:cursor-not-allowed shadow-md"
                >
                  SERVE
                </button>
                <div className="text-xs mt-1 text-center min-h-5">
                  {glass && (
                    <span className={glass.fruits.length > (currentOrder?.fruits.length || 0) ? 'text-red-500 font-bold' : 'text-amber-700'}>
                      {glass.fruits.length}/{currentOrder?.fruits.length || '?'}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-auto mt-4 pt-4 border-t border-amber-200">
            <h3 className="text-lg font-bold text-amber-800 mb-2 flex items-center">
              <span className="text-xl mr-2">📋</span> CURRENT ORDER
            </h3>
            <OrderCard order={currentOrder} customer={customer} />
          </div>
        </div>

        <div className="bg-white bg-opacity-70 backdrop-blur-sm rounded-2xl p-4 shadow-lg border-2 border-amber-200">
          <h2 className="text-xl font-bold text-amber-800 mb-3 flex items-center">
            <span className="text-2xl mr-2">🎮</span> HOW TO PLAY
          </h2>
          <ul className="text-amber-800 space-y-2 text-sm">
            <li className="flex items-start">
              <span className="text-amber-600 mr-2">1.</span>
              <span>Drag fruits to juice glasses</span>
            </li>
            <li className="flex items-start">
              <span className="text-amber-600 mr-2">2.</span>
              <span>Match the order exactly</span>
            </li>
            <li className="flex items-start">
              <span className="text-amber-600 mr-2">3.</span>
              <span>Click "SERVE" to submit</span>
            </li>
            <li className="flex items-start">
              <span className="text-amber-600 mr-2">4.</span>
              <span>Get 3+ correct for COMBO points!</span>
            </li>
            <li className="flex items-start">
              <span className="text-amber-600 mr-2">5.</span>
              <span>Watch customer bonuses!</span>
            </li>
          </ul>

          <div className="mt-4 pt-4 border-t border-amber-200">
            <h3 className="text-lg font-bold text-amber-800 mb-2">CUSTOMER TYPES</h3>
            <div className="grid grid-cols-2 gap-2">
              {CUSTOMERS.map(cust => (
                <div key={cust.id} className="bg-amber-100 rounded-lg p-2 text-center">
                  <div className="text-lg">{cust.emoji}</div>
                  <div className="font-bold text-xs text-amber-800">{cust.name}</div>
                  <div className="text-xs text-amber-700">×{cust.bonus}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <footer className="max-w-6xl mx-auto mt-6 text-center text-amber-700 text-sm">
        <div className="bg-white bg-opacity-50 backdrop-blur-sm rounded-xl p-3 border border-amber-200">
          🍊 Juice Tycoon • Made for Hack Club Milkyway • {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
}
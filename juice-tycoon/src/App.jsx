import { useState, useEffect, useCallback, useRef } from 'react';
import JuiceGlass from './components/JuiceGlass';
import OrderCard from './components/OrderCard';
import { FRUITS, RECIPES, CUSTOMERS, ACHIEVEMENTS } from './data';
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
  const [isProcessingSubmit, setIsProcessingSubmit] = useState(false);
  const [customerTimeLeft, setCustomerTimeLeft] = useState(0);
  const [difficulty, setDifficulty] = useState('medium');
  const [unlockedAchievements, setUnlockedAchievements] = useState(new Set());
  const [showAchievement, setShowAchievement] = useState(null);
  const customerTimerRef = useRef(null);
  const mainTimerRef = useRef(null);
  const comboCountRef = useRef(0);

  const DIFFICULTY_SETTINGS = {
    easy: {
      gameTime: 90,
      customerTimeMultiplier: 1.5,
      penaltyMultiplier: 0.5,
      recipeComplexity: 'simple'
    },
    medium: {
      gameTime: 60,
      customerTimeMultiplier: 1,
      penaltyMultiplier: 1,
      recipeComplexity: 'normal'
    },
    hard: {
      gameTime: 45,
      customerTimeMultiplier: 0.7,
      penaltyMultiplier: 1.5,
      recipeComplexity: 'complex'
    }
  };

  const unlockAchievement = useCallback((achievementId) => {
    if (unlockedAchievements.has(achievementId)) return;
    
    const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
    if (achievement) {
      setUnlockedAchievements(prev => new Set([...prev, achievementId]));
      setScore(s => s + achievement.points);
      setShowAchievement(achievement);
      setTimeout(() => setShowAchievement(null), 3000);
      playSound('achievement');
    }
  }, [unlockedAchievements]);

  const createPourParticles = (x, y, emoji, count = 3) => {
    for (let i = 0; i < count; i++) {
      const particle = document.createElement('div');
      particle.textContent = emoji;
      particle.className = 'fixed animate-pour-particle';
      
      const angle = Math.random() * Math.PI * 2;
      const distance = 30 + Math.random() * 40;
      const tx = Math.cos(angle) * distance;
      const ty = Math.sin(angle) * distance + 30;
      
      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;
      particle.style.setProperty('--tx', `${tx}px`);
      particle.style.setProperty('--ty', `${ty}px`);
      
      document.body.appendChild(particle);
      
      setTimeout(() => {
        if (particle.parentNode) {
          document.body.removeChild(particle);
        }
      }, 600);
    }
  };

  const generateOrder = useCallback(() => {
    if (customerTimerRef.current) {
      clearInterval(customerTimerRef.current);
      customerTimerRef.current = null;
    }
    
    let availableRecipes = RECIPES;
    if (DIFFICULTY_SETTINGS[difficulty].recipeComplexity === 'simple') {
      availableRecipes = RECIPES.filter(r => r.fruits.length <= 2);
    } else if (DIFFICULTY_SETTINGS[difficulty].recipeComplexity === 'complex') {
      availableRecipes = RECIPES.filter(r => r.fruits.length >= 2);
    }
    
    const recipe = availableRecipes[Math.floor(Math.random() * availableRecipes.length)];
    const cust = CUSTOMERS[Math.floor(Math.random() * CUSTOMERS.length)];
    
    const modifiedCust = {
      ...cust,
      timeLimit: Math.max(5, Math.floor(cust.timeLimit * DIFFICULTY_SETTINGS[difficulty].customerTimeMultiplier)),
      penalty: Math.floor(cust.penalty * DIFFICULTY_SETTINGS[difficulty].penaltyMultiplier)
    };
    
    setCurrentOrder({ ...recipe, id: Date.now() });
    setCustomer(modifiedCust);
    setCustomerTimeLeft(modifiedCust.timeLimit);
    
    const timer = setInterval(() => {
      setCustomerTimeLeft(prev => {
        if (prev <= 1) {
          if (customerTimerRef.current) {
            clearInterval(customerTimerRef.current);
            customerTimerRef.current = null;
          }
          setScore(s => Math.max(0, s - modifiedCust.penalty));
          playSound('error');
          generateOrder();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    customerTimerRef.current = timer;
  }, [difficulty]);

  useEffect(() => {
    if (mainTimerRef.current) {
      clearInterval(mainTimerRef.current);
    }

    if (customerTimerRef.current) {
      clearInterval(customerTimerRef.current);
      customerTimerRef.current = null;
    }

    setTimeLeft(DIFFICULTY_SETTINGS[difficulty].gameTime);
    
    const mainTimer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    mainTimerRef.current = mainTimer;
    generateOrder();
    
    return () => {
      if (mainTimerRef.current) {
        clearInterval(mainTimerRef.current);
      }
      if (customerTimerRef.current) {
        clearInterval(customerTimerRef.current);
      }
    };
  }, [difficulty, generateOrder]);

  const handleDragStart = (e, fruit) => {
    e.dataTransfer.setData('text/plain', JSON.stringify(fruit));
  };

  const handleDrop = (e, glassIndex) => {
    if (isProcessingDrop || isProcessingSubmit) return;
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

    const currentGlasses = [...juiceGlasses];
    const glass = currentGlasses[glassIndex];
    const currentCount = glass ? glass.fruits.length : 0;
    const maxFruits = currentOrder.fruits.length;
    
    if (currentCount >= maxFruits) {
      playSound('error');
      setIsProcessingDrop(false);
      return;
    }

    if (glass && glass.fruits.some(f => f.id === fruit.id)) {
      playSound('error');
      setIsProcessingDrop(false);
      return;
    }

    createPourParticles(e.clientX - 20, e.clientY - 20, fruit.emoji);

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
    if (isProcessingSubmit) return;
    setIsProcessingSubmit(true);
    
    const glass = juiceGlasses[glassIndex];
    if (!glass || glass.fruits.length === 0 || !currentOrder || !customer) {
      setIsProcessingSubmit(false);
      return;
    }

    const glassFruits = glass.fruits.map(f => f.id).sort();
    const orderFruits = [...currentOrder.fruits].sort();
    const isMatch = JSON.stringify(glassFruits) === JSON.stringify(orderFruits);

    if (isMatch) {
      if (customerTimerRef.current) {
        clearInterval(customerTimerRef.current);
        customerTimerRef.current = null;
      }

      const points = Math.round(currentOrder.points * customer.bonus);
      setScore(s => s + points);
      const newStreak = streak + 1;
      setStreak(newStreak);

      if (score === 0) {
        unlockAchievement('first_order');
      }
      
      if (score + points >= 100 && !unlockedAchievements.has('score_100')) {
        unlockAchievement('score_100');
      }
      
      if (newStreak >= 5 && !unlockedAchievements.has('streak_5')) {
        unlockAchievement('streak_5');
      }
      
      if (customer.id === 'critic' && !unlockedAchievements.has('critic_please')) {
        unlockAchievement('critic_please');
      }

      if (newStreak >= 3) {
        const combo = Math.floor(points * 0.5);
        setComboPoints(combo);
        setScore(s => s + combo);
        comboCountRef.current += 1;
        setShowCombo(true);
        setTimeout(() => setShowCombo(false), 2000);
        playSound('combo');
        
        if (comboCountRef.current >= 3 && !unlockedAchievements.has('combo_king')) {
          unlockAchievement('combo_king');
        }
      }

      playSound('success');
      generateOrder();
    } else {
      if (customerTimerRef.current) {
        clearInterval(customerTimerRef.current);
        customerTimerRef.current = null;
      }
      
      playSound('error');
      
      setJuiceGlasses(prev => {
        const copy = [...prev];
        if (copy[glassIndex]) {
          copy[glassIndex] = { ...copy[glassIndex], shake: true };
        }
        return copy;
      });
      
      generateOrder();
    }

    setJuiceGlasses(prev => {
      const copy = [...prev];
      copy[glassIndex] = null;
      return copy;
    });
    
    setTimeout(() => {
      setIsProcessingSubmit(false);
    }, 300);
  };

  const resetGameWithDifficulty = (newDifficulty) => {
    setDifficulty(newDifficulty);
    setScore(0);
    setGameActive(true);
    setStreak(0);
    setShowCombo(false);
    setJuiceGlasses([null, null, null]);
    setUnlockedAchievements(new Set());
    comboCountRef.current = 0;
    setIsProcessingSubmit(false);
    if (customerTimerRef.current) {
      clearInterval(customerTimerRef.current);
      customerTimerRef.current = null;
    }
  };

  const resetGame = () => {
    resetGameWithDifficulty(difficulty);
  };

  if (!gameActive) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-amber-900 via-red-800 to-purple-900 flex items-center justify-center z-50 p-4">
        <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl border-4 border-amber-300">
          <div className="text-5xl mb-4">🍊</div>
          <h2 className="text-3xl font-bold text-white drop-shadow-lg mb-2">Game Over!</h2>
          <p className="text-lg font-bold text-white mb-1">
            Difficulty: <span className="text-amber-300 capitalize">{difficulty}</span>
          </p>
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
      {showAchievement && (
        <div className="fixed top-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold px-6 py-4 rounded-xl shadow-2xl z-50 transform animate-fade-in-up">
          <div className="text-2xl mb-1">{showAchievement.icon}</div>
          <div className="text-lg">{showAchievement.name}</div>
          <div className="text-sm opacity-90">{showAchievement.desc}</div>
          <div className="text-xs mt-1 text-yellow-100">+{showAchievement.points} PTS</div>
        </div>
      )}

      <div className="max-w-6xl mx-auto mb-4">
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl p-4 shadow-lg border-4 border-amber-400">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg font-press-start text-center md:text-left">
              JUICE TYCOON
            </h1>

            <div className="flex flex-wrap gap-2">
              {['easy', 'medium', 'hard'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => {
                    if (gameActive) {
                      if (window.confirm('Change difficulty? Current game will restart.')) {
                        resetGameWithDifficulty(mode);
                      }
                    } else {
                      resetGameWithDifficulty(mode);
                    }
                  }}
                  className={`px-3 py-1 rounded-full text-sm font-bold capitalize transition-all ${
                    difficulty === mode
                      ? 'bg-white text-amber-600 shadow-md'
                      : 'bg-amber-200 text-amber-800 hover:bg-amber-300'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
            
            <div className="flex flex-wrap justify-center gap-3">
              <div className="bg-white bg-opacity-20 backdrop-blur-sm px-4 py-2 rounded-full flex items-center">
                <span className="text-white font-bold mr-2">SCORE:</span>
                <span className="text-2xl font-bold text-amber-200">{score}</span>
              </div>
              <div className="bg-white bg-opacity-20 backdrop-blur-sm px-4 py-2 rounded-full flex items-center">
                <span className="text-white font-bold mr-2">TIME:</span>
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

      {customer && (
        <div className="max-w-6xl mx-auto mb-4">
          <div className="bg-white bg-opacity-20 backdrop-blur-sm px-4 py-2 rounded-full flex items-center justify-center mx-auto w-fit">
            <span className="text-white font-bold mr-2">ORDER:</span>
            <div className="w-20 h-2 bg-gray-300 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-1000 ${
                  customerTimeLeft <= 3 ? 'bg-red-500' : 
                  customerTimeLeft <= 7 ? 'bg-orange-500' : 'bg-green-400'
                }`}
                style={{ width: `${(customerTimeLeft / customer.timeLimit) * 100}%` }}
              />
            </div>
            <span className={`ml-2 text-sm font-bold ${
              customerTimeLeft <= 3 ? 'text-red-300' : 
              customerTimeLeft <= 7 ? 'text-orange-300' : 'text-green-300'
            }`}>
              {customerTimeLeft}s
            </span>
          </div>
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
                  disabled={!glass || glass.fruits.length === 0 || isProcessingSubmit}
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
            <OrderCard 
              order={currentOrder} 
              customer={customer} 
              timeLeft={customerTimeLeft}
            />
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
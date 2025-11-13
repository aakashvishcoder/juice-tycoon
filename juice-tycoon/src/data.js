// starter fruits (subject to change)
export const FRUITS = [
    { id: 'apple', name: 'Apple', color: 'juice-green', emoji: '🍎' },
    { id: 'orange', name: 'Orange', color: 'juice-orange', emoji: '🍊' },
    { id: 'grape', name: 'Grape', color: 'juice-purple', emoji: '🍇' },
    { id: 'banana', name: 'Banana', color: 'juice-yellow', emoji: '🍌' },
    { id: 'strawberry', name: 'Strawberry', color: 'juice-pink', emoji: '🍓' },
    { id: 'blueberry', name: 'Blueberry', color: 'juice-blue', emoji: '🫐' },
    { id: 'pineapple', name: 'Pineapple', color: 'juice-yellow', emoji: '🍍' },
    { id: 'mango', name: 'Mango', color: 'juice-orange', emoji: '🥭' },
];
// combinations (also subject to change, when i get more ideas)
/*
Generic ahh names
points for combinations vary from lets say 25-50
*/
export const RECIPES = [
    { fruits: ['apple'], name: 'Apple Juice', points: 10 },
    { fruits: ['orange'], name: 'Orange Juice', points: 10 },
    { fruits: ['grape'], name: 'Grape Juice', points: 15 },
    { fruits: ['strawberry'], name: 'Strawberry Juice', points: 15 },
    { fruits: ['apple', 'orange'], name: 'Citrus Blend', points: 25 },
    { fruits: ['apple', 'grape'], name: 'Fruit Punch', ppoints: 25 },
    { fruits: ['banana', 'strawberry'], name: 'Strawberry Banana', points: 30 },
    { fruits: ['pineapple', 'mango'], name: 'Tropical Mix', points: 35 },
    { fruits: ['apple', 'orange', 'grape'], name: 'Fruit KICK', points: 50 },
    { fruits: ['strawberry', 'banana', 'blueberry'], name: 'Berry Blast', points: 45 },
];

export const CUSTOMERS = [
    {
        id: 'regular',
        name: 'regular',
        bonus: 1,
        emoji: '👤',
        color: 'bg-gray-200',
        timeLimit: 15,
        penalty: 5,
    },
    {
        id: 'hungry',
        name: 'Hungry',
        bonus: 1.5,
        emoji: '😋',
        color: 'bg-yellow-200',
        timeLimit: 10,
        penalty: 10,
    },
    {
        id: 'gymbro',
        name: 'Gym Bro',
        bonus: 0.5,
        emoji: '🏃',
        color: 'bg-blue-200',
        timeLimit: 8,
        penalty: 15,
    },
    {
        id: 'critic',
        name: 'Critic',
        bonus: 2,
        emoji: '🧐',
        color: 'bg-purple-200',
        timeLimit: 20,
        penalty: 20,
    }
];

export const ACHIEVEMENTS = [
  { id: 'first_order', name: 'First Sip!', desc: 'Serve your first order', icon: '🥤', points: 10 },
  { id: 'score_100', name: 'Juice Master', desc: 'Reach 100 points', icon: '🏆', points: 25 },
  { id: 'streak_5', name: 'Perfect Run', desc: '5 orders in a row!', icon: '🔥', points: 50 },
  { id: 'critic_please', name: 'Critic Approved', desc: 'Successfully serve a Critic', icon: '🧐', points: 30 },
  { id: 'combo_king', name: 'Combo King', desc: 'Get 3 combos in one game', icon: '👑', points: 40 }
];
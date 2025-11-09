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
    { fruits: ['apple', 'grape'], name: "Fruit Punch", points: 25 },
    { fruits: ['banana', 'strawberry'], name: 'Strawberry Banana', points: 30 },
    { fruits: ['pineapple', 'mango'], name: 'Tropical Mix', points: 35 },
    { fruits: ['apple', 'orange', 'grape'], name: 'what should i name this lol', points: 50 }, //need to change this obv
    { fruits: ['strawberry', 'banana', 'blueberry'], name: 'Berry Blast', points: 45 },
];

export const CUSTOMERS = [
    { id: 'regular joe', name: "Regular", bonus: 1, emoji: '👤', color: 'bg-gray-200' },
    { id: 'thirsty', name: 'Hungry', bonus: 1.5, emoji: '😋', color: 'bg-yellow-200' },
    { id: 'gym bro', name: 'Gym Bro', bonus: 0.5, emoji: '🏃', color: 'bg-blue-200' },
    { id: 'critic', name: 'Critic', bonus: 2, emoji: '🧐', color: 'bg-purple-200' }, //add more later
];
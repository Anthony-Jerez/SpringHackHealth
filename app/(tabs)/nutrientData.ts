import { Nutrient } from './type/nutrient';

export const nutrients: Nutrient[] = [
  {
    id: 'vitamin-a',
    name: 'Vitamin A',
    type: 'vitamin',
    unit: 'mcg',
    recommendedDaily: 900,
    description: 'Important for vision, immune function, and cell growth'
  },
  {
    id: 'vitamin-c',
    name: 'Vitamin C',
    type: 'vitamin',
    unit: 'mg',
    recommendedDaily: 90,
    description: 'Antioxidant that boosts immune system and promotes collagen production'
  },
  {
    id: 'vitamin-d',
    name: 'Vitamin D',
    type: 'vitamin',
    unit: 'mcg',
    recommendedDaily: 15,
    description: 'Helps calcium absorption and bone health'
  },
  {
    id: 'vitamin-e',
    name: 'Vitamin E',
    type: 'vitamin',
    unit: 'mg',
    recommendedDaily: 15,
    description: 'Antioxidant that protects cells from damage'
  },
  {
    id: 'iron',
    name: 'Iron',
    type: 'mineral',
    unit: 'mg',
    recommendedDaily: 18,
    description: 'Essential for blood production and oxygen transport'
  },
  {
    id: 'calcium',
    name: 'Calcium',
    type: 'mineral',
    unit: 'mg',
    recommendedDaily: 1000,
    description: 'Important for bone health and muscle function'
  },
  {
    id: 'zinc',
    name: 'Zinc',
    type: 'mineral',
    unit: 'mg',
    recommendedDaily: 11,
    description: 'Supports immune function and wound healing'
  },
  {
    id: 'protein',
    name: 'Protein',
    type: 'macro',
    unit: 'g',
    recommendedDaily: 56,
    description: 'Essential for muscle building and repair'
  },
  {
    id: 'carbs',
    name: 'Carbohydrates',
    type: 'macro',
    unit: 'g',
    recommendedDaily: 275,
    description: 'Primary energy source for the body'
  },
  {
    id: 'fat',
    name: 'Fat',
    type: 'macro',
    unit: 'g',
    recommendedDaily: 78,
    description: 'Essential for hormone production and nutrient absorption'
  }
];

export const calculateNutrientProgress = (
  currentAmount: number, 
  recommendedAmount: number
): number => {
  const percentage = (currentAmount / recommendedAmount) * 100;
  return Math.min(percentage, 100);
};

export const calculateOverallHealth = (
  nutrients: Record<string, number>
): number => {
  let totalPercentage = 0;
  let count = 0;
  
  for (const nutrientId in nutrients) {
    const nutrient = nutrients[nutrientId];
    const nutrientData = findNutrient(nutrientId);
    
    if (nutrientData) {
      const percentage = calculateNutrientProgress(nutrient, nutrientData.recommendedDaily);
      totalPercentage += percentage;
      count++;
    }
  }
  
  return count > 0 ? totalPercentage / count : 0;
};

export const findNutrient = (id: string): Nutrient | undefined => {
  return nutrients.find(nutrient => nutrient.id === id);
};

export const determinePetMood = (healthPercentage: number) => {
  if (healthPercentage >= 70) return 'happy';
  if (healthPercentage >= 40) return 'neutral';
  return 'sad';
};

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
    id: 'vitamin-d',
    name: 'Vitamin D',
    type: 'vitamin',
    unit: 'mcg',
    recommendedDaily: 15,
    description: 'Helps calcium absorption and bone health'
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
    id: 'iodine',
    name: 'Iodine',
    type: 'mineral',
    unit: 'mcg',
    recommendedDaily: 150,
    description: 'Essential mineral for normal thyroid function'
  },
  {
    id: 'vitamin  B12',
    name: 'Vitamin B12',
    type: 'vitamin',
    unit: 'mcg',
    recommendedDaily: 2.4,
    description: 'essential for brain & nerve function'
  },
  {
    id: 'magnesium',
    name: 'Magnesum',
    type: 'mineral',
    unit: 'mg',
    recommendedDaily: 300,
    description: 'essential for bone & teeth structure'
  },
 
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

export type NutrientType = 'vitamin' | 'mineral' | 'macro';

export interface Nutrient {
  id: string;
  name: string;
  type: NutrientType;
  unit: string;
  recommendedDaily: number;
  description: string;
}

export interface NutrientLog {
  id: string;
  nutrientId: string;
  amount: number;
  date: Date;
}

export interface UserNutrientState {
  nutrients: Record<string, number>;
  logs: NutrientLog[];
  date: string;
}


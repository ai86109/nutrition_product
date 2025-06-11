export interface FieldMappings {
  info: Record<string, string>;
  spec: Record<string, string>;
  ingredients: Record<string, string>;
}

export interface IngredientsData {
  [key: string]: number | string;
}

export interface ProcessedSpec {
  type: string;
  unit?: string;
  volume?: string;
  defaultAmount?: string;
}

export interface ProcessedSpecData {
  id: string;
  name: string;
  defaultAmount: string;
  spec: ProcessedSpec[];
}

export interface ApiProductData {
  id: string;
  name: string;
  engName: string;
  brand: string;
  type: string;
  defaultAmount: string;
  reviewStatus: string;
  categories: string[];
  spec: ProcessedSpec[];
  ingredients: {
    calories: number;
    carbohydrate: number;
    protein: number;
    fat: number;
    phosphorus: number;
    potassium: number;
    sodium: number;
    fiber: number;
  };
}
import type { IngredientsData } from './nutrition'
export interface FieldMappings {
  info: Record<string, string>;
  spec: Record<string, string>;
  ingredients: Record<string, string>;
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

// 清單用（初始載入，不含 nutrition 資料）
export interface ApiProductListData {
  id: string;
  name: string;
  engName: string;
  brand: string;
  type: string;
  reviewStatus: string;
  productStatus: string | null;
  categories: string[];
}

// 詳細資料（使用者加入計算後才 fetch）
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
  ingredients: IngredientsData;
  // 每 100g/100ml 的營養素（給產品資訊 dialog 顯示用）
  ingredientsPer100?: IngredientsData;
}
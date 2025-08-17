import { Units } from './item.models';

export interface IProductList {
  productId?: number;
  name: string;
  costPrice: number;
  container?: number;
  pieces?: number;
  oz?: number;
}

export interface IProductEdit {
  name: string;
  costPrice: number;
  ingredientCost: number;
  laborCost: number;
  oz?: number;
  container?: number;
  pieces?: number;
  ingredients: IProductIngredient[];
  labors: IProductLabor[];
}

export interface IProduct extends IProductEdit {
  productId?: number;
}

export interface IProductIngredient {
  productIngredientId?: number;
  productId?: number;
  ingredientId: number;
  quantity: number;
  unit: Units;
  totalCostPerItem: number;
}

export interface IProductLabor {
  id?: number;
  laborName: string;
  duration: string;
  workers: number;
  yields: number;
  totalLaborPerItem: string;
  productId?: number;
}

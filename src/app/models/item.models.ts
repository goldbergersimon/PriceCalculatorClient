export type ItemUnits = 'None' | 'Oz' | 'Containers' | 'Pieces';

export type Units =
  | 'None'
  | 'Cups'
  | 'Tbs'
  | 'Tsp'
  | 'Pieces'
  | 'Pounds'
  | 'Oz';

export interface IItemList {
  itemId: number;
  itemName: string;
  costPrice: number;
  wholesalePrice: number;
  retailPrice: number;
  ownPrice: number;
}

export interface IItem {
  itemId?: number;
  itemName: string;
  costPrice: number;
  wholesalePrice: number;
  retailPrice: number;
  ownPrice: number;
  materialCost: number;
  laborCost: number;
  retailProfit: number;
  wholesaleProfit: number;
  ownProfit: number;
  retailMargin: number;
  wholesaleMargin: number;
  ownMargin: number;
  officeExpenses: number;
  includeOfficeExpenses: boolean;
  piecesPerBox: number;
  retailBox: number;
  wholesaleBox: number;
  ownBox: number;

  products: IItemProduct[];
  ingredients: IItemIngredient[];
  labors: IItemLabor[];
}

export interface IItemProduct {
  itemProductId?: number;
  itemId?: number;
  productId: number;
  quantity: number;
  unit: ItemUnits;
  yields: number;
  total: number;
}

export interface IItemIngredient {
  itemIngredientId?: number;
  itemId?: number;
  ingredientId: number;
  quantity: number;
  unit: Units;
  yields: number;
  totalCostPerItem: number;
}

export interface IItemLabor {
  itemLaborId?: number;
  laborName: string;
  duration: string;
  workers: number;
  yields: number;
  totalLaborPerItem: string;
  itemId?: number;
}
export interface Sp {
  selling: number;
  profit: number;
}

export interface Pm {
  margin: number;
  profit: number;
}

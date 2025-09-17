export interface IIngredient {
  ingredientId: number;
  name: string;
  totalCost: number;
  cups: number;
  pricePerCup: number;
  tbs: number;
  pricePerTbs: number;
  tsp: number;
  pricePerTsp: number;
  pieces: number;
  pricePerPiece: number;
  pounds: number;
  pricePerPound: number;
  oz: number;
  pricePerOz: number;

  [key: string]: number | string | undefined;
}

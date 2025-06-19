import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Ingredient {
  ingredientID: number;
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
  containers: number;
  pricePerContainer: number;
  pounds: number;
  pricePerPound: number;
  oz: number;
  pricePerOz: number;

  [key: string]: number | string | undefined;
}

@Injectable({
  providedIn: 'root',
})
export class IngredientService {
  private apiUrl = 'https://localhost:7292/api/ingredient';
  http = inject(HttpClient);

  constructor() {}

  getIngredients(): Observable<Ingredient[]> {
    return this.http.get<Ingredient[]>(this.apiUrl);
  }

  createIngredient(ingredient: Ingredient): Observable<Ingredient> {
    return this.http.post<Ingredient>(this.apiUrl, ingredient);
  }

  updateIngredient(id: number, ingredient: Ingredient): Observable<Ingredient> {
    return this.http.put<Ingredient>(`${this.apiUrl}/${id}`, ingredient);
  }

  deleteIngredient(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  convertBetweenMeasures(cups: number): { tbs: number; tsp: number } {
    const tbs = cups > 0 ? cups * 16 : 0;
    const tsp = cups > 0 ? cups * 48 : 0;
    return { tbs, tsp };
  }

  calculatePricePer(price: number, measure: number): number {
    return price > 0 && measure > 0 ? price / measure : 0;
  }
}

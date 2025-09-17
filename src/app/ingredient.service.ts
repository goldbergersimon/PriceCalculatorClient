import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IIngredient } from './models/ingredient.models';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class IngredientService {
  private apiUrl = `${environment.apiUrl}/ingredient`; //'https://localhost:7292/api/ingredient';
  http = inject(HttpClient);

  getIngredients(): Observable<IIngredient[]> {
    return this.http.get<IIngredient[]>(this.apiUrl);
  }

  createIngredient(ingredient: IIngredient): Observable<IIngredient> {
    return this.http.post<IIngredient>(this.apiUrl, ingredient);
  }

  updateIngredient(
    id: number,
    ingredient: IIngredient
  ): Observable<IIngredient> {
    return this.http.put<IIngredient>(`${this.apiUrl}/${id}`, ingredient);
  }

  deleteIngredient(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  convertBetweenMeasures(
    measure: string,
    amount: number
  ): { result1: number; result2: number } {
    if (measure === 'cups' && amount > 0) {
      const tbs = amount * 16; // 1 cup = 16 tablespoons
      const tsp = amount * 48; // 1 cup = 48 teaspoons
      return { result1: tbs, result2: tsp };
    } else if (measure === 'tbs' && amount > 0) {
      const cups = amount / 16; // 1 tablespoon = 1/16 cup
      const tsp = amount * 3; // 1 tablespoon = 3 teaspoons
      return { result1: cups, result2: tsp };
    } else if (measure === 'tsp' && amount > 0) {
      const cups = amount / 48; // 1 teaspoon = 1/48 cup
      const tbs = amount / 3; // 1 teaspoon = 1/3 tablespoon
      return { result1: cups, result2: tbs };
    }
    return { result1: 0, result2: 0 };
  }

  calculatePricePer(price: number, measure: number): number {
    return price > 0 && measure > 0 ? price / measure : 0;
  }
}

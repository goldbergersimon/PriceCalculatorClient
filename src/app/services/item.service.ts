import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  IItem,
  IItemIngredient,
  IItemList,
  IItemProduct,
} from '../models/item.models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ItemService {
  apiUrl = `${environment.apiUrl}/item`; //'https://localhost:7292/api/item';
  http = inject(HttpClient);

  getAllItems(): Observable<IItemList[]> {
    console.log('Fetching all items from', this.apiUrl);
    return this.http.get<IItemList[]>(this.apiUrl);
  }

  getItemById(id: number): Observable<IItem> {
    return this.http.get<IItem>(`${this.apiUrl}/${id}`);
  }

  getOfficeExpences(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/get-office-expences`);
  }

  saveItem(item: IItem): Observable<IItemList> {
    if (item.itemId) {
      return this.http.put<IItemList>(`${this.apiUrl}/${item.itemId}`, item);
    } else {
      return this.http.post<IItemList>(this.apiUrl, item);
    }
  }
  deleteItem(itemId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${itemId}`);
  }
  calculateIngredientCost(ingredient: IItemIngredient): Observable<number> {
    return this.http.post<number>(
      `${this.apiUrl}/calculate-ingredient`,
      ingredient
    );
  }

  calculateProductCost(product: IItemProduct): Observable<number> {
    return this.http.post<number>(`${this.apiUrl}/calculate-product`, product);
  }

  CalculateProfitMargin(data: {
    margin: number;
    cost: number;
  }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/calculate-profit`, data);
  }

  CalculateMarginProfit(data: {
    selling: number;
    cost: number;
  }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/calculate-margin-profit`, data);
  }
}

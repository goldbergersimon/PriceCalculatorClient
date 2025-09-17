import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IProduct, IProductList } from './models/product.models';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private apiUrl = `${environment.apiUrl}/product`; //'https://localhost:7292/api/product';
  http = inject(HttpClient);

  getProducts(): Observable<IProductList[]> {
    return this.http.get<IProductList[]>(this.apiUrl);
  }

  getProductById(id: number): Observable<IProduct> {
    return this.http.get<IProduct>(`${this.apiUrl}/${id}`);
  }

  saveProduct(product: IProduct): Observable<IProductList> {
    if (!product.productId) {
      return this.http.post<IProductList>(this.apiUrl, product);
    } else {
      return this.http.put<IProductList>(
        `${this.apiUrl}/${product.productId}`,
        product
      );
    }
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  calculateIngredientCost(ingredient: any): Observable<number> {
    return this.http.post<number>(
      `${this.apiUrl}/calculate-ingredient`,
      ingredient
    );
  }

  calculateLabor(labor: any): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/calculate-labor`, labor);
  }

  calculateTotalIngredientCost(totals: number[]): Observable<number> {
    return this.http.post<number>(
      `${this.apiUrl}/calculate-total-ingredient-cost`,
      totals
    );
  }

  calculateTotalLaborCost(labors: any): Observable<number> {
    return this.http.post<number>(
      `${this.apiUrl}/calculate-total-labor-cost`,
      labors
    );
  }
}

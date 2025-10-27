import { LoginFormComponent } from './components/login-form/login-form.component';
import { Routes } from '@angular/router';
import { IngredientComponent } from './components/ingredient/ingredient.component';
import { ProductsComponent } from './components/products/products.component';
import { ItemsComponent } from './components/items/items.component';

export const routes: Routes = [
  { path: 'ingredients', component: IngredientComponent },
  { path: 'recipes', component: ProductsComponent },
  { path: 'items', component: ItemsComponent },
  { path: 'login', component: LoginFormComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];

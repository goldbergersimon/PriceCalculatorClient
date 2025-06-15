import { Component, inject, OnInit } from '@angular/core';
import { DxDataGridModule } from 'devextreme-angular/ui/data-grid';
import { Ingredient, IngredientService } from '../ingredient.service';
import { CommonModule } from '@angular/common';
import notify from 'devextreme/ui/notify';

@Component({
  selector: 'app-ingredient',
  standalone: true,
  imports: [CommonModule, DxDataGridModule],
  templateUrl: './ingredient.component.html',
  styleUrl: './ingredient.component.scss',
})
export class IngredientComponent implements OnInit {
  ingredients: Ingredient[] = [];
  ingredientSvc = inject(IngredientService);

  constructor() {}

  ngOnInit(): void {
    this.ingredientSvc.getIngredients().subscribe({
      next: (data) => (this.ingredients = data),
      error: (err) => {
        console.error('Faild to load ingredients', err);
        notify('Faild to load ingredients', 'error', 4000);
      },
    });
  }

  onRowInserting(e: any): void {
    const newIngredient: Ingredient = e.data;

    e.cansel = true; // Prevent the default insert action
    this.ingredientSvc.createIngredient(newIngredient).subscribe({
      next: () => {},
      error: (err) => {
        console.error('Error creating ingredient:', err);
        notify('Failed to add ingredient.', 'error', 4000);
      },
    });
  }

  onRowUpdating(e: any) {
    const updatedData: Ingredient = { ...e.oldData, ...e.newData };

    this.ingredientSvc
      .updateIngredient(updatedData.ingredientID, updatedData)
      .subscribe({
        next: (result) => {
          console.log('Ingredient updated successfully', result);
          this.ingredients = [...this.ingredients];
        },
        error: (err) => {
          console.error('Error updating ingredient:', err);
        },
      });
  }

  onRowRemoving(e: any) {
    this.ingredientSvc.deleteIngredient(e.data.ingredientID).subscribe({
      next: () => {
        console.log('Ingredient deleted successfully');
        notify('Ingredient deleted successfully', 'success', 3000);
      },
      error: (err: any) => {
        console.error('Error deleting ingredient:', err);
        if (err.status === 400 && err.error?.message) {
          notify(err.error.message, 'error', 4000);
        } else if (err.status === 404) {
          notify('Ingreidient not found.', 'worning', 4000);
        } else {
          notify('An unexpected error occurred.', 'error', 4000);
        }

        e.cancel = true; // Prevent the default delete action
      },
    });
  }

  onEditorPreparing(e: any) {
    if (e.dataField === 'name' && e.parentType === 'dataRow') {
      const isExistingIngredient = !!e.row?.data?.ingredientID;
      if (isExistingIngredient) {
        e.editorOptions.disabled = true; // Disable editing for existing ingredients
      }
    }

    if (
      e.parentType === 'dataRow' &&
      ['cups', 'tbs', 'tsp', 'pieces', 'containers', 'pounds', 'oz'].includes(
        e.dataField
      )
    ) {
      const originalOnValueChanged = e.editorOptions.onValueChanged;
      e.editorOptions.onValueChanged = (args: any) => {
        if (originalOnValueChanged) originalOnValueChanged(args);

        const rowIndex = e.component
          .getVisibleRows()
          .find(
            (r: any) => r.rowType === 'insert' || r.rowType === 'data'
          )?.rowIndex;
        if (rowIndex === undefined) return;

        const get = (field: string) =>
          +e.component.cellValue(rowIndex, field) || 0;
        const round = (value: number) => Math.round(value * 100) / 100;

        const totalCost: number = get('totalCost');
        const cups: number = get('cups');
        const pieces: number = get('pieces');
        const containers: number = get('containers');
        const pounds: number = get('pounds');
        const oz: number = get('oz');

        // Calculate tbs & tsp from cups
        const { tbs, tsp } = this.ingredientSvc.convertBetweenMeasures(cups);
        e.component.cellValue(rowIndex, 'tbs', round(tbs));
        e.component.cellValue(rowIndex, 'tsp', round(tsp));

        // Calculate price per cup, tbs, tsp, piece, container, pound, and oz
        e.component.cellValue(
          rowIndex,
          'pricePerCup',
          round(this.ingredientSvc.calculatePricePer(totalCost, cups))
        );
        e.component.cellValue(
          rowIndex,
          'pricePerTbs',
          round(this.ingredientSvc.calculatePricePer(totalCost, tbs))
        );
        e.component.cellValue(
          rowIndex,
          'pricePerTsp',
          round(this.ingredientSvc.calculatePricePer(totalCost, tsp))
        );
        e.component.cellValue(
          rowIndex,
          'pricePerPiece',
          round(this.ingredientSvc.calculatePricePer(totalCost, pieces))
        );
        e.component.cellValue(
          rowIndex,
          'pricePerContainer',
          round(this.ingredientSvc.calculatePricePer(totalCost, containers))
        );
        e.component.cellValue(
          rowIndex,
          'pricePerPound',
          round(this.ingredientSvc.calculatePricePer(totalCost, pounds))
        );
        e.component.cellValue(
          rowIndex,
          'pricePerOz',
          round(this.ingredientSvc.calculatePricePer(totalCost, oz))
        );
      };
    }
  }
}

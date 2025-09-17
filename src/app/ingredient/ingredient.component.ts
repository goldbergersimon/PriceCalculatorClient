import { Component, inject, OnInit } from '@angular/core';
import { DxDataGridModule } from 'devextreme-angular/ui/data-grid';
import { IngredientService } from '../ingredient.service';
import { CommonModule } from '@angular/common';
import notify from 'devextreme/ui/notify';
import { IIngredient } from '../models/ingredient.models';
import {
  EditorPreparingEvent,
  RowInsertingEvent,
  RowRemovingEvent,
  RowUpdatingEvent,
  RowValidatingEvent,
} from 'devextreme/ui/data_grid';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-ingredient',
  standalone: true,
  imports: [CommonModule, DxDataGridModule],
  templateUrl: './ingredient.component.html',
  styleUrl: './ingredient.component.scss',
})
export class IngredientComponent implements OnInit {
  ingredients: IIngredient[] = [];
  ingredientSvc = inject(IngredientService);

  public currency = { format: { type: 'currency', precision: 2 } };
  fixed2 = { format: { type: 'fixedPoint', precision: 2 } };
  fixed0 = { format: { type: 'fixedPoint', precision: 0 } };
  readOnlyCurrency = {
    readOnly: true,
    inputAttr: { class: 'no-gray' },
    format: { type: 'currency', precision: 2 },
  };

  ngOnInit(): void {
    this.ingredientSvc.getIngredients().subscribe({
      next: (data) => {
        this.ingredients = data;
      },
      error: (err) => {
        console.error('Faild to load ingredients', err);
        notify('Faild to load ingredients', 'error', 4000);
      },
    });
  }

  onRowValidating(e: RowValidatingEvent): void {
    const name: string = e.newData?.name ?? e.oldData?.name ?? '';
    if (!name || !name.trim()) {
      e.isValid = false;
      e.errorText = 'Name is required.';
    }
  }

  onRowInserting(e: RowInsertingEvent): void {
    const newIngredient: IIngredient = e.data;

    e.cancel = true; // Prevent the default insert action
    this.ingredientSvc.createIngredient(newIngredient).subscribe({
      next: (data) => {
        this.ingredients.push(data);
        e.component.cancelEditData();
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error creating ingredient:', err);
        notify('Failed to add ingredient.', 'error', 4000);
      },
    });
  }

  onRowUpdating(e: RowUpdatingEvent): void {
    const updatedData: IIngredient = { ...e.oldData, ...e.newData };

    this.ingredientSvc
      .updateIngredient(updatedData.ingredientId, updatedData)
      .subscribe({
        next: (result) => {
          console.log('Ingredient updated successfully', result);
          this.ingredients = [...this.ingredients];
        },
        error: (err: HttpErrorResponse) => {
          console.error('Error updating ingredient:', err);
          notify('Ingredient not updated', 'error', 4000);
        },
      });
  }

  onRowRemoving(e: RowRemovingEvent): void {
    e.cancel = true; // Prevent the default delete action
    this.ingredientSvc.deleteIngredient(e.data.ingredientId).subscribe({
      next: () => {
        this.ingredients = this.ingredients.filter(
          (ing) => ing.ingredientId !== e.data.ingredientId
        );
        console.log('Ingredient deleted successfully');
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error deleting ingredient:', err);
        if (err.status === 400 && err.error?.message) {
          notify(err.error.message, 'error', 4000);
        } else if (err.status === 404) {
          notify('Ingreidient not found.', 'worning', 3000);
        } else {
          notify('An unexpected error occurred.', 'error', 3000);
        }
      },
    });
  }

  onEditorPreparing(e: EditorPreparingEvent): void {
    if (e.dataField === 'name' && e.parentType === 'dataRow') {
      const isExistingIngredient = !!e.row?.data?.ingredientId;
      if (isExistingIngredient) {
        e.editorOptions.readOnly = true; // Disable editing for existing ingredients
      }
    }

    if (
      e.parentType === 'dataRow' &&
      ['cups', 'tbs', 'tsp', 'pieces', 'pounds', 'oz', 'totalCost'].includes(
        e.dataField as string
      )
    ) {
      const originalOnValueChanged = e.editorOptions.onValueChanged;
      e.editorOptions.onValueChanged = (args: any) => {
        if (originalOnValueChanged) originalOnValueChanged(args);

        const rowIndex = e.row?.rowIndex;
        // If rowIndex is undefined, it means the row is not yet rendered or is being edited,
        // so we should not proceed with calculations.
        if (rowIndex === undefined) return;

        const get = (field: string) =>
          +e.component.cellValue(rowIndex, field) || 0;
        const round = (value: number) => Math.round(value * 100) / 100;

        const editField = e.dataField as string;
        const value = get(editField);

        // Calculate tbs & tsp from cups
        if (editField === 'cups') {
          const { result1: tbs, result2: tsp } =
            this.ingredientSvc.convertBetweenMeasures('cups', value);
          e.component.cellValue(rowIndex, 'tbs', round(tbs));
          e.component.cellValue(rowIndex, 'tsp', round(tsp));
        } else if (editField === 'tbs') {
          const { result1: cups, result2: tsp } =
            this.ingredientSvc.convertBetweenMeasures('tbs', value);
          e.component.cellValue(rowIndex, 'cups', round(cups));
          e.component.cellValue(rowIndex, 'tsp', round(tsp));
        } else if (editField === 'tsp') {
          const { result1: cups, result2: tbs } =
            this.ingredientSvc.convertBetweenMeasures('tsp', value);
          e.component.cellValue(rowIndex, 'cups', round(cups));
          e.component.cellValue(rowIndex, 'tbs', round(tbs));
        }

        const totalCost: number = get('totalCost');
        const cups: number = get('cups');
        const tbs: number = get('tbs');
        const tsp: number = get('tsp');
        const pieces: number = get('pieces');
        const pounds: number = get('pounds');
        const oz: number = get('oz');

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

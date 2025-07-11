import { Component } from '@angular/core';
import { DxTextBoxModule } from 'devextreme-angular';

@Component({
  selector: 'app-settings',
  imports: [DxTextBoxModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent {}

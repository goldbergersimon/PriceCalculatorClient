import { Settings, SettingService } from './../setting.service';
import {
  Component,
  EventEmitter,
  inject,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import {
  DxDataGridComponent,
  DxDataGridModule,
} from 'devextreme-angular/ui/data-grid';
import { DxButtonModule } from 'devextreme-angular';
import notify from 'devextreme/ui/notify';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [DxDataGridModule, DxButtonModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent implements OnInit {
  settingsSvc = inject(SettingService);
  @Output() settingsUpdated = new EventEmitter<void>();
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid!: DxDataGridComponent;
  settings: Settings[] = [];

  ngOnInit(): void {
    this.settingsSvc.get().subscribe({
      next: (data) => {
        console.log('Settings fetched:', data);
        this.settings = data;
      },
      error: (err) => {
        console.error('Error fetching settings:', err);
      },
    });
  }

  formatKey(rowData: any) {
    return rowData.key.replace(/([a-z])([A-Z])/g, '$1 $2');
  }

  saveSettings() {
    this.dataGrid.instance.saveEditData();
    this.settingsSvc.SaveSettings(this.settings).subscribe({
      next: () => {
        this.settingsUpdated.emit();
      },
      error: (err) => {
        console.error('Error saving settings', err);
        notify('Error saving settings', 'error', 4000);
      },
    });
  }
}

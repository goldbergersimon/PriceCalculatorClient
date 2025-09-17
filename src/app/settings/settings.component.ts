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
import { DxButtonModule, DxLoadIndicatorModule } from 'devextreme-angular';
import notify from 'devextreme/ui/notify';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [DxDataGridModule, DxButtonModule, DxLoadIndicatorModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent implements OnInit {
  settingsSvc = inject(SettingService);
  @Output() settingsUpdated = new EventEmitter<void>();
  @ViewChild(DxDataGridComponent, { static: false })
  dataGrid!: DxDataGridComponent;
  settings: Settings[] = [];
  updating = false;

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

  formatKey(rowData: Settings) {
    return rowData.key.replace(/([a-z])([A-Z])/g, '$1 $2');
  }

  saveSettings() {
    this.dataGrid.instance.saveEditData();
    this.updating = true;
    this.settingsSvc.SaveSettings(this.settings).subscribe({
      next: () => {
        this.updating = false;
        this.settingsUpdated.emit();
      },
      error: (err) => {
        this.updating = false;
        this.settingsUpdated.emit();
        console.error('Error saving settings', err);
        notify('Error saving settings', 'error', 4000);
      },
    });
  }
}

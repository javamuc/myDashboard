import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { DataService } from './data.service';
import { AlertService } from 'app/core/util/alert.service';

@Component({
  selector: 'jhi-data',
  templateUrl: './data.component.html',
  styleUrls: ['./data.component.scss'],
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
})
export class DataComponent {
  loading = false;
  private readonly dataService = inject(DataService);
  private readonly alertService = inject(AlertService);

  async downloadData(): Promise<void> {
    try {
      this.loading = true;
      const exportData = await this.dataService.exportData();
      const filename = `myDashboard_export_${new Date().toISOString().split('T')[0]}.json`;
      this.dataService.downloadJson(exportData, filename);
      this.alertService.addAlert({
        type: 'success',
        message: 'Data exported successfully!',
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      this.alertService.addAlert({
        type: 'danger',
        message: 'Failed to export data. Please try again.',
      });
    } finally {
      this.loading = false;
    }
  }

  async handleFileUpload(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) {
      return;
    }

    const file = input.files[0];
    // TODO: Implement file upload and data import
    console.warn('Uploading file:', file.name);
  }
}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'jhi-data',
  templateUrl: './data.component.html',
  styleUrls: ['./data.component.scss'],
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
})
export class DataComponent {
  downloadData(): void {
    // TODO: Implement data download
    console.warn('Downloading data...');
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

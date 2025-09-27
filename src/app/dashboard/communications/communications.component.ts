import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';

interface District {
  id: number;
  districtName: string;
}

interface Communication {
  id: number;
  createdDate: string;
  subject: string;
  message: string;
  document?: string;
}

@Component({
  selector: 'app-communication',
  templateUrl: './communications.component.html',
  styleUrls: ['./communications.component.css']
})
export class CommunicationsComponent {
  constructor(private router: Router) {}

  @Output() modalClosed = new EventEmitter<void>();
  @Output() communicationSent = new EventEmitter<any>();
  
  districts: District[] = [
    { id: 1, districtName: 'Patna' },
    { id: 2, districtName: 'Gya' },
    { id: 3, districtName: 'Buxar' },
    { id: 4, districtName: 'Siwan' }
  ];

  communications: Communication[] = [
    { id: 1, createdDate: '2025-09-25', subject: 'Notice 1', message: 'Message content', document: 'doc1.pdf' },
    { id: 2, createdDate: '2025-09-24', subject: 'Notice 2', message: 'Another message' }
  ];

  selectedDistricts: number[] = [];
  communicationName = '';
  message = '';
  attachments: File[] = [];
  showModal = false;

  startNew() {
    this.showModal = true;
  }

  detail() {
    this.router.navigate(['/dashboard/communication/message']);
  }

  closeModal() {
    this.showModal = false;
    this.modalClosed.emit();
  }

  // District checkbox methods
  onDistrictCheckboxChange(districtId: number, event: any) {
    if (event.target.checked) {
      if (!this.selectedDistricts.includes(districtId)) {
        this.selectedDistricts.push(districtId);
      }
    } else {
      const index = this.selectedDistricts.indexOf(districtId);
      if (index > -1) {
        this.selectedDistricts.splice(index, 1);
      }
    }
  }

  selectAllDistricts() {
    this.selectedDistricts = this.districts.map(d => d.id);
  }

  clearAllDistricts() {
    this.selectedDistricts = [];
  }

  onFileChange(event: any): void {
    const files = event.target.files;
    if (files) {
      this.attachments = Array.from(files);
    }
  }

  onSubmit() {
    if (this.isFormValid()) {
      const communicationData = {
        districts: this.selectedDistricts,
        subject: this.communicationName,
        message: this.message,
        attachments: this.attachments,
        timestamp: new Date()
      };

      // Emit the data to parent component
      this.communicationSent.emit(communicationData);

      // Here you would typically send to your backend service
      this.sendCommunicationToBackend(communicationData);
      console.log("submit data");
      
      this.closeModal();
    }
  }

  // Function to validate the form
  private isFormValid(): boolean {
    if (this.selectedDistricts.length === 0) {
      alert('Please select at least one district');
      return false;
    }

    if (!this.communicationName.trim()) {
      alert('Please enter a subject');
      return false;
    }

    if (!this.message.trim()) {
      alert('Please enter a message');
      return false;
    }

    return true;
  }

  // Function to send data to backend (example implementation)
  private sendCommunicationToBackend(data: any): void {
    // Create FormData for file upload
    const formData = new FormData();
    
    // Append basic data
    formData.append('districts', JSON.stringify(data.districts));
    formData.append('subject', data.subject);
    formData.append('message', data.message);
    formData.append('timestamp', data.timestamp.toISOString());

    // Append files
    data.attachments.forEach((file: File, index: number) => {
      formData.append(`attachments`, file, file.name);
    });

    // Example API call - replace with your actual service
    /*
    this.communicationService.sendCommunication(formData).subscribe({
      next: (response) => {
        console.log('Communication sent successfully', response);
        alert('Communication sent successfully!');
      },
      error: (error) => {
        console.error('Error sending communication', error);
        alert('Error sending communication. Please try again.');
      }
    });
    */
  }

  removeFile(index: number): void {
    this.attachments.splice(index, 1);
  }

  getSelectedDistrictNames(): string[] {
    return this.selectedDistricts.map(districtId => {
      const district = this.districts.find(d => d.id === districtId);
      return district ? district.districtName : '';
    }).filter(name => name !== '');
  }
}
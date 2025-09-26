import { Component } from '@angular/core';
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
  styleUrls: ['./communications.component.css'],
 
})
export class CommunicationsComponent {
  constructor(private router:Router){

  }
  districts: District[] = [
    { id: 1, districtName: 'District A' },
    { id: 2, districtName: 'District B' },
    { id: 3, districtName: 'District C' }
  ];

  communications: Communication[] = [
    { id: 1, createdDate: '2025-09-25', subject: 'Notice 1', message: 'Message content', document: 'doc1.pdf' },
    { id: 2, createdDate: '2025-09-24', subject: 'Notice 2', message: 'Another message' }
  ];

  selectedDistricts: number[] = [];
  communicationName = '';
  message = '';
  attachments: File[] = [];

  startNew() {
    const modal = document.getElementById('newCommunicationModal');
    if (modal) {
      modal.style.display = 'block';
    }
  }
  detail(){
      this.router.navigate(['/dashboard/communication/message']);
  }

  closeModal() {
    const modal = document.getElementById('newCommunicationModal');
    if (modal) {
      modal.style.display = 'none';
    }
  }

  onFileChange(event: any) {
    this.attachments = Array.from(event.target.files);
  }

  onSubmit() {
    console.log('Form submitted:', {
      districts: this.selectedDistricts,
      subject: this.communicationName,
      message: this.message,
      attachments: this.attachments
    });
    this.closeModal();
  }
}

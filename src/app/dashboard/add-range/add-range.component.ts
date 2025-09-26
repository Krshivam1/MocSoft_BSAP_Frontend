import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

interface Range {
  id?: number;
  stateName: string;
  rangeName: string;
  rangeHead: string;
  rangeContactNo: string;
  rangeMobileNo: string;
  rangeEmail: string;
  rangeDiscription: string;
  rangeImage?: string;
  rangePersonImage?: string;
  active: boolean;
  stateId: number;
}

interface State {
  id: number;
  stateName: string;
  stateDescription: string;
  active: boolean;
}

@Component({
  selector: 'app-range-form',
  templateUrl: './add-range.component.html',
  styleUrls: ['./add-range.component.css'],
  standalone:true,
  imports:[FormsModule,CommonModule]
})
export class AddRangeComponent implements OnInit {
  range: Range = this.getDefaultRange();
  states: State[] = [];
  isEditMode = false;
  submitted = false;
  isLoading = false;
  rangeImageName = '';
  rangePersonImageName = '';

  // Mock states data
  private mockStates: State[] = [
    { id: 1, stateName: 'Maharashtra', stateDescription: 'Maharashtra State', active: true },
    { id: 2, stateName: 'Karnataka', stateDescription: 'Karnataka State', active: true },
    { id: 3, stateName: 'Tamil Nadu', stateDescription: 'Tamil Nadu State', active: true },
    { id: 4, stateName: 'Gujarat', stateDescription: 'Gujarat State', active: true },
    { id: 5, stateName: 'Bihar', stateDescription: 'Bihar State', active: true }
  ];

  // Mock ranges data for editing
  private mockRanges: Range[] = [
    {
      id: 1,
      stateName: 'Maharashtra',
      rangeName: 'Mumbai Range',
      rangeHead: 'John Doe',
      rangeContactNo: '0221234567',
      rangeMobileNo: '9876543210',
      rangeEmail: 'mumbai.range@example.com',
      rangeDiscription: 'Mumbai metropolitan area range',
      active: true,
      stateId: 1
    }
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadStates();
    
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.loadRange(parseInt(id));
    }
  }

  private getDefaultRange(): Range {
    return {
      stateName: '',
      rangeName: '',
      rangeHead: '',
      rangeContactNo: '',
      rangeMobileNo: '',
      rangeEmail: '',
      rangeDiscription: '',
      active: true,
      stateId: 0
    };
  }

  loadStates(): void {
    this.states = this.mockStates;
  }

  loadRange(id: number): void {
    const foundRange = this.mockRanges.find(r => r.id === id);
    if (foundRange) {
      this.range = { ...foundRange };
    }
  }

  onFileSelected(event: any, type: string): void {
    const file = event.target.files[0];
    if (file) {
      if (type === 'rangeImage') {
        this.rangeImageName = file.name;
        this.range.rangeImage = URL.createObjectURL(file);
      } else {
        this.rangePersonImageName = file.name;
        this.range.rangePersonImage = URL.createObjectURL(file);
      }
    }
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  isValidMobileNo(mobile: string): boolean {
    const mobileRegex = /^[0-9]{10}$/;
    return mobileRegex.test(mobile);
  }

  isValidContactNo(contact: string): boolean {
    const contactRegex = /^[0-9]{7,10}$/;
    return contactRegex.test(contact);
  }

  onSubmit(): void {
    this.submitted = true;

    if (!this.range.stateId || !this.range.rangeName || !this.range.rangeHead || 
        !this.range.rangeContactNo || !this.range.rangeMobileNo || 
        !this.range.rangeEmail || !this.range.rangeDiscription) {
      return;
    }

    if (!this.isValidEmail(this.range.rangeEmail) || 
        !this.isValidMobileNo(this.range.rangeMobileNo) || 
        !this.isValidContactNo(this.range.rangeContactNo)) {
      return;
    }

    this.isLoading = true;

    // Simulate API call
    setTimeout(() => {
      this.isLoading = false;
      
      if (this.isEditMode) {
        console.log('Range updated:', this.range);
        alert('Range updated successfully!');
      } else {
        console.log('Range created:', this.range);
        alert('Range created successfully!');
      }
      
      this.goBack();
    }, 1000);
  }

  goBack(): void {
    this.router.navigate(['dashboard/range']);

  }
}
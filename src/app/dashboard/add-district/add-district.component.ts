import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// Interfaces
export interface District {
  id?: number;
  rangeId: number;
  districtName: string;
  districtHead: string;
  districtMobileNo: string;
  districtContactNo: string;
  districtEmail: string;
  districtArea: number;
  districtDescription: string;
  districtImage?: File;
  districtHeadImage?: File;
  districtImageUrl?: string;
  districtHeadImageUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Range {
  id: number;
  rangeName: string;
  stateId: number;
  stateName?: string;
}

// Mock data service (Replace with actual API calls)
class MockDistrictService {
  private districts: District[] = [
    {
      id: 1,
      rangeId: 1,
      districtName: 'Central District',
      districtHead: 'John Smith',
      districtMobileNo: '9876543210',
      districtContactNo: '0413123456',
      districtEmail: 'central.district@example.com',
      districtArea: 1500,
      districtDescription: 'Central business district with high commercial activity',
      districtImageUrl: 'assets/images/district1.jpg',
      districtHeadImageUrl: 'assets/images/head1.jpg'
    }
  ];

  private ranges: Range[] = [
    { id: 1, rangeName: 'Northern Range', stateId: 1 },
    { id: 2, rangeName: 'Southern Range', stateId: 1 },
    { id: 3, rangeName: 'Eastern Range', stateId: 2 },
    { id: 4, rangeName: 'Western Range', stateId: 2 }
  ];

  getDistricts(): Promise<District[]> {
    return Promise.resolve(this.districts);
  }

  getDistrictById(id: number): Promise<District> {
    const district = this.districts.find(d => d.id === id);
    return district ? Promise.resolve(district) : Promise.reject('District not found');
  }

  addDistrict(district: District): Promise<District> {
    const newDistrict = {
      ...district,
      id: Math.max(...this.districts.map(d => d.id || 0)) + 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.districts.push(newDistrict);
    return Promise.resolve(newDistrict);
  }

  updateDistrict(district: District): Promise<District> {
    const index = this.districts.findIndex(d => d.id === district.id);
    if (index !== -1) {
      this.districts[index] = {
        ...this.districts[index],
        ...district,
        updatedAt: new Date()
      };
      return Promise.resolve(this.districts[index]);
    }
    return Promise.reject('District not found');
  }

  getRanges(): Promise<Range[]> {
    return Promise.resolve(this.ranges);
  }
}

@Component({
  selector: 'app-add-district',
  templateUrl: './add-district.component.html',
  styleUrls: ['./add-district.component.css'],
  standalone:true,
  imports:[FormsModule,ReactiveFormsModule,CommonModule],
})
export class AddDistrictComponent implements OnInit, OnDestroy {
  districtForm: FormGroup;
  ranges: Range[] = [];
  isEditMode = false;
  districtImageName: string = '';
  districtHeadImageName: string = '';
  isLoading = false;
  submitted = false;
  districtImageFile: File | null = null;
  districtHeadImageFile: File | null = null;

  // Success/Error messages
  message: string = '';
  messageType: 'success' | 'error' | '' = '';

  private destroy$ = new Subject<void>();
  private mockService = new MockDistrictService();

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.districtForm = this.createForm();
  }

 async ngOnInit(): Promise<void> {
  // Load ranges first
  await this.loadRanges();

  // Check if we're in edit mode
  const districtId = this.route.snapshot.params['id'];
  if (districtId) {
    this.isEditMode = true;
    await this.loadDistrictForEdit(parseInt(districtId, 10));
  }

  // Subscribe to form changes for real-time validation
  this.districtForm.valueChanges
    .pipe(takeUntil(this.destroy$))
    .subscribe(() => this.clearMessage());
}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  createForm(): FormGroup {
    return this.fb.group({
      id: [null],
      rangeId: ['', [Validators.required]],
      districtName: ['', [
        Validators.required, 
        Validators.minLength(2),
        Validators.maxLength(100),
        this.noWhitespaceValidator
      ]],
      districtHead: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100),
        this.noWhitespaceValidator
      ]],
      districtMobileNo: ['', [
        Validators.required, 
        Validators.pattern(/^[6-9]\d{9}$/), // Indian mobile number pattern
        Validators.minLength(10),
        Validators.maxLength(10)
      ]],
      districtContactNo: ['', [
        Validators.required, 
        Validators.pattern(/^[0-9]{7,10}$/),
        Validators.minLength(7),
        Validators.maxLength(10)
      ]],
      districtEmail: ['', [
        Validators.required, 
        Validators.email,
        Validators.pattern(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/i)
      ]],
      districtArea: ['', [
        Validators.required, 
        Validators.min(0.1),
        Validators.max(999999.99)
      ]],
      districtDescription: ['', [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(1000)
      ]]
    });
  }

  // Custom validator to prevent only whitespace
  noWhitespaceValidator(control: AbstractControl) {
    if (control.value && control.value.trim().length === 0) {
      return { whitespace: true };
    }
    return null;
  }

async loadRanges(): Promise<void> {
  this.isLoading = true;
  try {
    const result = await this.mockService.getRanges(); // fetch ranges
    console.log("result",result);
    
    if (Array.isArray(result)) {
      this.ranges = result; // assign only if result is array
      console.log("ranges list",this.ranges);
      
    } else {
      console.warn('Received invalid ranges data:', result);
      this.ranges = [];
    }
  } catch (error) {
    console.error('Error loading ranges:', error);
    this.ranges = [];
    this.showMessage?.('Failed to load ranges. Please try again.', 'error');
  } finally {
    this.isLoading = false;
  }
}


  async loadDistrictForEdit(id: number): Promise<void> {
    try {
      this.isLoading = true;
      const district = await this.mockService.getDistrictById(id);
      
      this.districtForm.patchValue({
        id: district.id,
        rangeId: district.rangeId,
        districtName: district.districtName,
        districtHead: district.districtHead,
        districtMobileNo: district.districtMobileNo,
        districtContactNo: district.districtContactNo,
        districtEmail: district.districtEmail,
        districtArea: district.districtArea,
        districtDescription: district.districtDescription
      });

      // Set file names if images exist
      if (district.districtImageUrl) {
        this.districtImageName = 'Current image uploaded';
      }
      if (district.districtHeadImageUrl) {
        this.districtHeadImageName = 'Current head image uploaded';
      }

    } catch (error) {
      console.error('Error loading district:', error);
      this.showMessage('Failed to load district data. Please try again.', 'error');
      this.router.navigate(['/district']);
    } finally {
      this.isLoading = false;
    }
  }

  onFileSelected(event: any, fileType: string): void {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      const maxSize = 5 * 1024 * 1024; // 5MB
      
      if (!validTypes.includes(file.type)) {
        this.showMessage('Please select a valid image file (JPG, JPEG, PNG only)', 'error');
        this.clearFileInput(event.target);
        return;
      }
      
      if (file.size > maxSize) {
        this.showMessage('File size must be less than 5MB', 'error');
        this.clearFileInput(event.target);
        return;
      }
      
      if (fileType === 'districtImage') {
        this.districtImageName = file.name;
        this.districtImageFile = file;
        this.showMessage('District image selected successfully', 'success');
      } else if (fileType === 'districtHeadImage') {
        this.districtHeadImageName = file.name;
        this.districtHeadImageFile = file;
        this.showMessage('District head image selected successfully', 'success');
      }
    }
  }

  clearFileInput(input: HTMLInputElement): void {
    input.value = '';
  }

  async onSubmit(): Promise<void> {
    this.submitted = true;
    
    if (this.districtForm.valid) {
      this.isLoading = true;
      
      try {
        const districtData: District = {
          ...this.districtForm.value,
          districtImage: this.districtImageFile || undefined,
          districtHeadImage: this.districtHeadImageFile || undefined
        };

        let result: District;
        
        if (this.isEditMode) {
          result = await this.mockService.updateDistrict(districtData);
          this.showMessage('District updated successfully! Redirecting...', 'success');
        } else {
          result = await this.mockService.addDistrict(districtData);
          this.showMessage('District added successfully! Redirecting...', 'success');
        }

        // Redirect after success
        setTimeout(() => {
          this.router.navigate(['dashboard/district']);
        }, 2000);

      } catch (error) {
        console.error('Error saving district:', error);
        this.showMessage(
          `Failed to ${this.isEditMode ? 'update' : 'add'} district. Please try again.`, 
          'error'
        );
      } finally {
        this.isLoading = false;
      }
    } else {
      // Mark all fields as touched to show validation errors
      this.markFormGroupTouched(this.districtForm);
      this.showMessage('Please fix the validation errors before submitting.', 'error');
    }
  }

  markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else {
        control?.markAsTouched();
      }
    });
  }

  goBack(): void {
    if (this.districtForm.dirty && !this.submitted) {
      const confirmLeave = confirm('You have unsaved changes. Are you sure you want to leave?');
      if (!confirmLeave) return;
    }
    this.router.navigate(['dashboard/district']);
  }

  showMessage(message: string, type: 'success' | 'error'): void {
    this.message = message;
    this.messageType = type;
    
    // Auto-hide success messages after 5 seconds
    if (type === 'success') {
      setTimeout(() => {
        this.clearMessage();
      }, 5000);
    }
  }

  clearMessage(): void {
    this.message = '';
    this.messageType = '';
  }

  // Field validation helpers for template
  isFieldInvalid(fieldName: string): boolean {
    const field = this.districtForm.get(fieldName);
    return !!(field && field.invalid && (field.touched || this.submitted));
  }

  getFieldError(fieldName: string): string {
    const field = this.districtForm.get(fieldName);
    if (field && field.errors && (field.touched || this.submitted)) {
      const errors = field.errors;
      
      if (errors['required']) return 'This field is required';
      if (errors['email']) return 'Please enter a valid email address';
      if (errors['pattern']) {
        switch (fieldName) {
          case 'districtMobileNo':
            return 'Please enter a valid 7-10 digit mobile number';
          case 'districtContactNo':
            return 'Please enter a valid 7-10 digit contact number';
          case 'districtEmail':
            return 'Please enter a valid email address (e.g., example@domain.com)';
          default:
            return 'Invalid format';
        }
      }
      if (errors['minlength']) return `Minimum ${errors['minlength'].requiredLength} characters required`;
      if (errors['maxlength']) return `Maximum ${errors['maxlength'].requiredLength} characters allowed`;
      if (errors['min']) return `Value must be greater than or equal to ${errors['min'].min}`;
      if (errors['max']) return `Value must be less than or equal to ${errors['max'].max}`;
      if (errors['whitespace']) return 'This field cannot contain only whitespace';
    }
    return '';
  }

  // Getters for easy access to form controls in template
  get id() { return this.districtForm.get('id'); }
  get rangeId() { return this.districtForm.get('rangeId'); }
  get districtName() { return this.districtForm.get('districtName'); }
  get districtHead() { return this.districtForm.get('districtHead'); }
  get districtMobileNo() { return this.districtForm.get('districtMobileNo'); }
  get districtContactNo() { return this.districtForm.get('districtContactNo'); }
  get districtEmail() { return this.districtForm.get('districtEmail'); }
  get districtArea() { return this.districtForm.get('districtArea'); }
  get districtDescription() { return this.districtForm.get('districtDescription'); }

  // Utility method to format file size
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
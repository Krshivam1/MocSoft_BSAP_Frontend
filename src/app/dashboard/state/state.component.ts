import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface State {
  id: number;
  name: string;
  description: string;
  active: boolean;
}

@Component({
  selector: 'app-state-management',
  templateUrl: './state.component.html',
    standalone: true,
  styleUrls: ['./state.component.css'],
    imports: [CommonModule, FormsModule,ReactiveFormsModule],
  
})
export class StateComponent implements OnInit {
  states: State[] = [
    { id: 1, name: 'Bihar', description: 'Bihar State', active: true },
    { id: 2, name: 'Maharashtra', description: 'Maharashtra State', active: true },
    { id: 3, name: 'Tamil Nadu', description: 'Tamil Nadu State', active: false },
    { id: 4, name: 'Karnataka', description: 'Karnataka State', active: true },
    { id: 5, name: 'Gujarat', description: 'Gujarat State', active: true },
    { id: 6, name: 'Rajasthan', description: 'Rajasthan State', active: false },
    { id: 7, name: 'West Bengal', description: 'West Bengal State', active: true },
    { id: 8, name: 'feger', description: 'gerge', active: true }
  ];

  filteredStates: State[] = [];
  searchText: string = '';
  currentPage: number = 1;
  entriesPerPage: number = 10;
  totalPages: number = 1;

  // Reactive forms
  addStateForm: FormGroup;
  editStateForm: FormGroup;

  constructor(
    private modalService: NgbModal,
    private fb: FormBuilder
  ) {
    // Initialize forms
    this.addStateForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      active: [true]
    });

    this.editStateForm = this.fb.group({
      id: [0],
      name: ['', Validators.required],
      description: ['', Validators.required],
      active: [true]
    });
  }

  ngOnInit(): void {
    this.filterStates();
    this.calculateTotalPages();
  }

  filterStates(): void {
    if (!this.searchText) {
      this.filteredStates = [...this.states];
    } else {
      const searchLower = this.searchText.toLowerCase();
      this.filteredStates = this.states.filter(state => 
        state.name.toLowerCase().includes(searchLower) || 
        state.description.toLowerCase().includes(searchLower)
      );
    }
    this.currentPage = 1;
    this.calculateTotalPages();
  }

  calculateTotalPages(): void {
    this.totalPages = Math.ceil(this.filteredStates.length / this.entriesPerPage);
  }

  onEntriesPerPageChange(): void {
    this.currentPage = 1;
    this.calculateTotalPages();
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  get paginatedStates(): State[] {
    const startIndex = (this.currentPage - 1) * this.entriesPerPage;
    return this.filteredStates.slice(startIndex, startIndex + this.entriesPerPage);
  }

  get showingStart(): number {
    return (this.currentPage - 1) * this.entriesPerPage + 1;
  }

  get showingEnd(): number {
    return Math.min(this.currentPage * this.entriesPerPage, this.filteredStates.length);
  }

  openAddModal(content: any): void {
    this.addStateForm.reset({
      name: '',
      description: '',
      active: true
    });
    this.modalService.open(content, { ariaLabelledBy: 'addStateModalLabel' });
  }

  openEditModal(content: any, state: State): void {
    this.editStateForm.patchValue({
      id: state.id,
      name: state.name,
      description: state.description,
      active: state.active
    });
    this.modalService.open(content, { ariaLabelledBy: 'editStateModalLabel' });
  }

  addState(): void {
    if (this.addStateForm.valid) {
      const newId = Math.max(...this.states.map(s => s.id)) + 1;
      const newState: State = {
        id: newId,
        name: this.addStateForm.value.name,
        description: this.addStateForm.value.description,
        active: this.addStateForm.value.active
      };
      
      this.states.push(newState);
      this.filterStates();
      this.modalService.dismissAll();
      
      // In a real application, you would show a toast notification
      console.log('State added successfully!');
    }
  }

  updateState(): void {
    if (this.editStateForm.valid) {
      const updatedState: State = {
        id: this.editStateForm.value.id,
        name: this.editStateForm.value.name,
        description: this.editStateForm.value.description,
        active: this.editStateForm.value.active
      };
      
      const index = this.states.findIndex(s => s.id === updatedState.id);
      if (index !== -1) {
        this.states[index] = updatedState;
        this.filterStates();
        this.modalService.dismissAll();
        
        // In a real application, you would show a toast notification
        console.log('State updated successfully!');
      }
    }
  }

  toggleStateStatus(state: State): void {
    state.active = !state.active;
    const status = state.active ? 'activated' : 'deactivated';
    
    // In a real application, you would show a toast notification
    console.log(`State ${status} successfully!`);
  }

  deleteState(state: State): void {
    if (confirm(`Are you sure you want to delete ${state.name}?`)) {
      this.states = this.states.filter(s => s.id !== state.id);
      this.filterStates();
      
      // In a real application, you would show a toast notification
      console.log('State deleted successfully!');
    }
  }

  // Helper methods for template
  get addStateName() { return this.addStateForm.get('name'); }
  get addStateDescription() { return this.addStateForm.get('description'); }
  get editStateName() { return this.editStateForm.get('name'); }
  get editStateDescription() { return this.editStateForm.get('description'); }
}
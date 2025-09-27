import { Component, OnInit } from '@angular/core';

interface State {
  id: number;
  name: string;
  description: string;
  active: boolean;
}

@Component({
  selector: 'app-state-management',
  templateUrl: './state.component.html',
  styleUrls: ['./state.component.css'],
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
    { id: 8, name: 'West Bengal 2', description: 'Test State', active: true }
  ];

  filteredStates: State[] = [];
  searchText: string = '';
  currentPage: number = 1;
  entriesPerPage: number = 10;
  totalPages: number = 1;

  // Modal and form states
  showModal = false;
  isEditMode = false;
  isLoading = false;
  currentState: State = { id: 0, name: '', description: '', active: true };
  
  // Sorting
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor() {}

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

  // Modal methods
  showAddStateModal(): void {
    this.currentState = { id: 0, name: '', description: '', active: true };
    this.isEditMode = false;
    this.showModal = true;
  }

  editState(state: State): void {
    this.currentState = { ...state };
    this.isEditMode = true;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.isEditMode = false;
    this.currentState = { id: 0, name: '', description: '', active: true };
  }

  addState(): void {
    if (this.currentState.name.trim() && this.currentState.description.trim()) {
      this.isLoading = true;
      
      const newId = Math.max(...this.states.map(s => s.id)) + 1;
      const newState: State = {
        id: newId,
        name: this.currentState.name.trim(),
        description: this.currentState.description.trim(),
        active: this.currentState.active
      };
      
      this.states.push(newState);
      this.filterStates();
      this.closeModal();
      this.isLoading = false;
      
      console.log('State added successfully!');
    }
  }

  updateState(): void {
    if (this.currentState.name.trim() && this.currentState.description.trim()) {
      this.isLoading = true;
      
      const index = this.states.findIndex(s => s.id === this.currentState.id);
      if (index !== -1) {
        this.states[index] = {
          ...this.currentState,
          name: this.currentState.name.trim(),
          description: this.currentState.description.trim()
        };
        this.filterStates();
        this.closeModal();
        this.isLoading = false;
        
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

  // Sorting methods
  sortTable(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    
    this.filteredStates.sort((a, b) => {
      let valueA = a[column as keyof State];
      let valueB = b[column as keyof State];
      
      if (typeof valueA === 'string') {
        valueA = valueA.toLowerCase();
        valueB = (valueB as string).toLowerCase();
      }
      
      if (valueA < valueB) {
        return this.sortDirection === 'asc' ? -1 : 1;
      }
      if (valueA > valueB) {
        return this.sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  // Pagination methods
  goToPage(page: number): void {
    this.currentPage = page;
  }

  getVisiblePages(): number[] {
    const totalPages = this.totalPages;
    const current = this.currentPage;
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, current - delta); i <= Math.min(totalPages - 1, current + delta); i++) {
      range.push(i);
    }

    if (current - delta > 2) {
      rangeWithDots.push(1, -1);
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (current + delta < totalPages - 1) {
      rangeWithDots.push(-1, totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots.filter((v, i, arr) => arr.indexOf(v) === i && v > 0);
  }

  getTotalPages(): number {
    return Math.ceil(this.filteredStates.length / this.entriesPerPage);
  }

  // TrackBy function for better performance
  trackByStateId(index: number, state: State): number {
    return state.id;
  }
}
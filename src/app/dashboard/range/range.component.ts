import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface Range {
  id: number;
  stateName: string;
  rangeName: string;
  rangeHead: string;
  rangeContactNo: string;
  rangeMobileNo: string;
  rangeEmail: string;
  rangeDescription: string;
  rangeImage?: string;
  rangePersonImage?: string;
  active: boolean;
  stateId: number;
}

@Component({
  selector: 'app-range',
  templateUrl: './range.component.html',
  styleUrls: ['./range.component.css'],
})
export class RangeComponent implements OnInit {
  // Data properties
  ranges: Range[] = [];
  filteredRanges: Range[] = [];
  paginatedRanges: Range[] = [];
  
  // State management
  isLoading: boolean = false;
  
  // Search and filter
  searchTerm: string = '';
  
  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;
  pageSize: number = 10;
  totalPages: number = 0;
  totalItems: number = 0;
  
  // Sorting
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  
  // Modal states
  showModal: boolean = false;
  isEditMode: boolean = false;
  
  // Current data
  currentRange: Range = this.createEmptyRange();
  
  // Math reference for template
  Math = Math;

  // Mock data
  private mockRanges: Range[] = [
    {
      id: 1,
      stateName: 'Maharashtra',
      rangeName: 'Mumbai Range',
      rangeHead: 'John Doe',
      rangeContactNo: '0221234567',
      rangeMobileNo: '9876543210',
      rangeEmail: 'mumbai.range@example.com',
      rangeDescription: 'Mumbai metropolitan area range',
      active: true,
      stateId: 1
    },
    {
      id: 2,
      stateName: 'Karnataka',
      rangeName: 'Bangalore Range',
      rangeHead: 'Jane Smith',
      rangeContactNo: '0802345678',
      rangeMobileNo: '8765432109',
      rangeEmail: 'bangalore.range@example.com',
      rangeDescription: 'Bangalore urban area range',
      active: true,
      stateId: 2
    },
    {
      id: 3,
      stateName: 'Tamil Nadu',
      rangeName: 'Chennai Range',
      rangeHead: 'Robert Johnson',
      rangeContactNo: '0443456789',
      rangeMobileNo: '7654321098',
      rangeEmail: 'chennai.range@example.com',
      rangeDescription: 'Chennai coastal area range',
      active: false,
      stateId: 3
    },
    {
      id: 4,
      stateName: 'Gujarat',
      rangeName: 'Ahmedabad Range',
      rangeHead: 'Michael Brown',
      rangeContactNo: '0792345678',
      rangeMobileNo: '9543210876',
      rangeEmail: 'ahmedabad.range@example.com',
      rangeDescription: 'Ahmedabad industrial area range',
      active: true,
      stateId: 4
    },
    {
      id: 5,
      stateName: 'Rajasthan',
      rangeName: 'Jaipur Range',
      rangeHead: 'Sarah Wilson',
      rangeContactNo: '0141234567',
      rangeMobileNo: '8432109765',
      rangeEmail: 'jaipur.range@example.com',
      rangeDescription: 'Jaipur heritage area range',
      active: false,
      stateId: 5
    }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadRanges();
  }

  // Data loading
  loadRanges(): void {
    this.isLoading = true;
    // Simulate API call delay
    setTimeout(() => {
      this.ranges = [...this.mockRanges];
      this.applyFilters();
      this.isLoading = false;
    }, 500);
  }

  // Helper methods
  createEmptyRange(): Range {
    return {
      id: 0,
      stateName: '',
      rangeName: '',
      rangeHead: '',
      rangeContactNo: '',
      rangeMobileNo: '',
      rangeEmail: '',
      rangeDescription: '',
      active: true,
      stateId: 0
    };
  }

  // Search and filter
  onSearch(): void {
    this.applyFilters();
  }

  onPageSizeChange(): void {
    this.itemsPerPage = this.pageSize;
    this.currentPage = 1;
    this.updatePaginatedData();
  }

  applyFilters(): void {
    if (!this.searchTerm.trim()) {
      this.filteredRanges = [...this.ranges];
    } else {
      const term = this.searchTerm.toLowerCase().trim();
      this.filteredRanges = this.ranges.filter(range =>
        range.rangeName.toLowerCase().includes(term) ||
        range.stateName.toLowerCase().includes(term) ||
        range.rangeHead.toLowerCase().includes(term) ||
        range.rangeEmail.toLowerCase().includes(term) ||
        range.rangeContactNo.includes(term) ||
        range.rangeMobileNo.includes(term)
      );
    }
    this.currentPage = 1;
    this.updatePaginatedData();
  }

  // Pagination methods
  updatePaginatedData(): void {
    this.totalItems = this.filteredRanges.length;
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = Math.min(startIndex + this.itemsPerPage, this.totalItems);
    this.paginatedRanges = this.filteredRanges.slice(startIndex, endIndex);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedData();
    }
  }

  getVisiblePages(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);
    
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }



  // Sorting functionality
  sortTable(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.filteredRanges.sort((a, b) => {
      let aValue = a[column as keyof Range];
      let bValue = b[column as keyof Range];

      // Provide default values if undefined
      if (aValue === undefined || aValue === null) aValue = '';
      if (bValue === undefined || bValue === null) bValue = '';

      // Handle different data types
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = (bValue as string).toLowerCase();
      }

      if (aValue < bValue) {
        return this.sortDirection === 'asc' ? -1 : 1;
      } else if (aValue > bValue) {
        return this.sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });

    this.updatePaginatedData();
  }

  // Modal functionality
  showAddRangeModal(): void {
    this.isEditMode = false;
    this.currentRange = this.createEmptyRange();
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.currentRange = this.createEmptyRange();
    this.isEditMode = false;
  }

  editRange(range: Range): void {
    this.isEditMode = true;
    this.currentRange = { ...range };
    this.showModal = true;
  }

  toggleRangeStatus(range: Range): void {
    const index = this.ranges.findIndex(r => r.id === range.id);
    if (index !== -1) {
      this.ranges[index].active = !this.ranges[index].active;
      this.applyFilters();
      // TODO: Implement actual API call
      console.log('Range status toggled:', this.ranges[index]);
    }
  }

  addRange(): void {
    this.isLoading = true;
    // Simulate API call
    setTimeout(() => {
      const newId = this.getNextId();
      this.currentRange.id = newId;
      this.currentRange.active = this.currentRange.active || false;
      this.ranges.unshift({ ...this.currentRange });
      this.applyFilters();
      this.isLoading = false;
      this.closeModal();
    }, 500);
  }

  updateRange(): void {
    this.isLoading = true;
    // Simulate API call
    setTimeout(() => {
      const index = this.ranges.findIndex(r => r.id === this.currentRange.id);
      if (index !== -1) {
        this.ranges[index] = { ...this.currentRange };
      }
      this.applyFilters();
      this.isLoading = false;
      this.closeModal();
    }, 500);
  }

  private getNextId(): number {
    return this.ranges.length > 0 ? Math.max(...this.ranges.map(r => r.id)) + 1 : 1;
  }

  // TrackBy function for performance
  trackByRangeId(index: number, range: Range): number {
    return range.id;
  }


}
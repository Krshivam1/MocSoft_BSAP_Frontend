import { Component, OnInit } from '@angular/core';
import { ApiService, Battalion, Range, District, ApiResponse } from '../../services/api.service';

interface AdminDistrict {
  id: number;
  rangeId: number;
  districtName: string;
}
@Component({
  selector: 'app-battalion',
  templateUrl: './battalion.component.html',
  styleUrl: './battalion.component.css'
})

export class BattalionComponent implements OnInit {
  // Data properties
  ranges: Range[] = [];
  adminDistricts: AdminDistrict[] = [];

  constructor(private apiService: ApiService) {}

  // Stored battalions list
  battalions: Battalion[] = [];
  filteredBattalions: Battalion[] = [];
  paginatedBattalions: Battalion[] = [];
  // Backwards-compat alias used by template in places that still reference paginatedDistricts
  get paginatedDistricts(): Battalion[] {
    return this.paginatedBattalions;
  }
  
  // Modal properties
  showModal = false;
  currentDistrict: Battalion = this.createEmptyDistrict();
  isEditMode = false;
  isLoading = false;
  
  // Search and pagination properties
  searchTerm = '';
  currentPage = 1;
  itemsPerPage = 10;
  pageSize = 10;
  totalItems = 0;
  totalPages = 0;
  
  // Sorting properties
  sortColumn = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  
  // Math reference for template
  Math = Math;

  // Helper: returns districts for currently selected range (used by template select)
  get districtsForSelectedRange(): AdminDistrict[] {
    if (!this.currentDistrict || this.currentDistrict.rangeId === undefined || this.currentDistrict.rangeId === null) {
      return [];
    }
    return this.adminDistricts.filter(d => d.rangeId === this.currentDistrict.rangeId);
  }

  // Called when user changes the range select in modal
  onRangeChange(): void {
    // Reset selected district when range changes
    this.currentDistrict.districtId = undefined;
  }

  // Helper to get range name by id (used instead of inline find in template)
  getRangeName(rangeId?: number): string {
    if (rangeId === undefined || rangeId === null) return '';
    const r = this.ranges.find(x => x.id === rangeId);
    return r ? r.rangeName : '';
  }

  // Helper to get district name by id (used instead of inline find in template)
  getDistrictName(districtId?: number): string {
    if (districtId === undefined || districtId === null) return '';
    const d = this.adminDistricts.find(x => x.id === districtId);
    return d ? d.districtName : '';
  }

  ngOnInit() {
    this.loadData();
  }

  private loadData() {
    this.loadRanges();
    this.loadDistricts();
    this.loadBattalions();
  }

  private loadRanges() {
    // TODO: Implement real API call when range endpoint is available
    this.apiService.GetRangeDropdown().subscribe({
      next: (response: ApiResponse<Range[]>) => {
        if (response.status === 'SUCCESS' && response.data) {
          this.ranges = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading ranges:', error);
        this.ranges = [];
      }
    });
  }

  private loadDistricts() {
    this.apiService.getDistrictDropdown().subscribe({
      next: (response: ApiResponse<AdminDistrict[]>) => {
        if (response.status === 'SUCCESS' && response.data) {
          this.adminDistricts = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading districts:', error);
        this.adminDistricts = [];
      }
    });
  }

  private loadBattalions() {
    this.isLoading = true;
    this.apiService.getBattalions(this.currentPage, this.itemsPerPage).subscribe({
      next: (response: ApiResponse<Battalion[]>) => {
        if (response.status === 'SUCCESS' && response.data) {
          this.battalions = response.data;
          if (response.pagination) {
            this.totalItems = response.pagination.total || 0;
            this.totalPages = response.pagination.totalPages || 0;
          }
          this.updateFilteredData();
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading battalions:', error);
        this.battalions = [];
        this.updateFilteredData();
        this.isLoading = false;
      }
    });
  }



  private createEmptyDistrict(): Battalion {
    return {
      id: 0,
      rangeId: undefined,
      districtId: undefined,
      battalionName: '',
      battalionHead: '',
      battalionMobileNo: '',
      battalionContactNo: '',
      battalionEmail: '',
      battalionArea: '',
      active: true
    };
  }

  // Search functionality
  onSearch() {
    this.currentPage = 1;
    this.updateFilteredData();
  }

  private updateFilteredData() {
    // Apply search filter
    this.filteredBattalions = this.battalions.filter(b =>
      b.battalionName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      (b.range?.rangeName || '').toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      (b.battalionHead || '').toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      (b.battalionEmail || '').toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      (b.battalionArea || '').toLowerCase().includes(this.searchTerm.toLowerCase())
    );

    this.totalItems = this.filteredBattalions.length;
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    
    // Ensure current page is valid
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
    }
    
    this.updatePaginatedData();
  }

  // Pagination functionality
  private updatePaginatedData() {
  const startIndex = (this.currentPage - 1) * this.itemsPerPage;
  const endIndex = startIndex + this.itemsPerPage;
  this.paginatedBattalions = this.filteredBattalions.slice(startIndex, endIndex);
  }

  onPageSizeChange() {
    this.itemsPerPage = this.pageSize;
    this.currentPage = 1;
    this.updateFilteredData();
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedData();
    }
  }

  getVisiblePages(): number[] {
    const visiblePages: number[] = [];
    const maxVisiblePages = 5;
    
    if (this.totalPages <= maxVisiblePages) {
      for (let i = 1; i <= this.totalPages; i++) {
        visiblePages.push(i);
      }
    } else {
      const halfVisible = Math.floor(maxVisiblePages / 2);
      let startPage = Math.max(1, this.currentPage - halfVisible);
      let endPage = Math.min(this.totalPages, this.currentPage + halfVisible);
      
      if (this.currentPage <= halfVisible) {
        endPage = maxVisiblePages;
      } else if (this.currentPage > this.totalPages - halfVisible) {
        startPage = this.totalPages - maxVisiblePages + 1;
      }
      
      if (startPage > 1) {
        visiblePages.push(1);
        if (startPage > 2) {
          visiblePages.push(-1); // Ellipsis
        }
      }
      
      for (let i = startPage; i <= endPage; i++) {
        visiblePages.push(i);
      }
      
      if (endPage < this.totalPages) {
        if (endPage < this.totalPages - 1) {
          visiblePages.push(-1); // Ellipsis
        }
        visiblePages.push(this.totalPages);
      }
    }
    
    return visiblePages;
  }

  // Sorting functionality
  sortTable(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.filteredBattalions.sort((a: any, b: any) => {
      let aValue = a[column as keyof Battalion];
      let bValue = b[column as keyof Battalion];

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
  showAddDistrictModal(): void {
    this.isEditMode = false;
    this.currentDistrict = this.createEmptyDistrict();
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.currentDistrict = this.createEmptyDistrict();
    this.isEditMode = false;
  }

  editDistrict(district: Battalion): void {
    this.isEditMode = true;
    // Map Battalion data into currentDistrict
    this.currentDistrict = { ...district } as any;
    this.showModal = true;
  }

  toggleDistrictStatus(district: Battalion): void {
    this.apiService.toggleBattalionStatus(district.id).subscribe({
      next: (response: ApiResponse<Battalion>) => {
        if (response.status === 'SUCCESS' && response.data) {
          const index = this.battalions.findIndex(d => d.id === district.id);
          if (index !== -1) {
            this.battalions[index] = response.data;
            this.updateFilteredData();
          }
        }
      },
      error: (error) => {
        console.error('Error toggling battalion status:', error);
        // Show error message to user (you can implement toast/notification here)
        alert('Failed to toggle battalion status. Please try again.');
      }
    });
  }

  addDistrict(): void {
    this.isLoading = true;
    const battalionData: Partial<Battalion> = {
      rangeId: this.currentDistrict.rangeId,
      districtId: this.currentDistrict.districtId,
      battalionName: this.currentDistrict.battalionName,
      battalionHead: this.currentDistrict.battalionHead,
      battalionContactNo: this.currentDistrict.battalionContactNo,
      battalionMobileNo: this.currentDistrict.battalionMobileNo,
      battalionEmail: this.currentDistrict.battalionEmail,
      battalionArea: this.currentDistrict.battalionArea,
      active: this.currentDistrict.active
    };

    this.apiService.createBattalion(battalionData).subscribe({
      next: (response: ApiResponse<Battalion>) => {
        if (response.status === 'SUCCESS' && response.data) {
          this.battalions.unshift(response.data);
          this.updateFilteredData();
          this.closeModal();
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error creating battalion:', error);
        this.isLoading = false;
        // Show error message to user (you can implement toast/notification here)
        alert('Failed to create battalion. Please try again.');
      }
    });
  }

  updateDistrict(): void {
    this.isLoading = true;
    const battalionData: Partial<Battalion> = {
      rangeId: this.currentDistrict.rangeId,
      districtId: this.currentDistrict.districtId,
      battalionName: this.currentDistrict.battalionName,
      battalionHead: this.currentDistrict.battalionHead,
      battalionContactNo: this.currentDistrict.battalionContactNo,
      battalionMobileNo: this.currentDistrict.battalionMobileNo,
      battalionEmail: this.currentDistrict.battalionEmail,
      battalionArea: this.currentDistrict.battalionArea,
      active: this.currentDistrict.active
    };

    this.apiService.updateBattalion(this.currentDistrict.id, battalionData).subscribe({
      next: (response: ApiResponse<Battalion>) => {
        if (response.status === 'SUCCESS' && response.data) {
          const index = this.battalions.findIndex(d => d.id === this.currentDistrict.id);
          if (index !== -1) {
            this.battalions[index] = response.data;
          }
          this.updateFilteredData();
          this.closeModal();
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error updating battalion:', error);
        this.isLoading = false;
        // Show error message to user (you can implement toast/notification here)
        alert('Failed to update battalion. Please try again.');
      }
    });
  }



  // TrackBy function for performance
  trackByDistrictId(index: number, district: Battalion): number {
    return district.id;
  }
}

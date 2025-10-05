import { Component, OnInit } from '@angular/core';

interface Range {
  id: number;
  rangeName: string;
}

interface AdminDistrict {
  id: number;
  rangeId: number;
  districtName: string;
}

interface Battalion {
  id: number;
  rangeId?: number; // selected range
  adminDistrictId?: number; // selected parent district
  rangeName?: string;
  battalionName: string;
  battalionHead: string;
  battalionMobileNo?: string;
  battalionContactNo?: string;
  battalionUserId?: string;
  area?: string;
  battalionDescription?: string;
  battalionHeadImage?: string;
  active: boolean;
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
    this.currentDistrict.adminDistrictId = undefined;
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
    this.loadSampleData();
  }

  private loadSampleData() {
    // Sample ranges
    this.ranges = [
      { id: 1, rangeName: 'Central Range Patna' },
      { id: 2, rangeName: 'Magadh Range Gaya' },
      { id: 3, rangeName: 'Sahabad Range Dehri' },
      { id: 4, rangeName: 'Tirhut Range Muzaffarpur' }
    ];

    // Sample admin districts (for district dropdown)
    this.adminDistricts = [
      { id: 1, rangeId: 1, districtName: 'Patna' },
      { id: 2, rangeId: 2, districtName: 'Gaya' },
      { id: 3, rangeId: 3, districtName: 'Dehri' },
      { id: 4, rangeId: 4, districtName: 'Muzaffarpur' }
    ];

    // Sample battalions list
    this.battalions = [
      {
        id: 1,
        rangeId: 1,
        adminDistrictId: 1,
        rangeName: 'Central Range Patna',
        battalionName: '1st Patna Battalion',
        battalionHead: 'Upendra Kumar Sharma',
        battalionMobileNo: '9431822967',
        battalionContactNo: '6122219717',
        battalionUserId: 'batt1.patna@bih.gov.in',
        area: '3',
        battalionDescription: 'Patna battalion covering central area',
        battalionHeadImage: 'assets/images/patna-head.jpg',
        active: true
      },
      {
        id: 2,
        rangeId: 2,
        adminDistrictId: 2,
        rangeName: 'Magadh Range Gaya',
        battalionName: 'Gaya Battalion',
        battalionHead: 'Rajeev Mishra',
        battalionMobileNo: '9431822973',
        battalionContactNo: '6312225901',
        battalionUserId: 'batt.gaya@bih.gov.in',
        area: '2',
        battalionDescription: 'Gaya battalion',
        battalionHeadImage: 'assets/images/gaya-head.jpg',
        active: true
      }
    ];

    this.updateFilteredData();
  }

  private createEmptyDistrict(): Battalion {
    return {
      id: 0,
      rangeId: undefined,
      adminDistrictId: undefined,
      rangeName: '',
      battalionName: '',
      battalionHead: '',
      battalionMobileNo: '',
      battalionContactNo: '',
      battalionUserId: '',
      area: '',
      battalionDescription: '',
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
      (b.rangeName || '').toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      (b.battalionHead || '').toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      (b.battalionUserId || '').toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      (b.area || '').toLowerCase().includes(this.searchTerm.toLowerCase())
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
    const index = this.battalions.findIndex(d => d.id === district.id);
    if (index !== -1) {
      this.battalions[index].active = !this.battalions[index].active;
      this.updateFilteredData();
      // TODO: Implement actual API call
      console.log('Battalion status toggled:', this.battalions[index]);
    }
  }

  addDistrict(): void {
    this.isLoading = true;
    // Simulate API call
    setTimeout(() => {
      const newId = this.getNextId();
      this.currentDistrict.id = newId;
      this.currentDistrict.active = this.currentDistrict.active || false;
      this.battalions.unshift({ ...this.currentDistrict });
      this.updateFilteredData();
      this.isLoading = false;
      this.closeModal();
    }, 500);
  }

  updateDistrict(): void {
    this.isLoading = true;
    // Simulate API call
    setTimeout(() => {
      const index = this.battalions.findIndex(d => d.id === this.currentDistrict.id);
      if (index !== -1) {
        this.battalions[index] = { ...this.currentDistrict };
      }
      this.updateFilteredData();
      this.isLoading = false;
      this.closeModal();
    }, 500);
  }

  private getNextId(): number {
    return this.battalions.length > 0 ? Math.max(...this.battalions.map(d => d.id)) + 1 : 1;
  }

  // TrackBy function for performance
  trackByDistrictId(index: number, district: Battalion): number {
    return district.id;
  }
}

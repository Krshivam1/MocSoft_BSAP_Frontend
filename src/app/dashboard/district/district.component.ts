import { Component, OnInit } from '@angular/core';

interface District {
  id: number;
  rangeName: string;
  districtName: string;
  districtHead: string;
  districtMobileNo: string;
  districtContactNo: string;
  districtUserId: string;
  area: string;
  districtDescription: string;
  districtHeadImage?: string;
  active: boolean;
}

@Component({
  selector: 'app-district-list',
  templateUrl: './district.component.html',
  styleUrls: ['./district.component.css']
})
export class DistrictComponent implements OnInit {
  // Data properties
  districts: District[] = [];
  filteredDistricts: District[] = [];
  paginatedDistricts: District[] = [];
  
  // Modal properties
  showModal = false;
  currentDistrict: District = this.createEmptyDistrict();
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

  ngOnInit() {
    this.loadDistricts();
  }

  private loadDistricts() {
    // TODO: Replace with actual API call
    this.districts = [
      {
        id: 1,
        rangeName: 'Central Range Patna',
        districtName: 'Patna',
        districtHead: 'Upendra Kumar Sharma',
        districtMobileNo: '9431822967',
        districtContactNo: '6122219717',
        districtUserId: 'sppatna@bih.gov.in',
        area: '3',
        districtDescription: 'Patna district headquarters',
        districtHeadImage: 'assets/images/patna-head.jpg',
        active: true
      },
      {
        id: 2,
        rangeName: 'Magadh Range Gaya',
        districtName: 'Gaya',
        districtHead: 'Rajeev Mishra',
        districtMobileNo: '9431822973',
        districtContactNo: '6312225901',
        districtUserId: 'spgaya@bih.gov.in',
        area: '2',
        districtDescription: 'Gaya district headquarters',
        districtHeadImage: 'assets/images/gaya-head.jpg',
        active: true
      },
      {
        id: 3,
        rangeName: 'Sahabad Range Dehri',
        districtName: 'Dehri',
        districtHead: 'P Kanan',
        districtMobileNo: '9431822963',
        districtContactNo: '6184253262',
        districtUserId: 'digdehri@bih.gov.in',
        area: '1',
        districtDescription: 'Dehri district headquarters',
        active: false
      },
      {
        id: 4,
        rangeName: 'Tirhut Range Muzaffarpur',
        districtName: 'Muzaffarpur',
        districtHead: 'Jayant Kant',
        districtMobileNo: '9431822951',
        districtContactNo: '6212210077',
        districtUserId: 'spmuzaffarpur@bih.gov.in',
        area: '1',
        districtDescription: 'Muzaffarpur district headquarters',
        districtHeadImage: 'assets/images/muzaffarpur-head.jpg',
        active: true
      }
    ];
    this.updateFilteredData();
  }

  private createEmptyDistrict(): District {
    return {
      id: 0,
      rangeName: '',
      districtName: '',
      districtHead: '',
      districtMobileNo: '',
      districtContactNo: '',
      districtUserId: '',
      area: '',
      districtDescription: '',
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
    this.filteredDistricts = this.districts.filter(district =>
      district.districtName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      district.rangeName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      district.districtHead.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      district.districtUserId.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      district.area.toLowerCase().includes(this.searchTerm.toLowerCase())
    );

    this.totalItems = this.filteredDistricts.length;
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
    this.paginatedDistricts = this.filteredDistricts.slice(startIndex, endIndex);
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

    this.filteredDistricts.sort((a, b) => {
      let aValue = a[column as keyof District];
      let bValue = b[column as keyof District];

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

  editDistrict(district: District): void {
    this.isEditMode = true;
    this.currentDistrict = { ...district };
    this.showModal = true;
  }

  toggleDistrictStatus(district: District): void {
    const index = this.districts.findIndex(d => d.id === district.id);
    if (index !== -1) {
      this.districts[index].active = !this.districts[index].active;
      this.updateFilteredData();
      // TODO: Implement actual API call
      console.log('District status toggled:', this.districts[index]);
    }
  }

  addDistrict(): void {
    this.isLoading = true;
    // Simulate API call
    setTimeout(() => {
      const newId = this.getNextId();
      this.currentDistrict.id = newId;
      this.currentDistrict.active = this.currentDistrict.active || false;
      this.districts.unshift({ ...this.currentDistrict });
      this.updateFilteredData();
      this.isLoading = false;
      this.closeModal();
    }, 500);
  }

  updateDistrict(): void {
    this.isLoading = true;
    // Simulate API call
    setTimeout(() => {
      const index = this.districts.findIndex(d => d.id === this.currentDistrict.id);
      if (index !== -1) {
        this.districts[index] = { ...this.currentDistrict };
      }
      this.updateFilteredData();
      this.isLoading = false;
      this.closeModal();
    }, 500);
  }

  private getNextId(): number {
    return this.districts.length > 0 ? Math.max(...this.districts.map(d => d.id)) + 1 : 1;
  }

  // TrackBy function for performance
  trackByDistrictId(index: number, district: District): number {
    return district.id;
  }
}
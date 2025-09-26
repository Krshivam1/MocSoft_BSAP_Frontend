import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

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

interface Column {
  key: string;
  label: string;
  sortable: boolean;
}

@Component({
  selector: 'app-district-list',
  templateUrl: './district.component.html',
  styleUrls: ['./district.component.css']
})
export class DistrictComponent implements OnInit {
  districts: District[] = [];
  filteredDistricts: District[] = [];
  paginatedDistricts: District[] = [];
  
  columns: Column[] = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'rangeName', label: 'Range Name', sortable: true },
    { key: 'districtName', label: 'District Name', sortable: true },
    { key: 'districtHead', label: 'District Head', sortable: true },
    { key: 'districtMobileNo', label: 'Mobile No', sortable: false },
    { key: 'districtContactNo', label: 'Contact No', sortable: false },
    { key: 'districtUserId', label: 'User ID', sortable: true },
    { key: 'area', label: 'Area', sortable: true },
    { key: 'districtDescription', label: 'Description', sortable: false },
    { key: 'districtHeadImage', label: 'Head Image', sortable: false },
    { key: 'active', label: 'Status', sortable: true },
    { key: 'actions', label: 'Actions', sortable: false }
  ];

  searchTerm: string = '';
  sortColumn: string = 'id';
  sortDirection: 'asc' | 'desc' = 'asc';
  
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;
  
  selectedDistrictId: number | null = null;
  hasAddPermission: boolean = true;
  
  showImageModal: boolean = false;
  modalImageUrl: string = '';
  modalImageTitle: string = '';

  // Mock data based on the provided content
  private mockDistricts: District[] = [
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

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadDistricts();
  }

  loadDistricts(): void {
    // Simulate API call
    setTimeout(() => {
      this.districts = this.mockDistricts;
      this.filteredDistricts = [...this.districts];
      this.sortData();
      this.updatePagination();
    }, 500);
  }

  get totalDistricts(): number {
    return this.districts.length;
  }

  get activeDistricts(): number {
    return this.districts.filter(d => d.active).length;
  }

  get inactiveDistricts(): number {
    return this.districts.filter(d => !d.active).length;
  }

  onSearch(): void {
    if (!this.searchTerm.trim()) {
      this.filteredDistricts = [...this.districts];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredDistricts = this.districts.filter(district =>
        district.districtName.toLowerCase().includes(term) ||
        district.rangeName.toLowerCase().includes(term) ||
        district.districtHead.toLowerCase().includes(term) ||
        district.districtUserId.toLowerCase().includes(term)
      );
    }
    this.currentPage = 1;
    this.sortData();
    this.updatePagination();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.onSearch();
  }

  closeImageModal(): void {
  this.showImageModal = false;
  this.modalImageUrl = '';
  this.modalImageTitle = '';
}
viewImage(url: string, title: string): void {
  this.modalImageUrl = url;
  this.modalImageTitle = title;
  this.showImageModal = true;
}
exportToExcel(): void {
  // For now, just log to test
  console.log('Export to Excel clicked');

  // You can implement actual export functionality here
  // Example using XLSX library:
  /*
  import * as XLSX from 'xlsx';
  const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.filteredDistricts);
  const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
  XLSX.writeFile(workbook, 'districts.xlsx');
  */
}



  sort(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.sortData();
    this.updatePagination();
  }

 sortData(): void {
  this.filteredDistricts.sort((a, b) => {
    const aValue = a[this.sortColumn as keyof District] ?? '';
    const bValue = b[this.sortColumn as keyof District] ?? '';

    if (aValue < bValue) return this.sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return this.sortDirection === 'asc' ? 1 : -1;
    return 0;
  });
}


  onPageSizeChange(): void {
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredDistricts.length / this.pageSize);
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedDistricts = this.filteredDistricts.slice(startIndex, endIndex);
  }

  getStartIndex(): number {
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  getEndIndex(): number {
    return Math.min(this.currentPage * this.pageSize, this.filteredDistricts.length);
  }

  getVisiblePages(): (number | string)[] {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (this.totalPages <= maxVisiblePages) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      
      if (this.currentPage > 3) {
        pages.push('...');
      }

      const start = Math.max(2, this.currentPage - 1);
      const end = Math.min(this.totalPages - 1, this.currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (this.currentPage < this.totalPages - 2) {
        pages.push('...');
      }

      pages.push(this.totalPages);
    }

    return pages;
  }

 goToPage(page: number | string): void {
  if (page === '...') return;

  if (typeof page === 'number') {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePagination();
  }
}


  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  selectDistrict(id: number): void {
    this.selectedDistrictId = this.selectedDistrictId === id ? null : id;
  }

  addDistrict(): void {
    this.router.navigate(['dashboard/district/add']);
  }

  editDistrict(id: number): void {
    this.router.navigate(['dashboard/district/edit',id]);
  }

  toggleStatus(district: District): void {
    district.active = !district.active;
    // Simulate API call
    console.log(`District ${district.id} status updated to: ${district.active}`);
  }

  deleteDistrict(id: number): void {
    if (confirm('Are you sure you want to delete this district?')) {
      this.districts = this.districts.filter(district => district.id !== id);
      this.filteredDistricts = this.filteredDistricts.filter(district => district.id !== id);
      this.updatePagination();
      console.log(`District ${id} deleted`);
    }
  }
}
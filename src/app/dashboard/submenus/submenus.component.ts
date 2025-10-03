

import { Component, OnInit } from '@angular/core';
import { ApiService, Menu, ApiResponse } from '../../services/api.service';

interface SubMenu {
  id: number;
  menuId: number;
  parentId?: number;
  subMenuName: string;
  subMenuUrl: string;
  priority: number;
  active: boolean;
  createdBy?: number;
  updatedBy?: number;
  createdAt?: string;
  updatedAt?: string;
}

@Component({
  selector: 'app-submenus',
  templateUrl: './submenus.component.html',
  styleUrl: './submenus.component.css',
})
export class SubmenusComponent implements OnInit {
  // Data properties
  menus: Menu[] = [];
  submenus: SubMenu[] = [];
  filteredData: SubMenu[] = [];
  paginatedData: SubMenu[] = [];
  
  // Pagination and display
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 0;
  totalItems: number = 0;
  itemsPerPage: number = 10;
  
  // Search and sorting
  searchTerm: string = '';
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  
  // Modal states
  showModal: boolean = false;
  isEditMode: boolean = false;
  isLoading: boolean = false;
  
  // Current data
  currentSubmenu: SubMenu = this.createEmptySubmenu();


  constructor(private apiService: ApiService) {}


  ngOnInit(): void {
    this.loadMenus();
    this.loadSubMenus();
  }

  // Load menus for dropdown
  loadMenus(): void {
    this.apiService.getMenus(1, 100).subscribe({
      next: (res: ApiResponse<Menu[]>) => {
        this.menus = res.data || [];
      },
      error: err => {
        this.menus = [];
      }
    });
  }

  // Load submenus
  loadSubMenus(): void {
    this.apiService.getSubMenus(this.currentPage, this.pageSize, this.searchTerm, this.sortColumn, this.sortDirection).subscribe({
      next: (res: ApiResponse<SubMenu[]>) => {
        this.submenus = res.data || [];
        this.filteredData = [...this.submenus];
        this.updatePagination();
      },
      error: err => {
        this.submenus = [];
        this.filteredData = [];
        this.updatePagination();
      }
    });
  }

  // Helper methods
  createEmptySubmenu(): SubMenu {
    return {
      id: 0,
      menuId: 0,
      subMenuName: '',
      subMenuUrl: '',
      priority: 1,
      active: true
    };
  }

  getMenuName(menuId: number): string {
    const menu = this.menus.find(m => m.id === menuId);
    return menu ? menu.menuName : 'Unknown Menu';
  }

  // Search functionality
  onSearch(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.submenus];

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(submenu =>
        submenu.subMenuName.toLowerCase().includes(term) ||
        submenu.subMenuUrl.toLowerCase().includes(term) ||
        this.getMenuName(submenu.menuId).toLowerCase().includes(term) ||
        submenu.priority.toString().includes(term)
      );
    }

    this.filteredData = filtered;
    this.updatePagination();
  }

  // Pagination methods
  onPageSizeChange(): void {
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredData.length / this.pageSize);
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedData = this.filteredData.slice(startIndex, endIndex);
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  // Sorting functionality
  sortTable(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.filteredData.sort((a, b) => {
      let aValue: any = a[column as keyof SubMenu];
      let bValue: any = b[column as keyof SubMenu];

      // Special handling for menuId to sort by menu name
      if (column === 'menuId') {
        aValue = this.getMenuName(a.menuId);
        bValue = this.getMenuName(b.menuId);
      }

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

    this.updatePagination();
  }

  // Modal functionality
  showAddSubmenuModal(): void {
    this.isEditMode = false;
    this.currentSubmenu = this.createEmptySubmenu();
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.currentSubmenu = this.createEmptySubmenu();
    this.isEditMode = false;
  }

  editSubmenu(submenu: SubMenu): void {
    this.isEditMode = true;
    this.currentSubmenu = { ...submenu };
    this.showModal = true;
  }


  addSubmenu(): void {
    this.isLoading = true;
    this.apiService.createSubMenu(this.currentSubmenu).subscribe({
      next: (res: ApiResponse<SubMenu>) => {
        this.isLoading = false;
        if (res.status === 'SUCCESS') {
          this.closeModal();
          this.loadSubMenus();
        }
      },
      error: err => {
        this.isLoading = false;
      }
    });
  }


  updateSubmenu(): void {
    this.isLoading = true;
    this.apiService.updateSubMenu(this.currentSubmenu.id, this.currentSubmenu).subscribe({
      next: (res: ApiResponse<SubMenu>) => {
        this.isLoading = false;
        if (res.status === 'SUCCESS') {
          this.closeModal();
          this.loadSubMenus();
        }
      },
      error: err => {
        this.isLoading = false;
      }
    });
  }


  toggleSubmenuStatus(submenu: SubMenu): void {
    this.apiService.toggleSubMenuStatus(submenu.id, !submenu.active).subscribe({
      next: (res: ApiResponse<SubMenu>) => {
        if (res.status === 'SUCCESS') {
          submenu.active = !submenu.active;
        }
      },
      error: err => {}
    });
  }

  // Pagination helper methods
  getPageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  getVisiblePages(): number[] {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, this.currentPage - delta); 
         i <= Math.min(this.totalPages - 1, this.currentPage + delta); 
         i++) {
      range.push(i);
    }

    if (this.currentPage - delta > 2) {
      rangeWithDots.push(1, -1);
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (this.currentPage + delta < this.totalPages - 1) {
      rangeWithDots.push(-1, this.totalPages);
    } else {
      rangeWithDots.push(this.totalPages);
    }

    return rangeWithDots.filter((v, i, a) => a.indexOf(v) === i && v <= this.totalPages);
  }

  // Make Math available in template
  Math = Math;
}

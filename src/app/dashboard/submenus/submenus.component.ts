

import { Component, OnInit } from '@angular/core';
import { ApiService, Menu, ApiResponse } from '../../services/api.service';

interface SubMenu {
  id: number;
  menuId: number;
  parentId?: number;
  subMenuName: string;
  subMenuUrl: string;
  // server fields
  subMenuId?: number;
  menuName?: string;
  menuUrl?: string;
  parentMenu?: string;
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
    this.loadSubMenus();
  }
  // Load submenus from server with pagination, search and sort
  loadSubMenus(): void {
    this.isLoading = true;
    this.apiService.getSubMenus(this.currentPage, this.pageSize, this.searchTerm, this.sortColumn, this.sortDirection).subscribe({
      next: (res: ApiResponse<SubMenu[]>) => {
        this.isLoading = false;
        this.submenus = res.data || [];

        // derive unique menus (menuId + parentMenu) for the modal dropdown
        const menuMap = new Map<number, string>();
        for (const s of this.submenus) {
          if (s.menuId && s.parentMenu) {
            if (!menuMap.has(s.menuId)) {
              menuMap.set(s.menuId, s.parentMenu);
            }
          }
        }
        this.menus = Array.from(menuMap.entries()).map(([id, name]) => ({ id, menuName: name } as Menu));

        // map server pagination to component state
        const pagination = (res as any).pagination || (res as any).data?.pagination;
        if ((res as any).pagination) {
          this.totalItems = (res as any).pagination.total || 0;
          this.currentPage = (res as any).pagination.page || this.currentPage;
          this.itemsPerPage = (res as any).pagination.limit || this.pageSize;
          this.totalPages = (res as any).pagination.totalPages || Math.ceil(this.totalItems / this.itemsPerPage);
        } else if ((res as any).data && (res as any).data.pagination) {
          const p = (res as any).data.pagination;
          this.totalItems = p.total || 0;
          this.currentPage = p.page || this.currentPage;
          this.itemsPerPage = p.limit || this.pageSize;
          this.totalPages = p.totalPages || Math.ceil(this.totalItems / this.itemsPerPage);
        } else {
          // fallback to client-side pagination if server didn't provide it
          this.totalItems = this.submenus.length;
          this.itemsPerPage = this.pageSize;
          this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
        }

        // paginatedData reflects current page slice from server-provided list
        this.paginatedData = this.submenus.slice(0, this.itemsPerPage);
      },
      error: err => {
        this.isLoading = false;
        this.submenus = [];
        this.menus = [];
        this.paginatedData = [];
        this.totalItems = 0;
        this.totalPages = 0;
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
    // client-side filtering is no longer used; trigger server reload instead
    this.currentPage = 1;
    this.loadSubMenus();
  }

  // Pagination methods
  onPageSizeChange(): void {
    this.currentPage = 1;
    this.itemsPerPage = this.pageSize;
    this.loadSubMenus();
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
      this.loadSubMenus();
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
    // trigger server-side sort
    this.currentPage = 1;
    this.loadSubMenus();
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
    // Use server-provided totalPages to build pagination window
    const start = Math.max(2, this.currentPage - delta);
    const end = Math.min(this.totalPages - 1, this.currentPage + delta);

    for (let i = start; i <= end; i++) {
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

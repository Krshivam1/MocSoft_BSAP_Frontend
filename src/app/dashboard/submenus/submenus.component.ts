import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface Menu {
  id: number;
  menuName: string;
}

interface SubMenu {
  id: number;
  menuId: number;
  parentSubMenuId?: number;
  name: string;
  url: string;
  priority: number;
  active: boolean;
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

  // Mock data
  private mockMenus: Menu[] = [
    { id: 1, menuName: 'Dashboard' },
    { id: 2, menuName: 'Reports' },
    { id: 3, menuName: 'User Management' },
    { id: 4, menuName: 'Settings' },
    { id: 5, menuName: 'Analytics' }
  ];

  private mockSubmenus: SubMenu[] = [
    { id: 1, menuId: 1, name: 'Overview', url: '/dashboard/overview', priority: 1, active: true },
    { id: 2, menuId: 1, name: 'Statistics', url: '/dashboard/stats', priority: 2, active: true },
    { id: 3, menuId: 2, name: 'Monthly Report', url: '/reports/monthly', priority: 1, active: true },
    { id: 4, menuId: 2, name: 'Annual Report', url: '/reports/annual', priority: 2, active: false },
    { id: 5, menuId: 3, name: 'User List', url: '/users/list', priority: 1, active: true },
    { id: 6, menuId: 3, name: 'User Roles', url: '/users/roles', priority: 2, active: true },
    { id: 7, menuId: 4, name: 'System Settings', url: '/settings/system', priority: 1, active: true },
    { id: 8, menuId: 4, name: 'User Preferences', url: '/settings/preferences', priority: 2, active: false },
    { id: 9, menuId: 5, name: 'Performance', url: '/analytics/performance', priority: 1, active: true },
    { id: 10, menuId: 5, name: 'Insights', url: '/analytics/insights', priority: 2, active: true }
  ];

  ngOnInit(): void {
    this.loadData();
  }

  // Data loading
  loadData(): void {
    this.menus = [...this.mockMenus];
    this.submenus = [...this.mockSubmenus];
    this.filteredData = [...this.submenus];
    this.updatePagination();
  }

  // Helper methods
  createEmptySubmenu(): SubMenu {
    return {
      id: 0,
      menuId: 0,
      name: '',
      url: '',
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
        submenu.name.toLowerCase().includes(term) ||
        submenu.url.toLowerCase().includes(term) ||
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
    // Simulate API call
    setTimeout(() => {
      const newId = Math.max(...this.submenus.map(s => s.id), 0) + 1;
      this.currentSubmenu.id = newId;
      this.currentSubmenu.active = this.currentSubmenu.active || false;
      this.submenus.unshift({ ...this.currentSubmenu });
      this.applyFilters();
      this.isLoading = false;
      this.closeModal();
    }, 500);
  }

  updateSubmenu(): void {
    this.isLoading = true;
    // Simulate API call
    setTimeout(() => {
      const index = this.submenus.findIndex(s => s.id === this.currentSubmenu.id);
      if (index !== -1) {
        this.submenus[index] = { ...this.currentSubmenu };
      }
      this.applyFilters();
      this.isLoading = false;
      this.closeModal();
    }, 500);
  }

  toggleSubmenuStatus(submenu: SubMenu): void {
    submenu.active = !submenu.active;
    // Here you would typically make an API call to update the status
    console.log(`Submenu ${submenu.id} status updated to: ${submenu.active}`);
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

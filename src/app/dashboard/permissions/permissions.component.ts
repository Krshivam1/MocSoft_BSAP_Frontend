import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface Permission {
  id: number;
  name: string;
  code: string;
  url: string;
  active: boolean;
}

@Component({
  selector: 'app-permissions',
  templateUrl: './permissions.component.html',
  styleUrl: './permissions.component.css'
})
export class PermissionsComponent implements OnInit {
  permissions: Permission[] = [];
  filteredPermissions: Permission[] = [];
  searchTerm: string = '';
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;

  // Modal and form states
  showModal = false;
  isEditMode = false;
  isLoading = false;
  currentPermission: Permission = { id: 0, name: '', code: '', url: '', active: true };
  
  // Sorting
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor() {}

  ngOnInit() {
    this.permissions = [
      { id: 1, name: 'View Users', code: 'VIEW_USER', url: '/users', active: true },
      { id: 2, name: 'Edit Users', code: 'EDIT_USER', url: '/users/edit', active: true },
      { id: 3, name: 'Delete Users', code: 'DELETE_USER', url: '/users/delete', active: false },
      { id: 4, name: 'Create Permission', code: 'CREATE_PERMISSION', url: '/permissions/create', active: true },
      { id: 5, name: 'Delete Permission', code: 'DELETE_PERMISSION', url: '/permissions/delete', active: false }
    ];
    this.filterPermissions();
    this.calculateTotalPages();
  }

  filterPermissions(): void {
    if (!this.searchTerm) {
      this.filteredPermissions = [...this.permissions];
    } else {
      const searchLower = this.searchTerm.toLowerCase();
      this.filteredPermissions = this.permissions.filter(permission => 
        permission.name.toLowerCase().includes(searchLower) || 
        permission.code.toLowerCase().includes(searchLower) ||
        permission.url.toLowerCase().includes(searchLower)
      );
    }
    this.currentPage = 1;
    this.calculateTotalPages();
  }

  onSearch(): void {
    this.filterPermissions();
  }

  calculateTotalPages(): void {
    this.totalPages = Math.ceil(this.filteredPermissions.length / this.pageSize);
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
    this.calculateTotalPages();
  }

  get paginatedPermissions(): Permission[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.filteredPermissions.slice(startIndex, startIndex + this.pageSize);
  }

  get showingStart(): number {
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get showingEnd(): number {
    return Math.min(this.currentPage * this.pageSize, this.filteredPermissions.length);
  }

  // Modal methods
  showAddPermissionModal(): void {
    this.currentPermission = { id: 0, name: '', code: '', url: '', active: true };
    this.isEditMode = false;
    this.showModal = true;
  }

  editPermission(permission: Permission): void {
    this.currentPermission = { ...permission };
    this.isEditMode = true;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.isEditMode = false;
    this.currentPermission = { id: 0, name: '', code: '', url: '', active: true };
  }

  togglePermissionStatus(permission: Permission): void {
    permission.active = !permission.active;
    const status = permission.active ? 'activated' : 'deactivated';
    console.log(`Permission ${status} successfully!`);
  }

  // Sorting methods
  sortTable(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    
    this.filteredPermissions.sort((a, b) => {
      let valueA = a[column as keyof Permission];
      let valueB = b[column as keyof Permission];
      
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
    return Math.ceil(this.filteredPermissions.length / this.pageSize);
  }

  addPermission(): void {
    if (this.currentPermission.name.trim() && this.currentPermission.code.trim()) {
      this.isLoading = true;
      
      const newId = Math.max(...this.permissions.map(p => p.id)) + 1;
      const newPermission: Permission = {
        id: newId,
        name: this.currentPermission.name.trim(),
        code: this.currentPermission.code.trim(),
        url: this.currentPermission.url.trim(),
        active: this.currentPermission.active
      };
      
      this.permissions.push(newPermission);
      this.filterPermissions();
      this.closeModal();
      this.isLoading = false;
      
      console.log('Permission added successfully!');
    }
  }

  updatePermission(): void {
    if (this.currentPermission.name.trim() && this.currentPermission.code.trim()) {
      this.isLoading = true;
      
      const index = this.permissions.findIndex(p => p.id === this.currentPermission.id);
      if (index !== -1) {
        this.permissions[index] = {
          ...this.currentPermission,
          name: this.currentPermission.name.trim(),
          code: this.currentPermission.code.trim(),
          url: this.currentPermission.url.trim()
        };
        this.filterPermissions();
        this.closeModal();
        this.isLoading = false;
        
        console.log('Permission updated successfully!');
      }
    }
  }

  // TrackBy function for better performance
  trackByPermissionId(index: number, permission: Permission): number {
    return permission.id;
  }
}

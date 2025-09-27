import { Component, OnInit } from '@angular/core';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  phone: string;
  department: string;
  active: boolean;
}

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  // Data properties
  users: User[] = [];
  filteredUsers: User[] = [];
  paginatedUsers: User[] = [];
  
  // Modal properties
  showModal = false;
  currentUser: User = this.createEmptyUser();
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
    this.loadUsers();
  }

  private loadUsers() {
    // TODO: Replace with actual API call
    this.users = [
      { id: 1, name: 'John Doe', email: 'john.doe@example.com', role: 'Admin', phone: '9876543210', department: 'IT', active: true },
      { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com', role: 'Manager', phone: '9876543211', department: 'HR', active: true },
      { id: 3, name: 'Bob Johnson', email: 'bob.johnson@example.com', role: 'Officer', phone: '9876543212', department: 'Finance', active: false },
      { id: 4, name: 'Alice Brown', email: 'alice.brown@example.com', role: 'User', phone: '9876543213', department: 'Operations', active: true },
      { id: 5, name: 'Charlie Wilson', email: 'charlie.wilson@example.com', role: 'Officer', phone: '9876543214', department: 'Security', active: true },
      { id: 6, name: 'Diana Davis', email: 'diana.davis@example.com', role: 'Manager', phone: '9876543215', department: 'Admin', active: false },
      { id: 7, name: 'Edward Miller', email: 'edward.miller@example.com', role: 'User', phone: '9876543216', department: 'IT', active: true },
      { id: 8, name: 'Fiona Garcia', email: 'fiona.garcia@example.com', role: 'Officer', phone: '9876543217', department: 'Legal', active: true }
    ];

    this.applyFilters();
  }

  private createEmptyUser(): User {
    return {
      id: 0,
      name: '',
      email: '',
      role: '',
      phone: '',
      department: '',
      active: true
    };
  }

  // Search and filter methods
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
      this.filteredUsers = [...this.users];
    } else {
      const term = this.searchTerm.toLowerCase().trim();
      this.filteredUsers = this.users.filter(user =>
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        user.role.toLowerCase().includes(term) ||
        user.department.toLowerCase().includes(term) ||
        user.phone.includes(term)
      );
    }
    this.currentPage = 1;
    this.updatePaginatedData();
  }

  // Pagination methods
  updatePaginatedData(): void {
    this.totalItems = this.filteredUsers.length;
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = Math.min(startIndex + this.itemsPerPage, this.totalItems);
    this.paginatedUsers = this.filteredUsers.slice(startIndex, endIndex);
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

    this.filteredUsers.sort((a, b) => {
      let aValue = a[column as keyof User];
      let bValue = b[column as keyof User];

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
  showAddUserModal(): void {
    this.isEditMode = false;
    this.currentUser = this.createEmptyUser();
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.currentUser = this.createEmptyUser();
    this.isEditMode = false;
  }

  editUser(user: User): void {
    this.isEditMode = true;
    this.currentUser = { ...user };
    this.showModal = true;
  }

  toggleUserStatus(user: User): void {
    const index = this.users.findIndex(u => u.id === user.id);
    if (index !== -1) {
      this.users[index].active = !this.users[index].active;
      this.applyFilters();
      // TODO: Implement actual API call
      console.log('User status toggled:', this.users[index]);
    }
  }

  addUser(): void {
    this.isLoading = true;
    // Simulate API call
    setTimeout(() => {
      const newId = this.getNextId();
      this.currentUser.id = newId;
      this.currentUser.active = this.currentUser.active || false;
      this.users.unshift({ ...this.currentUser });
      this.applyFilters();
      this.isLoading = false;
      this.closeModal();
    }, 500);
  }

  updateUser(): void {
    this.isLoading = true;
    // Simulate API call
    setTimeout(() => {
      const index = this.users.findIndex(u => u.id === this.currentUser.id);
      if (index !== -1) {
        this.users[index] = { ...this.currentUser };
      }
      this.applyFilters();
      this.isLoading = false;
      this.closeModal();
    }, 500);
  }

  private getNextId(): number {
    return this.users.length > 0 ? Math.max(...this.users.map(u => u.id)) + 1 : 1;
  }

  // TrackBy function for performance
  trackByUserId(index: number, user: User): number {
    return user.id;
  }
}
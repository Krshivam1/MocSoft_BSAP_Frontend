import { Component, OnInit } from '@angular/core';

interface Role {
  id: number;
  roleName: string;
  active: boolean;
}

@Component({
  selector: 'app-role',
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.css']
})
export class RoleComponent implements OnInit {
  
  // Properties for table data
  roles: Role[] = [];
  filteredRoles: Role[] = [];
  paginatedRoles: Role[] = [];
  
  // Properties for search and pagination
  searchTerm: string = '';
  pageSize: number = 10;
  currentPage: number = 1;
  totalRoles: number = 0;
  originalTotalRoles: number = 0;
  
  // Properties for sorting
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  // Modal properties
  showModal: boolean = false;
  isEditing: boolean = false;
  selectedRole: Role = this.getDefaultRole();

  constructor() { }

  ngOnInit(): void {
    this.initializeData();
  }

  // Initialize mock data
  initializeData(): void {
    this.roles = [
      { id: 1, roleName: 'ADMIN', active: true },
      { id: 2, roleName: 'DGP', active: true },
      { id: 3, roleName: 'IG', active: true },
      { id: 4, roleName: 'SUPPORT', active: true },
      { id: 5, roleName: 'ADG HQ', active: true },
      { id: 6, roleName: 'SP', active: true },
      { id: 7, roleName: 'DIG', active: true }
    ];
    
    this.originalTotalRoles = this.roles.length;
    this.filteredRoles = [...this.roles];
    this.totalRoles = this.filteredRoles.length;
    this.updatePaginatedRoles();
  }

  // Get default role template
  getDefaultRole(): Role {
    return {
      id: 0,
      roleName: '',
      active: true
    };
  }

  // Search functionality
  onSearch(): void {
    if (!this.searchTerm.trim()) {
      this.filteredRoles = [...this.roles];
    } else {
      const searchLower = this.searchTerm.toLowerCase();
      this.filteredRoles = this.roles.filter(role => 
        role.id.toString().includes(searchLower) ||
        role.roleName.toLowerCase().includes(searchLower) ||
        (role.active ? 'active' : 'inactive').includes(searchLower)
      );
    }
    
    this.totalRoles = this.filteredRoles.length;
    this.currentPage = 1;
    this.updatePaginatedRoles();
  }

  // Page size change handler
  onPageSizeChange(): void {
    this.currentPage = 1;
    this.updatePaginatedRoles();
  }

  // Sorting functionality
  sortTable(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.filteredRoles.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (column) {
        case 'id':
          aValue = a.id;
          bValue = b.id;
          break;
        case 'roleName':
          aValue = a.roleName.toLowerCase();
          bValue = b.roleName.toLowerCase();
          break;
        case 'active':
          aValue = a.active;
          bValue = b.active;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) {
        return this.sortDirection === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return this.sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });

    this.updatePaginatedRoles();
  }

  // Pagination methods
  updatePaginatedRoles(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedRoles = this.filteredRoles.slice(startIndex, endIndex);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.getTotalPages()) {
      this.currentPage = page;
      this.updatePaginatedRoles();
    }
  }

  getTotalPages(): number {
    return Math.ceil(this.totalRoles / this.pageSize);
  }

  getVisiblePages(): number[] {
    const totalPages = this.getTotalPages();
    const visiblePages: number[] = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      visiblePages.push(i);
    }
    
    return visiblePages;
  }

  getStartRecord(): number {
    return this.totalRoles === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
  }

  getEndRecord(): number {
    const endRecord = this.currentPage * this.pageSize;
    return Math.min(endRecord, this.totalRoles);
  }

  // Modal methods
  openAddModal(): void {
    this.isEditing = false;
    this.selectedRole = this.getDefaultRole();
    this.showModal = true;
  }

  openEditModal(role: Role): void {
    this.isEditing = true;
    this.selectedRole = { ...role };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedRole = this.getDefaultRole();
  }

  saveRole(): void {
    if (this.isEditing) {
      // Update existing role
      const index = this.roles.findIndex(r => r.id === this.selectedRole.id);
      if (index !== -1) {
        this.roles[index] = { ...this.selectedRole };
      }
    } else {
      // Add new role
      const newId = this.roles.length > 0 ? Math.max(...this.roles.map(r => r.id)) + 1 : 1;
      this.selectedRole.id = newId;
      this.roles.push({ ...this.selectedRole });
    }
    
    this.filteredRoles = [...this.roles];
    this.totalRoles = this.filteredRoles.length;
    this.updatePaginatedRoles();
    this.closeModal();
  }

  // Action methods
  addRole(): void {
    this.openAddModal();
  }

  viewRole(role: Role): void {
    this.openEditModal(role);
  }

  toggleRoleStatus(role: Role): void {
    const action = role.active ? 'deactivate' : 'activate';
    const confirmMessage = `Are you sure you want to ${action} the role "${role.roleName}"?`;
    
    if (confirm(confirmMessage)) {
      role.active = !role.active;
      this.updatePaginatedRoles();
    }
  }
}
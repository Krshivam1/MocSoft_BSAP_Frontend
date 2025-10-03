import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, Subscription, debounceTime, distinctUntilChanged } from 'rxjs';
import { ApiService, User, ApiResponse, Role, State, District, Range } from '../../services/api.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit, OnDestroy {
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

  // Dropdown data
  roles: Role[] = [];
  states: State[] = [];
  districts: District[] = [];
  ranges: Range[] = [];

  // Debouncing properties
  private searchSubject = new Subject<string>();
  private searchSubscription?: Subscription;
  
  // Math reference for template
  Math = Math;

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.setupSearchDebouncing();
    this.loadUsers();
    this.loadDropdownData();
  }

  ngOnDestroy() {
    // Clean up subscription to prevent memory leaks
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  /**
   * Set up debounced search functionality
   */
  private setupSearchDebouncing(): void {
    this.searchSubscription = this.searchSubject
      .pipe(
        debounceTime(500), // Wait 500ms after last keystroke
        distinctUntilChanged() // Only search if value changed
      )
      .subscribe((searchTerm: string) => {
        this.performSearch(searchTerm);
      });
  }

  /**
   * Called when user types in search input
   */
  onSearchInput(): void {
    this.searchSubject.next(this.searchTerm);
  }

  /**
   * Perform the actual search
   */
  private performSearch(searchTerm: string): void {
    this.currentPage = 1;
    this.loadUsers();
  }

  /**
   * Manual search trigger
   */
  onSearch(): void {
    this.searchSubject.next(this.searchTerm);
  }

  /**
   * Clear search and reset
   */
  clearSearch(): void {
    this.searchTerm = '';
    this.currentPage = 1;
    this.loadUsers();
  }

  /**
   * Load users from API
   */
  loadUsers(): void {
    this.isLoading = true;
    this.apiService.getUsers(
      this.currentPage,
      this.itemsPerPage,
      this.searchTerm,
      this.getSortByField(),
      this.sortDirection
    ).subscribe({
      next: (response: ApiResponse<User[]>) => {
        this.isLoading = false;
        if (response.status === 'SUCCESS') {
          this.users = response.data || [];
          this.totalItems = response.pagination?.total || 0;
          this.totalPages = response.pagination?.totalPages || 0;
          this.updateFilteredData();
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error loading users:', error);
        // Handle error - show message to user
      }
    });
  }

  /**
   * Load dropdown data for forms
   */
  loadDropdownData(): void {
    // Load roles
    this.apiService.getActiveRoles().subscribe({
      next: (response: ApiResponse<Role[]>) => {
        if (response.status === 'SUCCESS') {
          this.roles = response.data || [];
        }
      },
      error: (error) => {
        console.error('Error loading roles:', error);
      }
    });

    // Load states
    this.apiService.getActiveStates().subscribe({
      next: (response: ApiResponse<State[]>) => {
        if (response.status === 'SUCCESS') {
          this.states = response.data || [];
        }
      },
      error: (error) => {
        console.error('Error loading states:', error);
      }
    });

    // Uncomment and implement if needed:
    // // Load ranges
    // this.apiService.getRanges().subscribe({
    //   next: (response: ApiResponse<Range[]>) => {
    //     if (response.status === 'SUCCESS') {
    //       this.ranges = response.data || [];
    //     }
    //   },
    //   error: (error) => {
    //     console.error('Error loading ranges:', error);
    //   }
    // });

  }

  // /**
  //  * Load districts based on selected range
  //  */
  // loadDistricts(rangeId?: number): void {
  //   if (rangeId) {
  //     this.apiService.getDistricts(1, 100, '', '', '', undefined, rangeId).subscribe({
  //       next: (response: ApiResponse<District[]>) => {
  //         if (response.status === 'SUCCESS') {
  //           this.districts = response.data || [];
  //         }
  //       },
  //       error: (error) => {
  //         console.error('Error loading districts:', error);
  //       }
  //     });
  //   } else {
  //     this.districts = [];
  //   }
  // }

  private createEmptyUser(): User {
    return {
      id: 0,
      firstName: '',
      lastName: '',
      email: '',
      mobileNo: '',
      contactNo: '',
      userImage: '',
      stateId: undefined,
      rangeId: undefined,
      districtId: undefined,
      roleId: 0,
      password: '',
      verified: false,
      isFirst: true,
      joiningDate: '',
      endDate: '',
      numberSubdivision: 0,
      numberCircle: 0,
      numberPs: 0,
      numberOp: 0,
      active: true
    };
  }

  // Search and filter methods
  onPageSizeChange(): void {
    this.itemsPerPage = this.pageSize;
    this.currentPage = 1;
    this.loadUsers();
  }

  private updateFilteredData(): void {
    this.filteredUsers = [...this.users];
    this.updatePaginatedData();
  }

  // Pagination methods
  private updatePaginatedData(): void {
    this.paginatedUsers = [...this.users]; // Already paginated from API
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadUsers();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadUsers();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadUsers();
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
  sortTable(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    // Reload from API with new sorting
    this.loadUsers();
  }

  private getSortByField(): string {
    // Map UI column names to API field names
    const fieldMap: { [key: string]: string } = {
      'id': 'id',
      'name': 'firstName',
      'email': 'email',
      'role': 'roleId',
      'phone': 'mobileNo',
      'department': 'districtId',
      'active': 'active'
    };
    return fieldMap[this.sortColumn] || 'firstName';
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
    this.districts = []; // Reset districts
  }

  editUser(user: User): void {
    this.isEditMode = true;
    this.currentUser = { ...user };
    
    // Load districts if range is selected
    // if (this.currentUser.rangeId) {
    //   this.loadDistricts(this.currentUser.rangeId);
    // }
    
    this.showModal = true;
  }

  toggleUserStatus(user: User): void {
    this.apiService.toggleUserStatus(user.id, !user.active).subscribe({
      next: (response: ApiResponse<User>) => {
        if (response.status === 'SUCCESS') {
          // Update local data
          const index = this.users.findIndex(u => u.id === user.id);
          if (index !== -1) {
            this.users[index].active = !user.active;
          }
          this.updateFilteredData();
        }
      },
      error: (error) => {
        console.error('Error toggling user status:', error);
        // Handle error - show message to user
      }
    });
  }

  // Handle range selection change
  onRangeChange(rangeId?: number): void {
    this.currentUser.rangeId = rangeId;
    this.currentUser.districtId = undefined; // Reset district when range changes
    // this.loadDistricts(rangeId);
  }

  addUser(): void {
    if (this.isLoading) return;
    
    this.isLoading = true;
    this.apiService.createUser(this.currentUser).subscribe({
      next: (response: ApiResponse<User>) => {
        this.isLoading = false;
        if (response.status === 'SUCCESS') {
          this.closeModal();
          this.loadUsers(); // Reload to get the latest data
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error creating user:', error);
        // Handle error - show message to user
      }
    });
  }

  updateUser(): void {
    if (this.isLoading) return;
    
    this.isLoading = true;
    this.apiService.updateUser(this.currentUser.id, this.currentUser).subscribe({
      next: (response: ApiResponse<User>) => {
        this.isLoading = false;
        if (response.status === 'SUCCESS') {
          this.closeModal();
          this.loadUsers(); // Reload to get the latest data
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error updating user:', error);
        // Handle error - show message to user
      }
    });
  }

  // Helper properties for template
  get showingStart(): number {
    return (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  get showingEnd(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
  }

  // Get full name for display
  getFullName(user: User): string {
    return `${user.firstName} ${user.lastName}`.trim();
  }

  // Get role name for display
  getRoleName(roleId: number): string {
    const role = this.roles.find(r => r.id === roleId);
    return role ? role.roleName : 'Unknown';
  }

  // Get state name for display
  getStateName(stateId?: number): string {
    if (!stateId) return '-';
    const state = this.states.find(s => s.id === stateId);
    return state ? state.stateName : 'Unknown';
  }

  // Get district name for display
  getDistrictName(districtId?: number): string {
    if (!districtId) return '-';
    const district = this.districts.find(d => d.id === districtId);
    return district ? district.districtName : 'Unknown';
  }

  // Get range name for display
  getRangeName(rangeId?: number): string {
    if (!rangeId) return '-';
    const range = this.ranges.find(r => r.id === rangeId);
    return range ? range.rangeName : 'Unknown';
  }

  // TrackBy function for performance
  trackByUserId(index: number, user: User): number {
    return user.id;
  }
}
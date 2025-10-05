import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, Subscription, debounceTime, distinctUntilChanged } from 'rxjs';
import { ApiService, User, ApiResponse, Role, State, Range } from '../../services/api.service';
import Districts from '../../models/Districts';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit, OnDestroy {
  users: User[] = [];
  filteredUsers: User[] = [];
  paginatedUsers: User[] = [];
  
  showModal = false;
  currentUser: User = this.createEmptyUser();
  isEditMode = false;
  isLoading = false;
  
  searchTerm = '';
  currentPage = 1;
  itemsPerPage = 10;
  pageSize = 10;
  totalItems = 0;
  totalPages = 0;
  
  sortColumn = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  roles: Role[] = [];
  states: State[] = [];
  districts: Districts[] = [];
  ranges: Range[] = [];

  private searchSubject = new Subject<string>();
  private searchSubscription?: Subscription;
  
  Math = Math;

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.setupSearchDebouncing();
    this.loadUsers();
    this.loadDropdownData();
  }

  ngOnDestroy() {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  private setupSearchDebouncing(): void {
    this.searchSubscription = this.searchSubject
      .pipe(
        debounceTime(500), 
        distinctUntilChanged() 
      )
      .subscribe((searchTerm: string) => {
        this.performSearch(searchTerm);
      });
  }


  onSearchInput(): void {
    this.searchSubject.next(this.searchTerm);
  }


  private performSearch(searchTerm: string): void {
    this.currentPage = 1;
    this.loadUsers();
  }


  onSearch(): void {
    this.searchSubject.next(this.searchTerm);
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.currentPage = 1;
    this.loadUsers();
  }

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
      }
    });
  }

  loadDropdownData(): void {
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

  onPageSizeChange(): void {
    this.itemsPerPage = this.pageSize;
    this.currentPage = 1;
    this.loadUsers();
  }

  private updateFilteredData(): void {
    this.filteredUsers = [...this.users];
    this.updatePaginatedData();
  }

  private updatePaginatedData(): void {
    this.paginatedUsers = [...this.users]; 
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
          visiblePages.push(-1); 
        }
      }
      
      for (let i = startPage; i <= endPage; i++) {
        visiblePages.push(i);
      }
      
      if (endPage < this.totalPages) {
        if (endPage < this.totalPages - 1) {
          visiblePages.push(-1); 
        }
        visiblePages.push(this.totalPages);
      }
    }
    
    return visiblePages;
  }

  sortTable(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.loadUsers();
  }

  private getSortByField(): string {
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

  showAddUserModal(): void {
    this.isEditMode = false;
    this.currentUser = this.createEmptyUser();
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.currentUser = this.createEmptyUser();
    this.isEditMode = false;
    this.districts = []; 
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
          const index = this.users.findIndex(u => u.id === user.id);
          if (index !== -1) {
            this.users[index].active = !user.active;
          }
          this.updateFilteredData();
        }
      },
      error: (error) => {
        console.error('Error toggling user status:', error);
      }
    });
  }

  onRangeChange(rangeId?: number): void {
    this.currentUser.rangeId = rangeId;
    this.currentUser.districtId = undefined; 
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
          this.loadUsers(); 
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error creating user:', error);
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
          this.loadUsers(); 
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error updating user:', error);
      }
    });
  }

  get showingStart(): number {
    return (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  get showingEnd(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
  }

  getFullName(user: User): string {
    return `${user.firstName} ${user.lastName}`.trim();
  }

  getRoleName(roleId: number): string {
    const role = this.roles.find(r => r.id === roleId);
    return role ? role.roleName : 'Unknown';
  }

  getStateName(stateId?: number): string {
    if (!stateId) return '-';
    const state = this.states.find(s => s.id === stateId);
    return state ? state.stateName : 'Unknown';
  }

  getDistrictName(districtId?: number): string {
    if (!districtId) return '-';
    const district = this.districts.find(d => d.id === districtId);
    return district ? district.districtName : 'Unknown';
  }

  getRangeName(rangeId?: number): string {
    if (!rangeId) return '-';
    const range = this.ranges.find(r => r.id === rangeId);
    return range ? range.rangeName : 'Unknown';
  }

  trackByUserId(index: number, user: User): number {
    return user.id;
  }
}
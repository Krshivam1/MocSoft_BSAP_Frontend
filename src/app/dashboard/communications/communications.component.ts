import { Component, OnInit } from '@angular/core';

interface Communication {
  id: number;
  createdDate: Date;
  subject: string;
  recipient: string;
  message: string;
  document?: string;
  active: boolean;
}

@Component({
  selector: 'app-communications',
  templateUrl: './communications.component.html',
  styleUrls: ['./communications.component.css']
})
export class CommunicationsComponent implements OnInit {
  // Data properties
  communications: Communication[] = [];
  filteredCommunications: Communication[] = [];
  paginatedCommunications: Communication[] = [];
  
  // Modal properties
  showModal = false;
  currentCommunication: Communication = this.createEmptyCommunication();
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
    this.loadCommunications();
  }

  private loadCommunications() {
    // TODO: Replace with actual API call
    this.communications = [
      { id: 1, createdDate: new Date('2025-09-25'), subject: 'Monthly Security Report', recipient: 'All Districts', message: 'Please submit your monthly security reports by end of this week.', document: 'security-template.pdf', active: true },
      { id: 2, createdDate: new Date('2025-09-24'), subject: 'Training Schedule Update', recipient: 'Mumbai District', message: 'The training schedule for next month has been updated. Please check the new timings.', active: true },
      { id: 3, createdDate: new Date('2025-09-23'), subject: 'Budget Allocation Notice', recipient: 'Finance Department', message: 'Budget allocation for Q4 has been approved. Please coordinate with your teams.', document: 'budget-q4.xlsx', active: false },
      { id: 4, createdDate: new Date('2025-09-22'), subject: 'Policy Update Circular', recipient: 'All Officers', message: 'New policy updates have been implemented. All officers must review the attached document.', document: 'policy-update.pdf', active: true },
      { id: 5, createdDate: new Date('2025-09-21'), subject: 'Equipment Maintenance', recipient: 'Technical Team', message: 'Scheduled maintenance for all equipment will be conducted next week.', active: true },
      { id: 6, createdDate: new Date('2025-09-20'), subject: 'Annual Review Meeting', recipient: 'Senior Management', message: 'Annual review meeting scheduled for next month. Please prepare your department reports.', active: false }
    ];

    this.applyFilters();
  }

  private createEmptyCommunication(): Communication {
    return {
      id: 0,
      createdDate: new Date(),
      subject: '',
      recipient: '',
      message: '',
      document: '',
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
      this.filteredCommunications = [...this.communications];
    } else {
      const term = this.searchTerm.toLowerCase().trim();
      this.filteredCommunications = this.communications.filter(communication =>
        communication.subject.toLowerCase().includes(term) ||
        communication.recipient.toLowerCase().includes(term) ||
        communication.message.toLowerCase().includes(term)
      );
    }
    this.currentPage = 1;
    this.updatePaginatedData();
  }

  // Pagination methods
  updatePaginatedData(): void {
    this.totalItems = this.filteredCommunications.length;
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = Math.min(startIndex + this.itemsPerPage, this.totalItems);
    this.paginatedCommunications = this.filteredCommunications.slice(startIndex, endIndex);
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

    this.filteredCommunications.sort((a, b) => {
      let aValue = a[column as keyof Communication];
      let bValue = b[column as keyof Communication];

      // Handle Date objects
      if (aValue instanceof Date && bValue instanceof Date) {
        aValue = aValue.getTime();
        bValue = bValue.getTime();
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

    this.updatePaginatedData();
  }

  // Modal functionality
  showAddCommunicationModal(): void {
    this.isEditMode = false;
    this.currentCommunication = this.createEmptyCommunication();
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.currentCommunication = this.createEmptyCommunication();
    this.isEditMode = false;
  }

  editCommunication(communication: Communication): void {
    this.isEditMode = true;
    this.currentCommunication = { ...communication };
    this.showModal = true;
  }

  toggleCommunicationStatus(communication: Communication): void {
    const index = this.communications.findIndex(c => c.id === communication.id);
    if (index !== -1) {
      this.communications[index].active = !this.communications[index].active;
      this.applyFilters();
      // TODO: Implement actual API call
      console.log('Communication status toggled:', this.communications[index]);
    }
  }

  addCommunication(): void {
    this.isLoading = true;
    // Simulate API call
    setTimeout(() => {
      const newId = this.getNextId();
      this.currentCommunication.id = newId;
      this.currentCommunication.active = this.currentCommunication.active || false;
      this.communications.unshift({ ...this.currentCommunication });
      this.applyFilters();
      this.isLoading = false;
      this.closeModal();
    }, 500);
  }

  updateCommunication(): void {
    this.isLoading = true;
    // Simulate API call
    setTimeout(() => {
      const index = this.communications.findIndex(c => c.id === this.currentCommunication.id);
      if (index !== -1) {
        this.communications[index] = { ...this.currentCommunication };
      }
      this.applyFilters();
      this.isLoading = false;
      this.closeModal();
    }, 500);
  }

  private getNextId(): number {
    return this.communications.length > 0 ? Math.max(...this.communications.map(c => c.id)) + 1 : 1;
  }

  // TrackBy function for performance
  trackByCommunicationId(index: number, communication: Communication): number {
    return communication.id;
  }
}

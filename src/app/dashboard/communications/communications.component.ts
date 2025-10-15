import { Component, OnInit } from '@angular/core';

interface Communication {
  id: number;
  createdDate: Date;
  subject: string;
  battalionId: number;
  battalionName?: string;
  message: string;
  document?: string;
  active: boolean;
  replies?: Reply[];
}

interface Battalion {
  id: number;
  name: string;
}

interface Reply {
  id: number;
  replyDate: Date;
  replyBy: string;
  replyMessage: string;
  document?: string;
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
  battalions: Battalion[] = [];
  
  // Modal properties
  showModal = false;
  showDetailView = false;
  currentCommunication: Communication = this.createEmptyCommunication();
  selectedCommunication: Communication | null = null;
  isEditMode = false;
  isLoading = false;
  
  // Reply properties
  replyMessage = '';
  replyDocument = '';
  
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
    this.loadBattalions();
    this.loadCommunications();
  }

  private loadBattalions() {
    // TODO: Replace with actual API call
    this.battalions = [
      { id: 1, name: 'All Districts' },
      { id: 2, name: 'Mumbai District' },
      { id: 3, name: 'Delhi District' },
      { id: 4, name: 'Kolkata District' },
      { id: 5, name: 'Chennai District' },
      { id: 6, name: 'Bangalore District' },
      { id: 7, name: 'Hyderabad District' },
      { id: 8, name: 'Pune District' }
    ];
  }

  private loadCommunications() {
    // TODO: Replace with actual API call
    this.communications = [
      { 
        id: 1, 
        createdDate: new Date('2025-10-14'), 
        subject: 'Hello For Testing Functionality', 
        battalionId: 1,
        battalionName: 'All Districts',
        message: 'Testing For function', 
        document: 'security-template.pdf', 
        active: true,
        replies: [
          {
            id: 1,
            replyDate: new Date('2025-10-14'),
            replyBy: 'Muzaffarpur Rail',
            replyMessage: 'Testing For function',
            document: 'reply-document.pdf'
          }
        ]
      },
      { id: 2, createdDate: new Date('2025-09-24'), subject: 'Training Schedule Update', battalionId: 2, battalionName: 'Mumbai District', message: 'The training schedule for next month has been updated. Please check the new timings.', active: true, replies: [] },
      { id: 3, createdDate: new Date('2025-09-23'), subject: 'Budget Allocation Notice', battalionId: 3, battalionName: 'Delhi District', message: 'Budget allocation for Q4 has been approved. Please coordinate with your teams.', document: 'budget-q4.xlsx', active: false, replies: [] },
      { id: 4, createdDate: new Date('2025-09-22'), subject: 'Policy Update Circular', battalionId: 1, battalionName: 'All Districts', message: 'New policy updates have been implemented. All officers must review the attached document.', document: 'policy-update.pdf', active: true, replies: [] },
      { id: 5, createdDate: new Date('2025-09-21'), subject: 'Equipment Maintenance', battalionId: 4, battalionName: 'Kolkata District', message: 'Scheduled maintenance for all equipment will be conducted next week.', active: true, replies: [] },
      { id: 6, createdDate: new Date('2025-09-20'), subject: 'Annual Review Meeting', battalionId: 5, battalionName: 'Chennai District', message: 'Annual review meeting scheduled for next month. Please prepare your department reports.', active: false, replies: [] }
    ];

    this.applyFilters();
  }

  private createEmptyCommunication(): Communication {
    return {
      id: 0,
      createdDate: new Date(),
      subject: '',
      battalionId: 0,
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
        (communication.battalionName && communication.battalionName.toLowerCase().includes(term)) ||
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

  // Detail view functionality
  viewCommunicationDetails(communication: Communication): void {
    this.selectedCommunication = { ...communication };
    this.showDetailView = true;
  }

  closeDetailView(): void {
    this.showDetailView = false;
    this.selectedCommunication = null;
    this.replyMessage = '';
    this.replyDocument = '';
  }

  sendReply(): void {
    if (!this.replyMessage.trim() || !this.selectedCommunication) {
      return;
    }

    this.isLoading = true;
    
    // Create new reply
    const newReply: Reply = {
      id: this.getNextReplyId(),
      replyDate: new Date(),
      replyBy: 'Current User', // TODO: Get from auth service
      replyMessage: this.replyMessage,
      document: this.replyDocument || undefined
    };

    // Simulate API call
    setTimeout(() => {
      if (this.selectedCommunication) {
        if (!this.selectedCommunication.replies) {
          this.selectedCommunication.replies = [];
        }
        this.selectedCommunication.replies.push(newReply);

        // Update the original communication in the array
        const index = this.communications.findIndex(c => c.id === this.selectedCommunication!.id);
        if (index !== -1) {
          this.communications[index] = { ...this.selectedCommunication };
        }
      }

      this.replyMessage = '';
      this.replyDocument = '';
      this.isLoading = false;
    }, 500);
  }

  private getNextReplyId(): number {
    let maxId = 0;
    this.communications.forEach(comm => {
      if (comm.replies) {
        comm.replies.forEach(reply => {
          if (reply.id > maxId) {
            maxId = reply.id;
          }
        });
      }
    });
    return maxId + 1;
  }

  // Helper methods
  getBattalionName(battalionId: number): string {
    const battalion = this.battalions.find(b => b.id === battalionId);
    return battalion ? battalion.name : '';
  }

  // TrackBy function for performance
  trackByCommunicationId(index: number, communication: Communication): number {
    return communication.id;
  }

  trackByReplyId(index: number, reply: Reply): number {
    return reply.id;
  }
}

import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

interface SubTopic {
  id: number;
  topicName: string;
  subTopicName: string;
  priority: number;
  active: boolean;
}

interface Topic {
  id: number;
  name: string;
}

@Component({
  selector: 'app-subtopics',
  templateUrl: './subtopics.component.html',
  styleUrls: ['./subtopics.component.css']
})
export class SubtopicsComponent implements OnInit {
  subtopics: SubTopic[] = [];
  filteredSubtopics: SubTopic[] = [];
  topics: Topic[] = [];
  form!: FormGroup;
  isEdit = false;
  currentEditId: number | null = null;
  searchTerm: string = '';
  statusFilter: string = 'all';

  @ViewChild('subTopicModal') subTopicModal!: TemplateRef<any>;

  constructor(
    private fb: FormBuilder,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.loadMockData();
    this.initializeForm();
    this.filteredSubtopics = [...this.subtopics];
  }

  initializeForm(): void {
    this.form = this.fb.group({
      topicId: ['', Validators.required],
      subTopicName: ['', [Validators.required, Validators.minLength(2)]],
      priority: [1, [Validators.required, Validators.min(1), Validators.max(10)]]
    });
  }

  loadMockData(): void {
    this.topics = [
      { id: 1, name: 'Crime Control' },
      { id: 2, name: 'Case Reporting' },
      { id: 3, name: 'Leave Monitoring' },
      { id: 4, name: 'MT Fleet Management' }
    ];

    this.subtopics = [
      { id: 21, topicName: 'Crime Control', subTopicName: 'Attack on Police', priority: 4, active: false },
      { id: 22, topicName: 'Case Reporting', subTopicName: 'Case Disposed Of this Month', priority: 1, active: false },
      { id: 23, topicName: 'Case Reporting', subTopicName: 'Case Remaining at the End of the Month', priority: 2, active: false },
      { id: 24, topicName: 'Leave Monitoring', subTopicName: 'No. of total application for Leave in current month', priority: 1, active: true },
      { id: 25, topicName: 'Leave Monitoring', subTopicName: 'No. of cases in which leave granted', priority: 2, active: true },
      { id: 26, topicName: 'MT Fleet Management', subTopicName: 'Heavy', priority: 1, active: true }
    ];
  }

  getActiveSubtopicsCount(): number {
    return this.subtopics.filter(sub => sub.active).length;
  }

  getInactiveSubtopicsCount(): number {
    return this.subtopics.filter(sub => !sub.active).length;
  }

  getPriorityClass(priority: number): string {
    if (priority <= 3) return 'priority-high';
    if (priority <= 6) return 'priority-medium';
    return 'priority-low';
  }

  filterSubtopics(event: any): void {
    this.searchTerm = event.target.value.toLowerCase();
    this.applyFilters();
  }

  filterByStatus(event: any): void {
    this.statusFilter = event.target.value;
    this.applyFilters();
  }

  applyFilters(): void {
    this.filteredSubtopics = this.subtopics.filter(subtopic => {
      const matchesSearch = !this.searchTerm || 
        subtopic.subTopicName.toLowerCase().includes(this.searchTerm) ||
        subtopic.topicName.toLowerCase().includes(this.searchTerm);
      
      const matchesStatus = this.statusFilter === 'all' || 
        (this.statusFilter === 'active' && subtopic.active) ||
        (this.statusFilter === 'inactive' && !subtopic.active);
      
      return matchesSearch && matchesStatus;
    });
  }

  openAddModal(): void {
    this.isEdit = false;
    this.currentEditId = null;
    this.form.reset();
    this.form.patchValue({ priority: 1 });
    this.modalService.open(this.subTopicModal, { size: 'lg' });
  }

  openEditModal(sub: SubTopic): void {
    this.isEdit = true;
    this.currentEditId = sub.id;
    
    const topic = this.topics.find(t => t.name === sub.topicName);
    this.form.setValue({
      topicId: topic?.id || '',
      subTopicName: sub.subTopicName,
      priority: sub.priority
    });
    
    this.modalService.open(this.subTopicModal, { size: 'lg' });
  }

  save(modal: any): void {
    if (this.form.invalid) {
      this.markFormGroupTouched();
      return;
    }

    const formValue = this.form.value;
    const topic = this.topics.find(t => t.id == formValue.topicId);

    if (this.isEdit && this.currentEditId !== null) {
      const index = this.subtopics.findIndex(s => s.id === this.currentEditId);
      if (index > -1) {
        this.subtopics[index] = {
          ...this.subtopics[index],
          topicName: topic?.name || '',
          subTopicName: formValue.subTopicName,
          priority: formValue.priority
        };
      }
    } else {
      const newSubTopic: SubTopic = {
        id: Math.max(...this.subtopics.map(s => s.id)) + 1,
        topicName: topic?.name || '',
        subTopicName: formValue.subTopicName,
        priority: formValue.priority,
        active: false
      };
      this.subtopics.push(newSubTopic);
    }

    this.applyFilters();
    modal.close();
  }

  toggleStatus(sub: SubTopic): void {
    sub.active = !sub.active;
    this.applyFilters();
  }

  private markFormGroupTouched(): void {
    Object.keys(this.form.controls).forEach(key => {
      const control = this.form.get(key);
      control?.markAsTouched();
    });
  }
}
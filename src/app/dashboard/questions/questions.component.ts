// Enhanced TypeScript Component
import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';

declare var bootstrap: any;

interface Question {
  id?: number;
  topicId?: number;
  topicName?: string;
  subtopicId?: number;
  subTopicName?: string;
  name?: string;
  priority?: number;
  type?: string;
  default?: string;
  formula?: string;
  active?: boolean;
}

@Component({
  selector: 'app-questions',
  templateUrl: './questions.component.html',
  styleUrls: ['./questions.component.css']
})
export class QuestionsComponent implements OnInit, AfterViewInit {
  ADQSTN = true;   // flag for Add Question permission
  EDQSTN = true;   // flag for Edit Question permission

  topics = [
    { id: 4, moduleName: 'Crime Statistics', topicName: 'Investigation Control', topicSubName: '', priority: 5, active: true, formType: 'NORMAL', previous: true, cumulative: false },
    { id: 5, moduleName: 'Crime Statistics', topicName: 'Crime Control', topicSubName: '', priority: 2, active: false, formType: 'NORMAL', previous: true, cumulative: true },
    { id: 6, moduleName: 'Crime Statistics', topicName: 'Economic & Cyber Crime', topicSubName: '', priority: 9, active: true, formType: 'Q/ST', previous: true, cumulative: true },
    { id: 7, moduleName: 'Crime Statistics', topicName: 'Crime Prevention Actions', topicSubName: '', priority: 4, active: false, formType: 'NORMAL', previous: true, cumulative: true }
  ];

  subtopics = [
    { id: 1, topicId: 1, subTopicName: 'Algebra' },
    { id: 2, topicId: 2, subTopicName: 'Physics' }
  ];

  questions: Question[] = [
    {
      id: 11,
      topicName: 'Investigation Control',
      subTopicName: '',
      name: 'No. of SR cases Pending at the end of the month',
      priority: 9,
      type: 'Text',
      default: 'NONE',
      formula: '',
      active: false
    },
    {
      id: 12,
      topicName: 'Investigation Control',
      subTopicName: '',
      name: 'No. of SR cases in which Special Reports issued by SP (other than final order or Report-2) [कितने विशेष प्रतिवेदित कांडो में पुलिस अधीक्षक द्वारा विशेष रिपोर्ट निर्गत की गई ? ( प्रतिवेदन-2 या अंतिम आदेश के अलावा )]',
      priority: 9,
      type: 'Text',
      default: 'NONE',
      formula: '',
      active: true
    },
    {
      id: 13,
      topicName: 'Investigation Control',
      subTopicName: '',
      name: 'No. of warrants pending in Cases at the end of month महीने के अंत में लंबित वारंट की संख्या',
      priority: 2,
      type: 'Text',
      default: 'NONE',
      formula: '',
      active: false
    },
    {
      id: 14,
      topicName: 'CCA',
      subTopicName: '',
      name: 'No. of persons against whom CCA (Section-12) proposals submitted [इस माह कितने व्यक्तियों के विरुद्ध CCA (धारा -12) प्रस्ताव प्रस्तुत किए गए ]',
      priority: 3,
      type: 'Text',
      default: 'NONE',
      formula: '',
      active: true
    },
    {
      id: 15,
      topicName: 'CCA',
      subTopicName: '',
      name: 'No. of persons against whom CCA (Section-3) order passed by DM [इस माह कितने व्यक्तियों के खिलाफ CCA (धारा',
      priority: 2,
      type: 'Text',
      default: 'NONE',
      formula: '',
      active: true
    }
  ];

  filteredQuestions: Question[] = [];
  newQuestion: Question = {};
  isEditMode: boolean = false;
  modal: any;
  searchTerm: string = '';
  statusFilter: string = 'all';

  @ViewChild('addQuestionForm') addQuestionForm!: NgForm;

  constructor() { }

  ngOnInit(): void {
    this.filteredQuestions = [...this.questions];
  }

  ngAfterViewInit() {
    const modalEl = document.getElementById('addQuestionModal');
    this.modal = new bootstrap.Modal(modalEl);
  }

  getActiveQuestionsCount(): number {
    return this.questions.filter(q => q.active).length;
  }

  getInactiveQuestionsCount(): number {
    return this.questions.filter(q => !q.active).length;
  }

  getPriorityClass(priority: number | undefined): string {
    if (!priority) return 'priority-low';
    
    if (priority <= 3) return 'priority-high';
    if (priority <= 6) return 'priority-medium';
    return 'priority-low';
  }

  filterQuestions(event: any): void {
    this.searchTerm = event.target.value.toLowerCase();
    this.applyFilters();
  }

  filterByStatus(event: any): void {
    this.statusFilter = event.target.value;
    this.applyFilters();
  }

  applyFilters(): void {
    this.filteredQuestions = this.questions.filter(question => {
      const matchesSearch = !this.searchTerm || 
        question.name?.toLowerCase().includes(this.searchTerm) ||
        question.topicName?.toLowerCase().includes(this.searchTerm) ||
        question.subTopicName?.toLowerCase().includes(this.searchTerm);
      
      const matchesStatus = this.statusFilter === 'all' || 
        (this.statusFilter === 'active' && question.active) ||
        (this.statusFilter === 'inactive' && !question.active);
      
      return matchesSearch && matchesStatus;
    });
  }

  onTopicChange() {
    console.log('Topic changed:', this.newQuestion.topicId);
  }

  onDefaultChange() {
    console.log('Default changed:', this.newQuestion.default);
  }

  saveQuestion() {
    if (this.isEditMode) {
      const index = this.questions.findIndex(q => q.id === this.newQuestion.id);
      if (index > -1) {
        this.newQuestion.topicName = this.topics.find(t => t.id == this.newQuestion.topicId)?.topicName;
        this.newQuestion.subTopicName = this.subtopics.find(st => st.id == this.newQuestion.subtopicId)?.subTopicName;
        this.questions[index] = { ...this.newQuestion };
      }
    } else {
      this.newQuestion.id = Math.max(...this.questions.map(q => q.id || 0)) + 1;
      this.newQuestion.topicName = this.topics.find(t => t.id == this.newQuestion.topicId)?.topicName;
      this.newQuestion.subTopicName = this.subtopics.find(st => st.id == this.newQuestion.subtopicId)?.subTopicName;
      this.newQuestion.active = this.newQuestion.active || true;
      this.questions.push({ ...this.newQuestion });
    }

    // Reset and update filtered list
    this.newQuestion = {};
    this.isEditMode = false;
    this.applyFilters();

    // Close modal
    this.modal.hide();
  }

  openAddModal() {
    this.isEditMode = false;
    this.newQuestion = {};
  }

  openEditModal(q: Question) {
    this.isEditMode = true;

    // Find topicId from topicName
    const topic = this.topics.find(t => t.topicName === q.topicName);
    const subtopic = this.subtopics.find(st => st.subTopicName === q.subTopicName);

    this.newQuestion = {
      ...q,
      topicId: topic?.id,
      subtopicId: subtopic?.id
    };
    
    this.modal.show();
  }
}
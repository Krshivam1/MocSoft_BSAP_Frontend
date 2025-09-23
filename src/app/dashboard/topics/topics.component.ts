import { Component } from '@angular/core';

interface Topic {
  id: number;
  moduleName: string;
  topicName: string;
  topicSubName: string;
  priority: number;
  active: boolean;
  formType: string;
  previous: boolean;
  cumulative: boolean;
  firstMonth?: boolean;
  startMonth?: string;
  endMonth?: string;
}

@Component({
  selector: 'app-topics',
  templateUrl: './topics.component.html',
  styleUrls: ['./topics.component.css']
})
export class TopicsComponent {
  // Sample Topics List
  showModal = false;
    searchText: string = '';



  topics: Topic[] = [
    { id: 4, moduleName: 'Crime Statistics', topicName: 'Investigation Control', topicSubName: '', priority: 5, active: true, formType: 'NORMAL', previous: true, cumulative: false },
    { id: 5, moduleName: 'Crime Statistics', topicName: 'Crime Control', topicSubName: '', priority: 2, active: false, formType: 'NORMAL', previous: true, cumulative: true },
    { id: 6, moduleName: 'Crime Statistics', topicName: 'Economic & Cyber Crime', topicSubName: '', priority: 9, active: true, formType: 'Q/ST', previous: true, cumulative: true },
    { id: 7, moduleName: 'Crime Statistics', topicName: 'Crime Prevention Actions', topicSubName: '', priority: 4, active: false, formType: 'NORMAL', previous: true, cumulative: true }
  ];

  // Dropdown values
  modules: string[] = ['Crime Statistics', 'Public Safety', 'Investigation', 'Reports'];
  formTypes: string[] = ['NORMAL', 'Q/ST', 'SUMMARY'];
  months: string[] = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Modal states
  showAddModal = false;
  showEditModal = false;
  editingTopic?: Topic;

  // Open Add Modal
  openAddModal() {
    this.showAddModal = true;
  }

  // Open Edit Modal
  openEditModal(topic: Topic) {
    this.editingTopic = { ...topic }; // Clone object to edit safely
    this.showEditModal = true;
  }

  // Close All Modals
  closeModals() {
    this.showAddModal = false;
    this.showEditModal = false;
  }

  // Toggle Active/Inactive
  toggleActive(topic: Topic) {
    topic.active = !topic.active;
  }

  // Save Topic (mock)
  saveTopic() {
    alert('Topic saved successfully!');
    this.closeModals();
  }
   get filteredTopics() {
    if (!this.searchText) return this.topics;

    const lower = this.searchText.toLowerCase();
    return this.topics.filter(t =>
      Object.values(t).some(val => String(val).toLowerCase().includes(lower))
    );
  }
}

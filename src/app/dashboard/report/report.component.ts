import { Component, AfterViewInit } from '@angular/core';
import { Chart, ChartConfiguration } from 'chart.js';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css']
})
export class ReportComponent implements AfterViewInit {

  // Dropdown data
  districts = [
    { id: 1, name: 'Patna' },
    { id: 2, name: 'Gya' },
    { id: 3, name: 'Chapra'}
  ];
  modules = [
    { id: 1, name: 'Module X' },
    { id: 2, name: 'Module Y' }
  ];
  topics: any[] = [];
  subTopics: any[] = [];
  questions: any[] = [];

  months = ['Jan-2025','Feb-2025','Mar-2025','Apr-2025','May-2025','Jun-2025'];

  // Selected values
  selectedDistricts: number[] = [];
  selectedModules: number[] = [];
  selectedTopics: number[] = [];
  selectedSubTopics: number[] = [];
  selectedQuestions: number[] = [];
  startMonth = '';
  endMonth = '';

  // Chart
  chart?: Chart;

  // Embedded file URL
  dataFileUrl = 'https://example.com/report.pdf';

  ngAfterViewInit() {
    this.loadChart();
  }

  // District methods
  onDistrictCheckboxChange(districtId: number, event: any) {
    this.updateSelection(this.selectedDistricts, districtId, event.target.checked);
  }

  selectAllDistricts() {
    this.selectedDistricts = this.districts.map(d => d.id);
  }

  clearAllDistricts() {
    this.selectedDistricts = [];
  }

  // Module methods
  onModuleCheckboxChange(moduleId: number, event: any) {
    this.updateSelection(this.selectedModules, moduleId, event.target.checked);
    this.onModuleChange();
  }

  selectAllModules() {
    this.selectedModules = this.modules.map(m => m.id);
    this.onModuleChange();
  }

  clearAllModules() {
    this.selectedModules = [];
    this.onModuleChange();
  }

  onModuleChange() {
    // Clear dependent dropdowns when module changes
    this.selectedTopics = [];
    this.selectedSubTopics = [];
    this.selectedQuestions = [];
    this.topics = [];
    this.subTopics = [];
    this.questions = [];

    // mock topics based on selected modules
    if (this.selectedModules.length > 0) {
      this.topics = [
        { id: 11, name: 'Topic 1' },
        { id: 12, name: 'Topic 2' },
        { id: 13, name: 'Topic 3' }
      ];
    }
  }

  // Topic methods
  onTopicCheckboxChange(topicId: number, event: any) {
    this.updateSelection(this.selectedTopics, topicId, event.target.checked);
    this.onTopicChange();
  }

  selectAllTopics() {
    this.selectedTopics = this.topics.map(t => t.id);
    this.onTopicChange();
  }

  clearAllTopics() {
    this.selectedTopics = [];
    this.onTopicChange();
  }

  onTopicChange() {
    // Clear dependent dropdowns when topic changes
    this.selectedSubTopics = [];
    this.selectedQuestions = [];
    this.subTopics = [];
    this.questions = [];

    // mock subtopics based on selected topics
    if (this.selectedTopics.length > 0) {
      this.subTopics = [
        { id: 21, name: 'SubTopic A' },
        { id: 22, name: 'SubTopic B' },
        { id: 23, name: 'SubTopic C' }
      ];
    }
  }

  // Sub-Topic methods
  onSubTopicCheckboxChange(subTopicId: number, event: any) {
    this.updateSelection(this.selectedSubTopics, subTopicId, event.target.checked);
    this.onSubTopicChange();
  }

  selectAllSubTopics() {
    this.selectedSubTopics = this.subTopics.map(s => s.id);
    this.onSubTopicChange();
  }

  clearAllSubTopics() {
    this.selectedSubTopics = [];
    this.onSubTopicChange();
  }

  onSubTopicChange() {
    // Clear questions when subtopic changes
    this.selectedQuestions = [];
    this.questions = [];

    // mock questions based on selected subtopics
    if (this.selectedSubTopics.length > 0) {
      this.questions = [
        { id: 31, text: 'Question 1' },
        { id: 32, text: 'Question 2' },
        { id: 33, text: 'Question 3' },
        { id: 34, text: 'Question 4' }
      ];
    }
  }

  // Question methods
  onQuestionCheckboxChange(questionId: number, event: any) {
    this.updateSelection(this.selectedQuestions, questionId, event.target.checked);
  }

  selectAllQuestions() {
    this.selectedQuestions = this.questions.map(q => q.id);
  }

  clearAllQuestions() {
    this.selectedQuestions = [];
  }

  // Helper method to update selection arrays
  private updateSelection(selectionArray: number[], id: number, isChecked: boolean) {
    if (isChecked) {
      if (!selectionArray.includes(id)) {
        selectionArray.push(id);
      }
    } else {
      const index = selectionArray.indexOf(id);
      if (index > -1) {
        selectionArray.splice(index, 1);
      }
    }
  }

  // Existing methods remain the same
  onFilter() {
    console.log('Filters:', {
      districts: this.selectedDistricts,
      modules: this.selectedModules,
      topics: this.selectedTopics,
      subTopics: this.selectedSubTopics,
      questions: this.selectedQuestions,
      startMonth: this.startMonth,
      endMonth: this.endMonth
    });
    this.updateChart();
  }

  viewReport() {
    alert('Viewing report...');
  }

  downloadExcel() {
    alert('Excel download triggered.');
  }

  downloadPdf() {
    alert('PDF download triggered.');
  }

  printChart() {
    const canvas = document.getElementById('reportChart') as HTMLCanvasElement;
    if (!canvas) return;

    const imageUrl = canvas.toDataURL('image/png');
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`<img src="${imageUrl}" style="width:100%"/>`);
      printWindow.print();
    }
  }

  // Chart.js setup
  loadChart() {
    const ctx = document.getElementById('reportChart') as HTMLCanvasElement;

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr'],
        datasets: [
          {
            label: 'Performance',
            data: [65, 59, 80, 81],
            backgroundColor: '#0d6efd'
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top' },
          title: { display: true, text: 'Performance Data' }
        }
      }
    };

    this.chart = new Chart(ctx, config);
  }

  updateChart() {
    if (this.chart) {
      this.chart.data.datasets[0].data = [
        Math.random()*100,
        Math.random()*100,
        Math.random()*100,
        Math.random()*100
      ];
      this.chart.update();
    }
  }
}
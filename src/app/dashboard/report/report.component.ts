import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { NotificationService } from '../../services/notification.service';

interface Battalion {
  id: number;
  battalionName: string;
}

interface Module {
  id: number;
  moduleName: string;
}

interface Topic {
  id: number;
  topicName: string;
  moduleId: number;
}

interface SubTopic {
  id: number;
  subTopicName: string;
  topicId: number;
}

interface Question {
  id: number;
  question: string;
  topicId: number;
  subTopicId?: number;
}

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css']
})
export class ReportComponent implements OnInit {
  reportForm!: FormGroup;
  isLoading = false;
  isGenerating = false;
  
  // Data arrays
  battalions: Battalion[] = [];
  modules: Module[] = [];
  topics: Topic[] = [];
  subTopics: SubTopic[] = [];
  questions: Question[] = [];
  
  // Filtered arrays
  filteredTopics: Topic[] = [];
  filteredSubTopics: SubTopic[] = [];
  filteredQuestions: Question[] = [];
  
  // Month options
  months = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ];
  
  // Years (current and previous years)
  years: number[] = [];
  
  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private notificationService: NotificationService
  ) {
    this.initializeForm();
    this.generateYears();
  }

  ngOnInit(): void {
    this.loadInitialData();
  }

  private initializeForm(): void {
    this.reportForm = this.fb.group({
      battalionId: [''],
      moduleId: [''],
      topicId: [''],
      subTopicId: [''],
      questionId: [''],
      startMonth: [''],
      startYear: [new Date().getFullYear()],
      endMonth: [''],
      endYear: [new Date().getFullYear()],
      reportType: ['detailed', Validators.required],
      includeCharts: [true],
      includeTable: [true]
    });
  }

  private generateYears(): void {
    const currentYear = new Date().getFullYear();
    for (let i = currentYear; i >= currentYear - 10; i--) {
      this.years.push(i);
    }
  }

  private loadInitialData(): void {
    this.isLoading = true;
    
    // Load battalions - get all active battalions
    this.apiService.getActiveBattalions().subscribe({
      next: (response) => {
        if (response.status === 'SUCCESS') {
          this.battalions = response.data || [];
        }
      },
      error: (error) => {
        console.error('Error loading battalions:', error);
        this.notificationService.error('Failed to load battalions');
      }
    });
    
    // Load modules
    this.apiService.getActiveModules().subscribe({
      next: (response) => {
        if (response.status === 'SUCCESS') {
          this.modules = response.data || [];
        }
      },
      error: (error) => {
        console.error('Error loading modules:', error);
        this.notificationService.error('Failed to load modules');
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }



  onModuleChange(): void {
    const moduleId = this.reportForm.get('moduleId')?.value;
    if (moduleId) {
      this.apiService.getTopicsByModuleForReport(moduleId).subscribe({
        next: (response) => {
          if (response.status === 'SUCCESS') {
            this.filteredTopics = response.data || [];
            this.topics = this.filteredTopics;
          }
        },
        error: (error) => {
          console.error('Error loading topics:', error);
          this.notificationService.error('Failed to load topics');
        }
      });
    } else {
      this.filteredTopics = [];
      this.filteredSubTopics = [];
      this.filteredQuestions = [];
    }
    
    // Reset dependent fields
    this.reportForm.patchValue({
      topicId: '',
      subTopicId: '',
      questionId: ''
    });
  }

  onTopicChange(): void {
    const topicId = this.reportForm.get('topicId')?.value;
    if (topicId) {
      // Load subtopics
      this.apiService.getSubTopicsByTopicForReport(topicId).subscribe({
        next: (response) => {
          if (response.status === 'SUCCESS') {
            this.filteredSubTopics = response.data || [];
            this.subTopics = this.filteredSubTopics;
          }
        },
        error: (error) => {
          console.error('Error loading subtopics:', error);
          this.notificationService.error('Failed to load subtopics');
        }
      });
      
      // Load questions
      this.apiService.getQuestionsByTopicForReport(topicId).subscribe({
        next: (response) => {
          if (response.status === 'SUCCESS') {
            this.filteredQuestions = response.data || [];
            this.questions = this.filteredQuestions;
          }
        },
        error: (error) => {
          console.error('Error loading questions:', error);
          this.notificationService.error('Failed to load questions');
        }
      });
    } else {
      this.filteredSubTopics = [];
      this.filteredQuestions = [];
    }
    
    // Reset dependent fields
    this.reportForm.patchValue({
      subTopicId: '',
      questionId: ''
    });
  }

  onSubTopicChange(): void {
    const subTopicId = this.reportForm.get('subTopicId')?.value;
    const topicId = this.reportForm.get('topicId')?.value;
    
    if (subTopicId && topicId) {
      this.apiService.getQuestionsByTopicForReport(topicId, subTopicId).subscribe({
        next: (response) => {
          if (response.status === 'SUCCESS') {
            this.filteredQuestions = response.data || [];
            this.questions = this.filteredQuestions;
          }
        },
        error: (error) => {
          console.error('Error loading filtered questions:', error);
          this.notificationService.error('Failed to load filtered questions');
        }
      });
    }
    
    // Reset question field
    this.reportForm.patchValue({
      questionId: ''
    });
  }

  private buildReportData(): any {
    const formValues = this.reportForm.value;
    
    const reportData: any = {
      reportType: formValues.reportType,
      includeCharts: formValues.includeCharts,
      includeTable: formValues.includeTable
    };
    
    // Add filters
    if (formValues.battalionId) {
      reportData.battalionIds = [formValues.battalionId];
    }
    if (formValues.moduleId) {
      reportData.moduleIds = [formValues.moduleId];
    }
    if (formValues.topicId) {
      reportData.topicIds = [formValues.topicId];
    }
    if (formValues.subTopicId) {
      reportData.subTopicIds = [formValues.subTopicId];
    }
    if (formValues.questionId) {
      reportData.questionIds = [formValues.questionId];
    }
    
    // Add date range
    if (formValues.startMonth && formValues.startYear) {
      reportData.fromDate = `${formValues.startYear}-${formValues.startMonth}-01`;
    }
    if (formValues.endMonth && formValues.endYear) {
      const lastDay = new Date(formValues.endYear, parseInt(formValues.endMonth), 0).getDate();
      reportData.toDate = `${formValues.endYear}-${formValues.endMonth}-${lastDay}`;
    }
    
    return reportData;
  }

  onGenerateReport(): void {
    if (this.reportForm.valid) {
      this.isGenerating = true;
      const reportData = this.buildReportData();
      
      this.apiService.generateReport(reportData).subscribe({
        next: (response) => {
          if (response.status === 'SUCCESS') {
            this.notificationService.success('Report generated successfully');
            // Handle the report data here (display charts, tables, etc.)
            console.log('Report data:', response.data);
          } else {
            this.notificationService.error(response.message || 'Failed to generate report');
          }
        },
        error: (error) => {
          console.error('Error generating report:', error);
          this.notificationService.error('Failed to generate report');
        },
        complete: () => {
          this.isGenerating = false;
        }
      });
    } else {
      this.notificationService.error('Please fill in all required fields');
      this.markFormGroupTouched();
    }
  }

  onViewReport(): void {
    if (this.reportForm.valid) {
      const reportData = this.buildReportData();
      
      this.apiService.getReportPreview(reportData).subscribe({
        next: (response) => {
          if (response.status === 'SUCCESS') {
            this.notificationService.success('Report preview generated');
            // Handle preview display
            console.log('Report preview:', response.data);
          } else {
            this.notificationService.error(response.message || 'Failed to generate preview');
          }
        },
        error: (error) => {
          console.error('Error generating preview:', error);
          this.notificationService.error('Failed to generate preview');
        }
      });
    } else {
      this.notificationService.error('Please fill in all required fields');
      this.markFormGroupTouched();
    }
  }

  onDownloadExcel(): void {
    if (this.reportForm.valid) {
      this.isGenerating = true;
      const reportData = this.buildReportData();
      
      const excelData = {
        reportData: {
          filters: reportData
        },
        format: {
          filename: `performance_report_${new Date().toISOString().split('T')[0]}`,
          includeCharts: reportData.includeCharts,
          includeMetadata: true
        }
      };
      
      this.apiService.exportReportToExcel(excelData).subscribe({
        next: (response) => {
          if (response.status === 'SUCCESS') {
            this.notificationService.success('Excel report generated successfully');
            // Handle download
            if (response.data?.downloadUrl) {
              window.open(response.data.downloadUrl, '_blank');
            }
          } else {
            this.notificationService.error(response.message || 'Failed to generate Excel report');
          }
        },
        error: (error) => {
          console.error('Error generating Excel report:', error);
          this.notificationService.error('Failed to generate Excel report');
        },
        complete: () => {
          this.isGenerating = false;
        }
      });
    } else {
      this.notificationService.error('Please fill in all required fields');
      this.markFormGroupTouched();
    }
  }

  onDownloadPDF(): void {
    if (this.reportForm.valid) {
      this.isGenerating = true;
      const reportData = this.buildReportData();
      
      const pdfData = {
        reportData: reportData,
        format: {
          filename: `performance_report_${new Date().toISOString().split('T')[0]}`,
          orientation: 'landscape',
          pageSize: 'A4',
          includeCharts: reportData.includeCharts,
          includeHeader: true,
          includeFooter: true
        }
      };
      
      this.apiService.exportReportToPDF(pdfData).subscribe({
        next: (response) => {
          if (response.status === 'SUCCESS') {
            this.notificationService.success('PDF report generated successfully');
            // Handle download
            if (response.data?.downloadUrl) {
              window.open(response.data.downloadUrl, '_blank');
            }
          } else {
            this.notificationService.error(response.message || 'Failed to generate PDF report');
          }
        },
        error: (error) => {
          console.error('Error generating PDF report:', error);
          this.notificationService.error('Failed to generate PDF report');
        },
        complete: () => {
          this.isGenerating = false;
        }
      });
    } else {
      this.notificationService.error('Please fill in all required fields');
      this.markFormGroupTouched();
    }
  }

  onResetForm(): void {
    this.reportForm.reset();
    this.reportForm.patchValue({
      startYear: new Date().getFullYear(),
      endYear: new Date().getFullYear(),
      reportType: 'detailed',
      includeCharts: true,
      includeTable: true
    });
    
    // Clear filtered arrays
    this.filteredTopics = [];
    this.filteredSubTopics = [];
    this.filteredQuestions = [];
  }

  private markFormGroupTouched(): void {
    Object.keys(this.reportForm.controls).forEach(key => {
      const control = this.reportForm.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.reportForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
}
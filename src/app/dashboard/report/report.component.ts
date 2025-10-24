import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { NotificationService } from '../../services/notification.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface Battalion {
  id: number;
  battalionName: string;
  battalionHead?: string;
  range?: {
    id: number;
    rangeName: string;
  };
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

interface ReportData {
  reportId: string;
  data: any[];
  summary?: any;
  chartData?: any;
  metadata?: any;
  trendData?: any[];
  performanceMetrics?: any[];
  complianceStatus?: any;
  pagination?: {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalElements: number;
    hasNext: boolean;
    hasPrevious: boolean;
    isFirst: boolean;
    isLast: boolean;
    numberOfElements: number;
    firstPage: number;
    lastPage: number;
    nextPage: number | null;
    previousPage: number | null;
    pageSizes: number[];
    sortBy: string;
    sortDirection: string;
  };
  performance?: {
    queryMetrics?: {
      totalQueryTime: string;
      recordsScanned: number;
      recordsReturned: number;
    };
    processingMetrics?: {
      totalProcessingTime: string;
    };
    cacheMetrics?: {
      cacheChecked: boolean;
      cacheHit: boolean;
      cacheStored: boolean;
    };
    optimizationSuggestions?: string[];
  };
}

interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

type ReportType = 'SUMMARY' | 'DETAILED' | 'COMPARISON' | 'TREND' | 'PERFORMANCE' | 'COMPLIANCE';
type ExportFormat = 'CSV' | 'EXCEL' | 'PDF' | 'JSON';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css']
})
export class ReportComponent implements OnInit, OnDestroy {
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
  
  // Report data
  reportData: ReportData | null = null;
  lastReportId: string | null = null;
  metadata: any = null;
  templates: any[] = [];
  
  private destroy$ = new Subject<void>();
  
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.reportForm = this.fb.group({
      reportType: ['SUMMARY', Validators.required],
      battalionIds: [[], Validators.required],
      moduleId: ['', Validators.required],
      topicId: [''],
      subTopicId: [''],
      questionId: [''],
      
      // Single month/year for SUMMARY, PERFORMANCE, COMPLIANCE
      month: [''],
      year: [new Date().getFullYear()],
      
      // Date range for DETAILED, COMPARISON, TREND
      fromDate: [''],
      toDate: [''],
      
      // Trend specific
      trendPeriod: ['MONTHLY'],
      
      // Chart configuration
      viewType: ['BOTH'],
      chartType: ['BAR'],
      
      // Pagination
      page: [0],
      pageSize: [50]
    });

    // Add conditional validators
    this.reportForm.get('reportType')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(reportType => {
        this.updateValidators(reportType);
      });
  }

  private updateValidators(reportType: ReportType): void {
    // Clear all validators first
    this.reportForm.get('month')?.clearValidators();
    this.reportForm.get('year')?.clearValidators();
    this.reportForm.get('fromDate')?.clearValidators();
    this.reportForm.get('toDate')?.clearValidators();
    this.reportForm.get('trendPeriod')?.clearValidators();

    // Add validators based on report type
    if (this.isSingleMonthReportType(reportType)) {
      this.reportForm.get('month')?.setValidators([Validators.required]);
      this.reportForm.get('year')?.setValidators([Validators.required]);
    } else if (this.isDateRangeReportType(reportType)) {
      this.reportForm.get('fromDate')?.setValidators([Validators.required]);
      this.reportForm.get('toDate')?.setValidators([Validators.required]);
    }

    if (reportType === 'TREND') {
      this.reportForm.get('trendPeriod')?.setValidators([Validators.required]);
    }

    // Update validity
    this.reportForm.get('month')?.updateValueAndValidity();
    this.reportForm.get('year')?.updateValueAndValidity();
    this.reportForm.get('fromDate')?.updateValueAndValidity();
    this.reportForm.get('toDate')?.updateValueAndValidity();
    this.reportForm.get('trendPeriod')?.updateValueAndValidity();
  }

  private isSingleMonthReportType(reportType: ReportType): boolean {
    return ['SUMMARY', 'PERFORMANCE', 'COMPLIANCE'].includes(reportType);
  }

  private isDateRangeReportType(reportType: ReportType): boolean {
    return ['DETAILED', 'COMPARISON', 'TREND'].includes(reportType);
  }

  // Template helper methods
  isSingleMonthReport(): boolean {
    return this.isSingleMonthReportType(this.reportForm.get('reportType')?.value);
  }

  isDateRangeReport(): boolean {
    return this.isDateRangeReportType(this.reportForm.get('reportType')?.value);
  }

  showDateRange(): boolean {
    return this.isSingleMonthReport() || this.isDateRangeReport();
  }

  showChartConfig(): boolean {
    const reportType = this.reportForm.get('reportType')?.value;
    return ['SUMMARY', 'COMPARISON', 'TREND'].includes(reportType);
  }

  private generateYears(): void {
    const currentYear = new Date().getFullYear();
    for (let i = currentYear; i >= currentYear - 10; i--) {
      this.years.push(i);
    }
  }

  private loadInitialData(): void {
    this.isLoading = true;
    
    // Load battalions using the new API method (if exists) or fallback
    this.loadBattalions();
    this.loadModules();
  }

  private loadBattalions(): void {
    // Use the existing getActiveBattalions method
    this.apiService.getActiveBattalions()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response.status === 'SUCCESS') {
            this.battalions = response.data || [];
          }
        },
        error: (error: any) => {
          console.error('Error loading battalions:', error);
          this.notificationService.error('Failed to load battalions');
        }
      });
  }

  private loadModules(): void {
    this.apiService.getActiveModules()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response.status === 'SUCCESS') {
            this.modules = response.data || [];
          }
        },
        error: (error: any) => {
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
      this.apiService.getTopicsByModule(moduleId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response: any) => {
            if (response.status === 'SUCCESS') {
              this.filteredTopics = response.data || [];
              this.topics = this.filteredTopics;
            }
          },
          error: (error: any) => {
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
      this.apiService.getSubTopicsByTopicForForm(topicId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response: any) => {
            if (response.status === 'SUCCESS') {
              this.filteredSubTopics = response.data || [];
              this.subTopics = this.filteredSubTopics;
            }
          },
          error: (error: any) => {
            console.error('Error loading subtopics:', error);
            this.notificationService.error('Failed to load subtopics');
          }
        });
      
      // Load questions
      this.apiService.getQuestionsByTopic(topicId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response: any) => {
            if (response.status === 'SUCCESS') {
              this.filteredQuestions = response.data || [];
              this.questions = this.filteredQuestions;
            }
          },
          error: (error: any) => {
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
      // Use the existing API method to get questions by subtopic
      this.apiService.getQuestionsBySubTopic(subTopicId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response: any) => {
            if (response.status === 'SUCCESS') {
              this.filteredQuestions = response.data || [];
              this.questions = this.filteredQuestions;
            }
          },
          error: (error: any) => {
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
    const reportType: ReportType = formValues.reportType;
    
    const reportData: any = {
      reportType: reportType,
      battalionIds: formValues.battalionIds || [],
      moduleId: formValues.moduleId,
      page: formValues.page || 0,
      size: formValues.pageSize || 50
    };

    // Add optional filters
    if (formValues.topicId) {
      reportData.topicIds = [formValues.topicId];
    }
    if (formValues.subTopicId) {
      reportData.subTopicIds = [formValues.subTopicId];
    }
    if (formValues.questionId) {
      reportData.questionIds = [formValues.questionId];
    }

    // Add date-related fields based on report type
    if (this.isSingleMonthReportType(reportType)) {
      if (formValues.month && formValues.year) {
        // Format month-year for API as "SEP-2025" instead of "09-2025"
        const formattedMonthYear = this.formatMonthYearForAPI(formValues.month, formValues.year);
        reportData.monthYear = formattedMonthYear;
      }
    } else if (this.isDateRangeReportType(reportType)) {
      if (formValues.fromDate) {
        reportData.fromDate = new Date(formValues.fromDate).toISOString();
      }
      if (formValues.toDate) {
        reportData.toDate = new Date(formValues.toDate).toISOString();
      }
    }

    // Add report-specific configurations
    switch (reportType) {
      case 'SUMMARY':
        reportData.viewType = formValues.viewType || 'BOTH';
        break;
      
      case 'TREND':
        reportData.trendPeriod = formValues.trendPeriod || 'MONTHLY';
        if (formValues.chartType) {
          reportData.chartConfig = {
            chartType: formValues.chartType,
            title: `${reportType} Analysis Report`
          };
        }
        break;
      
      case 'COMPARISON':
        if (formValues.chartType) {
          reportData.chartConfig = {
            chartType: formValues.chartType,
            title: `Battalion Performance Comparison`
          };
        }
        break;
      
      case 'PERFORMANCE':
        reportData.performanceMetrics = ['efficiency', 'completeness'];
        break;
      
      case 'COMPLIANCE':
        reportData.complianceThreshold = 80;
        break;
    }

    return reportData;
  }

  onGenerateReport(): void {
    if (this.reportForm.valid) {
      this.isGenerating = true;
      const reportData = this.buildReportData();
      const reportType: ReportType = reportData.reportType;
      
      // Use the generic generateReport method since specific methods may not exist
      const reportRequest = this.apiService.generateReport(reportData);
      
      reportRequest
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response: any) => {
            if (response.status === 'SUCCESS') {
              this.reportData = response.data;
              // Fix: Get reportId from the correct location in the response
              this.lastReportId = response.data?.metadata?.reportId || response.data?.reportId;
              
              // Debug logging
              console.log('Report generated successfully');
              console.log('Report ID:', this.lastReportId);
              console.log('Report Data:', this.reportData);
              console.log('Can export:', this.hasGeneratedReport());
              
              this.notificationService.success('Report generated successfully');
              
              // Scroll to results section
              setTimeout(() => {
                const resultsSection = document.querySelector('.card:last-child');
                resultsSection?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            } else {
              this.notificationService.error(response.message || 'Failed to generate report');
            }
          },
          error: (error: any) => {
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

  onExportReport(format: ExportFormat): void {
    if (!this.lastReportId) {
      this.notificationService.error('Please generate a report first');
      return;
    }

    this.isGenerating = true;
    
    this.apiService.exportReport(this.lastReportId, format)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response.status === 'SUCCESS') {
            this.notificationService.success(`${format} report exported successfully`);
            
            // Handle download
            if (response.data?.downloadUrl) {
              // Create a temporary link to trigger download
              const link = document.createElement('a');
              link.href = response.data.downloadUrl;
              link.download = response.data.fileName || `report.${format.toLowerCase()}`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }
          } else {
            this.notificationService.error(response.message || `Failed to export ${format} report`);
          }
        },
        error: (error: any) => {
          console.error(`Error exporting ${format} report:`, error);
          this.notificationService.error(`Failed to export ${format} report`);
        },
        complete: () => {
          this.isGenerating = false;
        }
      });
  }

  onGetMetadata(): void {
    this.isLoading = true;
    
    this.apiService.getReportMetadata()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response.status === 'SUCCESS') {
            this.metadata = response.data;
            this.notificationService.success('Metadata retrieved successfully');
            
            // Show metadata modal
            const modal = new (window as any).bootstrap.Modal(document.getElementById('metadataModal'));
            modal.show();
          } else {
            this.notificationService.error(response.message || 'Failed to get metadata');
          }
        },
        error: (error: any) => {
          console.error('Error getting metadata:', error);
          this.notificationService.error('Failed to get metadata');
        },
        complete: () => {
          this.isLoading = false;
        }
      });
  }

  onGetTemplates(): void {
    this.isLoading = true;
    
    this.apiService.getReportTemplates()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response.status === 'SUCCESS') {
            this.templates = response.data || [];
            this.notificationService.success('Templates retrieved successfully');
            
            // Show templates modal
            const modal = new (window as any).bootstrap.Modal(document.getElementById('templatesModal'));
            modal.show();
          } else {
            this.notificationService.error(response.message || 'Failed to get templates');
          }
        },
        error: (error: any) => {
          console.error('Error getting templates:', error);
          this.notificationService.error('Failed to get templates');
        },
        complete: () => {
          this.isLoading = false;
        }
      });
  }

  onResetForm(): void {
    this.reportForm.reset();
    this.reportForm.patchValue({
      reportType: 'SUMMARY',
      year: new Date().getFullYear(),
      viewType: 'BOTH',
      chartType: 'BAR',
      page: 0,
      pageSize: 50,
      trendPeriod: 'MONTHLY'
    });
    
    // Clear filtered arrays
    this.filteredTopics = [];
    this.filteredSubTopics = [];
    this.filteredQuestions = [];
    
    // Clear report data
    this.reportData = null;
    this.lastReportId = null;
  }

  onPageChange(page: number): void {
    if (page !== null && page !== undefined && page >= 0) {
      // Update the form page value
      this.reportForm.patchValue({ page: page });
      
      // Regenerate the report with new page
      this.onGenerateReport();
    }
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

  // Utility methods for date validation
  getMinDate(): string {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 5);
    return date.toISOString().split('T')[0];
  }

  getMaxDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  // Form field getters for template
  get reportTypeValue(): ReportType {
    return this.reportForm.get('reportType')?.value || 'SUMMARY';
  }

  get battalionIdsValue(): number[] {
    return this.reportForm.get('battalionIds')?.value || [];
  }

  get moduleIdValue(): number {
    return this.reportForm.get('moduleId')?.value;
  }

  // Validation helpers
  validateDateRange(): boolean {
    const fromDate = this.reportForm.get('fromDate')?.value;
    const toDate = this.reportForm.get('toDate')?.value;
    
    if (fromDate && toDate) {
      return new Date(fromDate) <= new Date(toDate);
    }
    return true;
  }

  // Error message helpers
  getFieldErrorMessage(fieldName: string): string {
    const field = this.reportForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) {
        return `${this.getFieldDisplayName(fieldName)} is required`;
      }
    }
    return '';
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      'reportType': 'Report Type',
      'battalionIds': 'Battalion(s)',
      'moduleId': 'Module',
      'month': 'Month',
      'year': 'Year',
      'fromDate': 'From Date',
      'toDate': 'To Date',
      'trendPeriod': 'Trend Period'
    };
    return displayNames[fieldName] || fieldName;
  }

  // Helper methods for pagination to avoid template errors
  hasPagination(): boolean {
    return !!(this.reportData?.pagination && this.reportData.pagination.totalPages > 1);
  }

  getCurrentPage(): number {
    return (this.reportData?.pagination?.currentPage || 0) + 1;
  }

  getTotalPages(): number {
    return this.reportData?.pagination?.totalPages || 1;
  }

  getNumberOfElements(): number {
    return this.reportData?.pagination?.numberOfElements || 0;
  }

  getTotalElements(): number {
    return this.reportData?.pagination?.totalElements || this.reportData?.data?.length || 0;
  }

  isPreviousDisabled(): boolean {
    return !this.reportData?.pagination?.hasPrevious;
  }

  isNextDisabled(): boolean {
    return !this.reportData?.pagination?.hasNext;
  }

  onPreviousPage(): void {
    const prevPage = this.reportData?.pagination?.previousPage;
    if (prevPage !== null && prevPage !== undefined) {
      this.onPageChange(prevPage);
    }
  }

  onNextPage(): void {
    const nextPage = this.reportData?.pagination?.nextPage;
    if (nextPage !== null && nextPage !== undefined) {
      this.onPageChange(nextPage);
    }
  }

  // Helper method to check if a report has been generated and is available for export
  hasGeneratedReport(): boolean {
    return !!(this.lastReportId && this.reportData);
  }

  // Helper method to format month-year display
  formatMonthYear(monthYear: string): string {
    if (!monthYear) return '';
    
    // Handle "SEP 2025" format (space separated) - keep as is
    if (monthYear.includes(' ')) {
      return monthYear;
    }
    
    // Handle dash-separated format
    if (monthYear.includes('-')) {
      const parts = monthYear.split('-');
      if (parts.length === 2) {
        const month = parts[0].trim();
        const year = parts[1].trim();
        
        // If month is already in text format (like "SEP"), return with space
        if (isNaN(Number(month))) {
          return `${month} ${year}`;
        }
        
        // Convert numeric month to abbreviated month name
        const monthNames = [
          'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
          'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'
        ];
        
        const monthIndex = parseInt(month, 10) - 1;
        if (monthIndex >= 0 && monthIndex < 12) {
          return `${monthNames[monthIndex]} ${year}`;
        }
      }
    }
    
    // Return original if no known format
    return monthYear;
  }

  // Helper method to format month-year for API request
  private formatMonthYearForAPI(month: string, year: string): string {
    if (!month || !year) return '';
    
    // Convert numeric month to abbreviated month name for API
    const monthNames = [
      'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
      'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'
    ];
    
    const monthIndex = parseInt(month, 10) - 1;
    if (monthIndex >= 0 && monthIndex < 12) {
      return `${monthNames[monthIndex]} ${year}`;  // Space instead of dash
    }
    
    // Fallback to original format
    return `${month}-${year}`;
  }
}
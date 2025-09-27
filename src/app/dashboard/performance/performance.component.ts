import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { 
  PerformanceStatisticService, 
  ModuleDTO, 
  TopicDTO, 
  QuestionDTO, 
  PerformanceFormResponse, 
  PerformanceStatistic, 
  ApiResponse, 
  SubTopicDTO 
} from '../../services/performance-statistic.service';

@Component({
  selector: 'app-performance',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule],
  templateUrl: './performance.component.html',
  styleUrl: './performance.component.css'
})
export class PerformanceComponent implements OnInit {
  // Form and data properties
  performanceForm!: FormGroup;
  modules: ModuleDTO[] = [];
  currentModule: ModuleDTO | null = null;
  currentTopic: TopicDTO | null = null;
  userDistrict: string = '';
  monthYear: string = '';
  
  // Navigation properties
  moduleId: number = 0;
  topicId: number = 1;
  nextModule: boolean = false;
  prevModule: boolean = false;
  nextTopic: boolean = false;
  prevTopic: boolean = false;
  
  // UI state properties
  loading: boolean = false;
  saving: boolean = false;
  showOTPModal: boolean = false;
  isSuccess: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  
  // Form data
  formData: { [key: string]: any } = {};
  otpValue: string = '';
  autoSaveInterval: any;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private performanceService: PerformanceStatisticService
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    // Get route parameters
    this.route.queryParams.subscribe(params => {
      // Clear all data first
      this.clearComponentData();
      
      this.moduleId = params['module'] ? parseInt(params['module']) : 0;
      this.topicId = params['topic'] ? parseInt(params['topic']) : 1;
      console.log('Route params - Module:', params['module'], 'Topic:', params['topic']);
      console.log('Parsed - Module ID:', this.moduleId, 'Topic ID:', this.topicId);
      this.loadPerformanceData();
    });
  }

  ngOnDestroy(): void {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
    }
  }

  /**
   * Initialize the reactive form
   */
  private initializeForm(): void {
    this.performanceForm = this.formBuilder.group({
      // Dynamic form controls will be added based on questions
    });
  }

  /**
   * Clear all component data before loading new data
   */
  private clearComponentData(): void {
    // Clear auto-save interval
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
    }
    
    // Clear form data
    this.performanceForm = this.formBuilder.group({});
    this.formData = {};
    
    // Clear navigation data
    this.modules = [];
    this.currentModule = null;
    this.currentTopic = null;
    this.userDistrict = '';
    this.monthYear = '';
    
    // Clear navigation flags
    this.nextModule = false;
    this.prevModule = false;
    this.nextTopic = false;
    this.prevTopic = false;
    
    // Clear UI state
    this.loading = false;
    this.saving = false;
    this.showOTPModal = false;
    this.isSuccess = false;
    this.errorMessage = '';
    this.successMessage = '';
    this.otpValue = '';
    
    console.log('Component data cleared');
  }

  /**
   * Load performance data from service
   */
  loadPerformanceData(): void {
    console.log('Starting to load performance data...');
    this.loading = true;
    this.errorMessage = '';
    
    this.performanceService.getPerformanceForm(this.moduleId, this.topicId).subscribe({
      next: (response: ApiResponse<PerformanceFormResponse>) => {
        console.log('API Response received:', response);
        if (response.status === 'SUCCESS' && response.data) {
          console.log('Performance Form Data:', response.data);
          this.processFormData(response.data);
        } else {
          console.error('API Error:', response.message);
          this.errorMessage = response.message || 'Failed to load performance data';
        }
        this.loading = false;
      },
      error: (error: any) => {
        console.error('HTTP Error:', error);
        this.errorMessage = 'Error loading performance data: ' + error.message;
        this.loading = false;
      }
    });
  }

  /**
   * Process the form data response
   */
  private processFormData(data: PerformanceFormResponse): void {
    console.log('Processing form data response:', data);
    
    this.modules = data.modules || [];
    this.userDistrict = data.userDistrict || '';
    this.monthYear = data.monthYear || '';
    this.isSuccess = data.isSuccess || false;
    this.nextModule = data.nextModule || false;
    this.prevModule = data.prevModule || false;
    this.nextTopic = data.nextTopic || false;
    this.prevTopic = data.prevTopic || false;

    console.log('Module ID:', this.moduleId, 'Topic ID:', this.topicId);
    console.log('Total modules received:', this.modules.length);

    // Set current module and topic
    // Backend returns only the selected module, so always use index 0
    if (this.modules.length > 0) {
      this.currentModule = this.modules[0]; // Always use first (and only) module from response
      console.log('Current module:', this.currentModule?.moduleName);
      console.log('Topics in current module:', this.currentModule?.topicDTOs?.length);
      
      if (this.currentModule.topicDTOs && this.currentModule.topicDTOs.length > 0) {
        // Backend returns only the selected topic, so always use index 0
        this.currentTopic = this.currentModule.topicDTOs[0]; // FIX: Actually assign the current topic
        console.log('Current topic:', this.currentTopic?.topicName);
        console.log('Current topic form type:', this.currentTopic?.formType);
        console.log('Current topic questionDTOs length:', this.currentTopic?.questionDTOs?.length);
        console.log('Current topic questions length:', this.currentTopic?.questions?.length);
        console.log('Current topic subTopics length:', this.currentTopic?.subTopics?.length);
        
        this.buildFormControls();
        
        // Setup auto-save after form is built
        this.setupAutoSave();
      } else {
        console.log('No topics found in module');
        this.errorMessage = 'No topics available for this module';
      }
    } else {
      console.log('No modules found in response');
      this.errorMessage = 'No modules found in response';
    }
  }

  /**
   * Build form controls based on questions
   */
  private buildFormControls(): void {
    if (!this.currentTopic) {
      console.log('No current topic found');
      return;
    }

    console.log('Building form controls for topic:', this.currentTopic.topicName);
    console.log('Form type:', this.currentTopic.formType);
    console.log('Questions available:', this.currentTopic.questionDTOs?.length || 0);
    console.log('Questions array:', this.currentTopic.questions?.length || 0);
    console.log('SubTopics available:', this.currentTopic.subTopics?.length || 0);

    const formControls: { [key: string]: any } = {};
    
    // Handle NORMAL form type
    if (this.currentTopic.formType === 'NORMAL') {
      console.log('Processing NORMAL form type');
      if (this.currentTopic.questionDTOs) {
        this.currentTopic.questionDTOs.forEach((question, index) => {
          console.log(`Processing question ${index + 1}:`, question.question);
          const controlName = `question_${question.id}`;
          formControls[controlName] = [
            question.currentCount || question.defaultVal || '',
            question.type === 'REQUIRED' ? [Validators.required] : []
          ];
        });
      }
    }

    // Handle matrix questions for Q/ST and ST/Q form types
    if (this.currentTopic.formType === 'Q/ST' || this.currentTopic.formType === 'ST/Q') {
      console.log('Processing matrix form type:', this.currentTopic.formType);
      
      // Use questionDTOs for questions (which matches the API response structure)
      const questions = this.currentTopic.questionDTOs || this.currentTopic.questions || [];
      const subTopics = this.currentTopic.subTopics || [];
      
      console.log(`Creating matrix with ${questions.length} questions and ${subTopics.length} subTopics`);
      
      if (questions.length > 0 && subTopics.length > 0) {
        questions.forEach((question, qIndex) => {
          console.log(`Processing question ${qIndex + 1}:`, question.question);
          
          subTopics.forEach((subTopic, stIndex) => {
            console.log(`  - Creating control for subTopic ${stIndex + 1}:`, subTopic.subTopicName);
            const controlName = `matrix_${question.id}_${subTopic.id}`;
            formControls[controlName] = [
              question.currentCount || '',
              question.type === 'REQUIRED' ? [Validators.required] : []
            ];
          });
        });
      } else {
        console.log('Missing questions or subTopics for matrix form');
        console.log('Questions available:', questions.length);
        console.log('SubTopics available:', subTopics.length);
      }
    }

    console.log('Total form controls created:', Object.keys(formControls).length);
    console.log('Form controls:', Object.keys(formControls));

    this.performanceForm = this.formBuilder.group(formControls);
    
    // Setup formula calculations when form values change
    this.setupFormulaCalculations();
  }

  /**
   * Setup automatic formula calculations when form values change
   */
  private setupFormulaCalculations(): void {
    if (!this.currentTopic || !this.performanceForm) {
      console.log('setupFormulaCalculations: Missing currentTopic or performanceForm');
      return;
    }

    console.log('setupFormulaCalculations: Setting up formula calculations for topic:', this.currentTopic.topicName);
    
    // Listen for form value changes
    this.performanceForm.valueChanges.subscribe((formValues) => {
      console.log('Form values changed, triggering formula calculations:', formValues);
      this.updateCalculatedFields();
    });
    
    // Run initial calculation
    console.log('Running initial formula calculations');
    this.updateCalculatedFields();
  }

  /**
   * Update all calculated fields based on formulas
   */
  private updateCalculatedFields(): void {
    if (!this.currentTopic) {
      console.log('updateCalculatedFields: No current topic');
      return;
    }

    const questions = this.currentTopic.questionDTOs || this.currentTopic.questions || [];
    console.log('updateCalculatedFields: Found', questions.length, 'questions');
    
    // Debug: Check which questions have formulas
    const questionsWithFormulas = questions.filter(q => q.formula);
    console.log('updateCalculatedFields: Questions with formulas:', questionsWithFormulas.length);
    questionsWithFormulas.forEach(q => {
      console.log(`Question ${q.id} has formula: "${q.formula}"`);
    });
    
    questions.forEach(question => {
      if (question.formula) {
        console.log(`Processing formula for question ${question.id}: "${question.formula}"`);
        const calculatedValue = this.calculateFormulaValue(question);
        console.log(`Calculated value for question ${question.id}:`, calculatedValue);
        
        // Update the calculated field in the form if it exists
        if (this.currentTopic && (this.currentTopic.formType === 'Q/ST' || this.currentTopic.formType === 'ST/Q')) {
          // For matrix forms, find the target field from the formula
          const formulaParts = question.formula.split('=');
          console.log(`Formula parts for question ${question.id}:`, formulaParts);
          
          if (formulaParts.length === 2) {
            const targetRef = formulaParts[1].trim();
            const targetParts = targetRef.split('_');
            console.log(`Target reference "${targetRef}" split into:`, targetParts);
            
            if (targetParts.length === 2) {
              const targetQuestionId = targetParts[0];
              const targetSubTopicId = targetParts[1];
              const targetControlName = `matrix_${targetQuestionId}_${targetSubTopicId}`;
              
              console.log(`Looking for form control: "${targetControlName}"`);
              const targetControl = this.performanceForm.get(targetControlName);
              
              if (targetControl) {
                console.log(`Setting value "${calculatedValue}" to control "${targetControlName}"`);
                targetControl.setValue(calculatedValue, { emitEvent: false });
              } else {
                console.warn(`Target control "${targetControlName}" not found in form`);
                console.log('Available form controls:', Object.keys(this.performanceForm.controls));
              }
            } else {
              console.error(`Invalid target reference format: "${targetRef}"`);
            }
          } else {
            console.error(`Invalid formula format for question ${question.id}: "${question.formula}"`);
          }
        }
      }
    });
  }

  /**
   * Check if a specific field is calculated by a formula
   */
  isCalculatedField(questionId: number, subTopicId: number): boolean {
    if (!this.currentTopic) return false;
    
    const questions = this.currentTopic.questionDTOs || this.currentTopic.questions || [];
    const targetRef = `${questionId}_${subTopicId}`;
    
    // Check if any question has a formula that calculates this field
    const isCalculated = questions.some(question => {
      if (!question.formula) return false;
      
      const formulaParts = question.formula.split('=');
      if (formulaParts.length === 2) {
        const formulaTargetRef = formulaParts[1].trim();
        return formulaTargetRef === targetRef;
      }
      return false;
    });
    
    if (isCalculated) {
      console.log(`Field ${targetRef} is calculated`);
    }
    
    return isCalculated;
  }

  /**
   * Debug method to manually trigger formula calculations (for testing)
   */
  debugFormulas(): void {
    console.log('=== FORMULA DEBUG START ===');
    console.log('Current topic:', this.currentTopic?.topicName);
    console.log('Form type:', this.currentTopic?.formType);
    
    if (this.currentTopic) {
      const questions = this.currentTopic.questionDTOs || this.currentTopic.questions || [];
      console.log('Total questions:', questions.length);
      
      const formulaQuestions = questions.filter(q => q.formula);
      console.log('Questions with formulas:', formulaQuestions.length);
      
      formulaQuestions.forEach(question => {
        console.log(`Question ${question.id}: "${question.question}"`);
        console.log(`Formula: "${question.formula}"`);
        const result = this.calculateFormulaValue(question);
        console.log(`Result: "${result}"`);
        console.log('---');
      });
    }
    
    console.log('Current form controls:');
    if (this.performanceForm) {
      Object.keys(this.performanceForm.controls).forEach(key => {
        const control = this.performanceForm.get(key);
        console.log(`${key}: ${control?.value}`);
      });
    }
    
    console.log('=== FORMULA DEBUG END ===');
  }

  /**
   * Setup auto-save functionality
   */
  private setupAutoSave(): void {
    this.autoSaveInterval = setInterval(() => {
      if (this.performanceForm.dirty && !this.saving) {
        this.autoSave();
      }
    }, 30000); // Auto-save every 30 seconds
  }

  /**
   * Auto-save form data
   */
  private autoSave(): void {
    if (!this.performanceForm.valid) return;
    
    const statistics = this.prepareStatisticsData('DRAFT');
    if (statistics.length > 0) {
      this.performanceService.saveStatistics({ performanceStatistics: statistics }).subscribe({
        next: (response: ApiResponse) => {
          if (response.status === 'SUCCESS') {
            console.log('Auto-saved successfully');
          }
        },
        error: (error: any) => console.error('Auto-save failed:', error)
      });
    }
  }

  /**
   * Save form data
   */
  saveForm(): void {
    if (!this.performanceForm.valid) {
      this.markFormGroupTouched();
      return;
    }

    this.saving = true;
    const statistics = this.prepareStatisticsData('SAVED');
    
    this.performanceService.saveStatistics({ performanceStatistics: statistics }).subscribe({
      next: (response: ApiResponse) => {
        if (response.status === 'SUCCESS') {
          this.successMessage = 'Form saved successfully';
          this.performanceForm.markAsPristine();
        } else {
          this.errorMessage = response.message || 'Failed to save form';
        }
        this.saving = false;
      },
      error: (error: any) => {
        this.errorMessage = 'Error saving form: ' + error.message;
        this.saving = false;
      }
    });
  }

  /**
   * Submit form with OTP verification
   */
  submitForm(): void {
    if (!this.performanceForm.valid) {
      this.markFormGroupTouched();
      return;
    }

    // First save the form data
    this.saving = true;
    const statistics = this.prepareStatisticsData('SUBMITTED');
    
    this.performanceService.saveStatistics({ performanceStatistics: statistics }).subscribe({
      next: (response: ApiResponse) => {
        if (response.status === 'SUCCESS') {
          // Send OTP
          this.sendOTP();
        } else {
          this.errorMessage = response.message || 'Failed to submit form';
          this.saving = false;
        }
      },
      error: (error: any) => {
        this.errorMessage = 'Error submitting form: ' + error.message;
        this.saving = false;
      }
    });
  }

  /**
   * Send OTP for verification
   */
  sendOTP(): void {
    this.performanceService.sendOTP().subscribe({
      next: (response: ApiResponse) => {
        if (response.status === 'SUCCESS') {
          this.showOTPModal = true;
          this.successMessage = 'OTP sent successfully to your registered mobile number';
        } else {
          this.errorMessage = response.message || 'Failed to send OTP';
        }
        this.saving = false;
      },
      error: (error: any) => {
        this.errorMessage = 'Error sending OTP: ' + error.message;
        this.saving = false;
      }
    });
  }

  /**
   * Verify OTP and complete submission
   */
  verifyOTP(): void {
    if (!this.otpValue || this.otpValue.length !== 6) {
      this.errorMessage = 'Please enter a valid 6-digit OTP';
      return;
    }

    this.saving = true;
    this.performanceService.verifyOTP(this.otpValue).subscribe({
      next: (response: ApiResponse) => {
        if (response.status === 'SUCCESS') {
          this.showOTPModal = false;
          this.successMessage = 'Form submitted successfully!';
          this.isSuccess = true;
          // Navigate to next topic or module if available
          setTimeout(() => this.navigateNext(), 2000);
        } else {
          this.errorMessage = response.message || 'OTP verification failed';
        }
        this.saving = false;
      },
      error: (error: any) => {
        this.errorMessage = 'Error verifying OTP: ' + error.message;
        this.saving = false;
      }
    });
  }

  /**
   * Prepare statistics data for submission
   */
  private prepareStatisticsData(status: string): PerformanceStatistic[] {
    const statistics: PerformanceStatistic[] = [];
    const formValues = this.performanceForm.value;

    if (this.currentTopic?.questionDTOs) {
      this.currentTopic.questionDTOs.forEach(question => {
        const controlName = `question_${question.id}`;
        const value = formValues[controlName];
        
        if (value !== undefined && value !== '') {
          statistics.push({
            questionId: question.id,
            value: value.toString(),
            topicId: this.currentTopic!.id,
            moduleId: this.currentModule!.id,
            status: status
          });
        }
      });
    }

    // Handle matrix questions
    if (this.currentTopic?.formType === 'Q/ST' || this.currentTopic?.formType === 'ST/Q') {
      this.currentTopic.questionDTOs?.forEach(question => {
        this.currentTopic?.subTopics?.forEach(subTopic => {
          const controlName = `matrix_${question.id}_${subTopic.id}`;
          const value = formValues[controlName];
          
          if (value !== undefined && value !== '') {
            statistics.push({
              questionId: question.id,
              value: value.toString(),
              topicId: this.currentTopic!.id,
              subTopicId: subTopic.id,
              moduleId: this.currentModule!.id,
              status: status
            });
          }
        });
      });
    }

    return statistics;
  }

  /**
   * Mark all form controls as touched to show validation errors
   */
  private markFormGroupTouched(): void {
    Object.keys(this.performanceForm.controls).forEach(key => {
      this.performanceForm.get(key)?.markAsTouched();
    });
  }

  /**
   * Navigate to next topic or module
   */
  navigateNext(): void {
    console.log('Navigate Next - Current:', this.moduleId, this.topicId, 'Next Topic:', this.nextTopic, 'Next Module:', this.nextModule);
    
    if (this.nextTopic) {
      this.router.navigate(['/performance'], { 
        queryParams: { module: this.moduleId, topic: this.topicId + 1 } 
      });
    } else if (this.nextModule) {
      this.router.navigate(['/performance'], { 
        queryParams: { module: this.moduleId + 1, topic: 1 } 
      });
    }
  }

  /**
   * Navigate to previous topic or module
   */
  navigatePrevious(): void {
    console.log('Navigate Previous - Current:', this.moduleId, this.topicId, 'Prev Topic:', this.prevTopic, 'Prev Module:', this.prevModule);
    
    if (this.prevTopic) {
      this.router.navigate(['/performance'], { 
        queryParams: { module: this.moduleId, topic: this.topicId - 1 } 
      });
    } else if (this.prevModule) {
      // Navigate to last topic of previous module
      const prevModule = this.modules[this.moduleId - 1];
      const lastTopicId = prevModule?.topicDTOs?.length || 1;
      this.router.navigate(['/performance'], { 
        queryParams: { module: this.moduleId - 1, topic: lastTopicId } 
      });
    }
  }

  /**
   * Get form control value
   */
  getFormValue(controlName: string): any {
    return this.performanceForm.get(controlName)?.value || '';
  }

  /**
   * Get matrix form value
   */
  getMatrixValue(questionId: number, subTopicId: number): any {
    const controlName = `matrix_${questionId}_${subTopicId}`;
    return this.performanceForm.get(controlName)?.value || '';
  }

  /**
   * Check if subtopic header should be shown
   */
  shouldShowSubtopicHeader(currentIndex: number, subTopicId: number): boolean {
    if (currentIndex === 0) return true;
    
    const prevQuestion = this.currentTopic?.questions?.[currentIndex - 1];
    return prevQuestion?.subTopicId !== subTopicId;
  }

  /**
   * Format question text for display
   */
  formatQuestionText(question: QuestionDTO): string {
    let text = question.question || '';
    
    // Replace placeholders with actual values
    text = text.replace(/\{userDistrict\}/g, this.userDistrict);
    text = text.replace(/\{monthYear\}/g, this.monthYear);
    
    return text;
  }

  /**
   * Calculate formula-based values
   */
  calculateFormulaValue(question: QuestionDTO): string {
    if (!question.formula) {
      console.log(`No formula for question ${question.id}`);
      return question.defaultVal || '';
    }
    
    try {
      console.log(`Calculating formula for question ${question.id}:`, question.formula);
      
      // Split the formula by '=' to get the calculation part (left side) and target (right side)
      const formulaParts = question.formula.split('=');
      if (formulaParts.length !== 2) {
        console.error('Invalid formula format - should contain exactly one "=" sign:', question.formula);
        return question.defaultVal || '';
      }
      
      // Get the calculation expression (left side of =)
      let calculationExpression = formulaParts[0].trim();
      const targetRef = formulaParts[1].trim();
      
      console.log('Calculation expression:', calculationExpression);
      console.log('Target reference:', targetRef);
      
      const formValues = this.performanceForm.value;
      console.log('Current form values:', formValues);
      
      // Replace matrix references (questionId_subTopicId) in calculation expression with actual values
      Object.keys(formValues).forEach(key => {
        if (key.startsWith('matrix_')) {
          // Extract questionId and subTopicId from key like 'matrix_483_36'
          const parts = key.replace('matrix_', '').split('_');
          if (parts.length === 2) {
            const questionId = parts[0];
            const subTopicId = parts[1];
            const formulaRef = `${questionId}_${subTopicId}`;
            
            // Replace all occurrences of this reference in the calculation expression
            const value = formValues[key] || '0';
            console.log(`Replacing ${formulaRef} with ${value} in expression`);
            calculationExpression = calculationExpression.replace(new RegExp(`\\b${formulaRef}\\b`, 'g'), value);
          }
        }
      });
      
      console.log('Expression after substitution:', calculationExpression);
      
      // Clean up the expression - ensure it's safe for evaluation
      if (!/^[\d\s+\-*/().]+$/.test(calculationExpression)) {
        console.error('Invalid characters in calculation expression:', calculationExpression);
        return question.defaultVal || '';
      }
      
      // Evaluate arithmetic expression
      const result = eval(calculationExpression);
      const resultString = result.toString();
      console.log('Formula calculation result:', resultString);
      return resultString;
    } catch (error) {
      console.error('Formula calculation error:', error);
      console.error('Original formula:', question.formula);
      return question.defaultVal || '';
    }
  }

  /**
   * Calculate row total for Q/ST matrix
   */
  calculateRowTotal(questionId: number): number {
    if (!this.currentTopic?.subTopics) return 0;
    
    let total = 0;
    this.currentTopic.subTopics.forEach(subTopic => {
      const value = this.getMatrixValue(questionId, subTopic.id);
      total += parseFloat(value) || 0;
    });
    return total;
  }

  /**
   * Calculate column total for Q/ST matrix
   */
  calculateColumnTotal(subTopicId: number): number {
    if (!this.currentTopic?.questionDTOs) return 0;
    
    let total = 0;
    this.currentTopic.questionDTOs.forEach(question => {
      const value = this.getMatrixValue(question.id, subTopicId);
      total += parseFloat(value) || 0;
    });
    return total;
  }

  /**
   * Calculate subtopic total for ST/Q matrix
   */
  calculateSubTopicTotal(subTopicId: number): number {
    if (!this.currentTopic?.questionDTOs) return 0;
    
    let total = 0;
    this.currentTopic.questionDTOs.forEach(question => {
      const value = this.getMatrixValue(question.id, subTopicId);
      total += parseFloat(value) || 0;
    });
    return total;
  }

  /**
   * Calculate question total for ST/Q matrix
   */
  calculateQuestionTotal(questionId: number): number {
    if (!this.currentTopic?.subTopics) return 0;
    
    let total = 0;
    this.currentTopic.subTopics.forEach(subTopic => {
      const value = this.getMatrixValue(questionId, subTopic.id);
      total += parseFloat(value) || 0;
    });
    return total;
  }

  /**
   * Calculate grand total for matrix
   */
  calculateGrandTotal(): number {
    if (!this.currentTopic?.questionDTOs || !this.currentTopic?.subTopics) return 0;
    
    let total = 0;
    this.currentTopic.questionDTOs.forEach(question => {
      this.currentTopic?.subTopics?.forEach(subTopic => {
        const value = this.getMatrixValue(question.id, subTopic.id);
        total += parseFloat(value) || 0;
      });
    });
    return total;
  }

  /**
   * Close OTP modal
   */
  closeOTPModal(): void {
    this.showOTPModal = false;
    this.otpValue = '';
  }

  /**
   * Clear messages
   */
  clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }
}

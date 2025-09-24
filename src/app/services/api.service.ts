import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environment/environment';

export interface ApiResponse<T> {
  status: 'SUCCESS' | 'ERROR';
  message: string;
  data?: T;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage?: boolean;
    hasPrevPage?: boolean;
  };
}

export interface Module {
  id: number;
  moduleName: string;
  priority: number;
  active: boolean;
  createdBy?: number;
  updatedBy?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Topic {
  id: number;
  moduleId: number;
  topicName: string;
  subName?: string;
  priority: number;
  formType?: string;
  subMenuId?: number;
  isShowCummulative?: boolean;
  isShowPrevious?: boolean;
  isStartJan?: boolean;
  startMonth?: number;
  endMonth?: number;
  active: boolean;
  createdBy?: number;
  updatedBy?: number;
  createdAt?: string;
  updatedAt?: string;
  moduleName?: string;
}

export interface SubTopic {
  id: number;
  subTopicName: string;
  topicId: number;
  priority?: number;
  active: boolean;
  createdBy?: number;
  updatedBy?: number;
  createdAt?: string;
  updatedAt?: string;
  topicName?: string;
}

export interface Question {
  id: number;
  topicId: number;
  subTopicId?: number;
  question: string;
  priority?: number;
  type?: string;
  defaultVal?: string;
  defaultQue?: number;
  defaultSub?: number;
  defaultTo?: string;
  defaultFormula?: string;
  formula?: string;
  isPrevious?: boolean;
  isCumulative?: boolean;
  active: boolean;
  createdBy?: number;
  updatedBy?: number;
  createdAt?: string;
  updatedAt?: string;
  description?: string;
  questionType?: 'TEXT' | 'NUMBER' | 'BOOLEAN' | 'MULTIPLE_CHOICE' | 'RATING';
  maxScore?: number;
  displayOrder?: number;
  isActive?: boolean;
  // Relationship properties (populated when included in API response)
  topic?: {
    id: number;
    topicName: string;
    moduleId: number;
    module?: {
      id: number;
      moduleName: string;
    };
  };
  subTopic?: {
    id: number;
    subTopicName: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  headersWithToken: HttpHeaders | { [header: string]: string | string[]; } | undefined;
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

 private getHeaders(contentType?: string): HttpHeaders {
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    let headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    if (contentType) {
      headers = headers.set('Content-Type', contentType);
    }
    return headers;
  }

  // User Menu
  get_user_menu(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
        this.baseUrl + "menus/user",
      { headers: this.headersWithToken = this.getHeaders() }
    );
  }

  // Module Operations
  addModule(data: Partial<Module>): Observable<ApiResponse<Module>> {
    return this.http.post<ApiResponse<Module>>(
        this.baseUrl + "modules", data,
      { headers: this.headersWithToken = this.getHeaders('application/json') }
    );
  }

  getModules(page: number = 1, limit: number = 10, search?: string, sortBy?: string, sortOrder?: string): Observable<ApiResponse<Module[]>> {
    let params = `?page=${page}&limit=${limit}`;
    if (search && search.trim()) {
      params += `&search=${encodeURIComponent(search)}`;
    }
    if (sortBy) {
      params += `&sortBy=${sortBy}`;
    }
    if (sortOrder) {
      params += `&sortOrder=${sortOrder}`;
    }
    
    return this.http.get<ApiResponse<Module[]>>(
        this.baseUrl + "modules" + params,
      { headers: this.headersWithToken = this.getHeaders() }
    );
  }

  updateModule(id: number, data: Partial<Module>): Observable<ApiResponse<Module>> {
    return this.http.put<ApiResponse<Module>>(
        this.baseUrl + "modules/" + id, data,
      { headers: this.headersWithToken = this.getHeaders('application/json') }
    );
  }

  deleteModule(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(
        this.baseUrl + "modules/" + id,
      { headers: this.headersWithToken = this.getHeaders() }
    );
  }

  toggleModuleStatus(id: number, data: { active: boolean }): Observable<ApiResponse<Module>> {
    return this.http.patch<ApiResponse<Module>>(
        this.baseUrl + "modules/" + id + "/status", data,
      { headers: this.headersWithToken = this.getHeaders('application/json') }
    );
  }

  // Additional module methods
  getModuleById(id: number): Observable<ApiResponse<Module>> {
    return this.http.get<ApiResponse<Module>>(
        this.baseUrl + "modules/" + id,
      { headers: this.headersWithToken = this.getHeaders() }
    );
  }

  getActiveModules(): Observable<ApiResponse<Module[]>> {
    return this.http.get<ApiResponse<Module[]>>(
        this.baseUrl + "modules/status/active",
      { headers: this.headersWithToken = this.getHeaders() }
    );
  }

  searchModules(searchTerm: string, page = 1, limit = 10): Observable<ApiResponse<Module[]>> {
    return this.http.get<ApiResponse<Module[]>>(
        this.baseUrl + `modules/search/${searchTerm}?page=${page}&limit=${limit}`,
      { headers: this.headersWithToken = this.getHeaders() }
    );
  }
  getModuleDropdown(): Observable<ApiResponse<Module[]>> {
    return this.http.get<ApiResponse<Module[]>>(
        this.baseUrl + "modules/all",
      { headers: this.headersWithToken = this.getHeaders() }
    );
  }

  // Topic Operations
  getTopics(page: number = 1, limit: number = 10, search?: string, sortBy?: string, sortOrder?: string, moduleId?: number, status?: string): Observable<ApiResponse<Topic[]>> {
    let params = `?page=${page}&limit=${limit}`;
    if (search && search.trim()) {
      params += `&search=${encodeURIComponent(search)}`;
    }
    if (sortBy) {
      params += `&sortBy=${sortBy}`;
    }
    if (sortOrder) {
      params += `&sortOrder=${sortOrder}`;
    }
    if (moduleId) {
      params += `&moduleId=${moduleId}`;
    }
    if (status) {
      params += `&status=${status}`;
    }
    
    return this.http.get<ApiResponse<Topic[]>>(
        this.baseUrl + "topics" + params,
      { headers: this.headersWithToken = this.getHeaders() }
    );
  }

  getTopicById(id: number): Observable<ApiResponse<Topic>> {
    return this.http.get<ApiResponse<Topic>>(
        this.baseUrl + "topics/" + id,
      { headers: this.headersWithToken = this.getHeaders() }
    );
  }

  addTopic(data: Partial<Topic>): Observable<ApiResponse<Topic>> {
    return this.http.post<ApiResponse<Topic>>(
        this.baseUrl + "topics", data,
      { headers: this.headersWithToken = this.getHeaders('application/json') }
    );
  }

  updateTopic(id: number, data: Partial<Topic>): Observable<ApiResponse<Topic>> {
    return this.http.put<ApiResponse<Topic>>(
        this.baseUrl + "topics/" + id, data,
      { headers: this.headersWithToken = this.getHeaders('application/json') }
    );
  }

  deleteTopic(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(
        this.baseUrl + "topics/" + id,
      { headers: this.headersWithToken = this.getHeaders() }
    );
  }

  activateTopic(id: number): Observable<ApiResponse<Topic>> {
    return this.http.post<ApiResponse<Topic>>(
        this.baseUrl + "topics/" + id + "/activate", {},
      { headers: this.headersWithToken = this.getHeaders('application/json') }
    );
  }

  deactivateTopic(id: number): Observable<ApiResponse<Topic>> {
    return this.http.post<ApiResponse<Topic>>(
        this.baseUrl + "topics/" + id + "/deactivate", {},
      { headers: this.headersWithToken = this.getHeaders('application/json') }
    );
  }

  getTopicsByModule(moduleId: number, page: number = 1, limit: number = 10): Observable<ApiResponse<Topic[]>> {
    return this.http.get<ApiResponse<Topic[]>>(
        this.baseUrl + `topics/by-module/${moduleId}?page=${page}&limit=${limit}`,
      { headers: this.headersWithToken = this.getHeaders() }
    );
  }

  searchTopics(searchTerm: string, page = 1, limit = 10): Observable<ApiResponse<Topic[]>> {
    return this.http.get<ApiResponse<Topic[]>>(
        this.baseUrl + `topics/search/${searchTerm}?page=${page}&limit=${limit}`,
      { headers: this.headersWithToken = this.getHeaders() }
    );
  }

  getActiveTopics(): Observable<ApiResponse<Topic[]>> {
    return this.http.get<ApiResponse<Topic[]>>(
        this.baseUrl + "topics/status/active",
      { headers: this.headersWithToken = this.getHeaders() }
    );
  }

  getTopicStats(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
        this.baseUrl + "topics/stats/overview",
      { headers: this.headersWithToken = this.getHeaders() }
    );
  }

  // SubTopic Operations
  getSubTopics(page: number = 1, limit: number = 10, search?: string, sortBy?: string, sortOrder?: string, topicId?: number, status?: string): Observable<ApiResponse<SubTopic[]>> {
    let params = `?page=${page}&limit=${limit}`;
    if (search && search.trim()) {
      params += `&search=${encodeURIComponent(search)}`;
    }
    if (sortBy) {
      params += `&sortBy=${sortBy}`;
    }
    if (sortOrder) {
      params += `&sortOrder=${sortOrder}`;
    }
    if (topicId) {
      params += `&topicId=${topicId}`;
    }
    if (status) {
      params += `&status=${status}`;
    }
    
    return this.http.get<ApiResponse<SubTopic[]>>(
        this.baseUrl + "sub-topics" + params,
      { headers: this.headersWithToken = this.getHeaders() }
    );
  }

  getSubTopicById(id: number): Observable<ApiResponse<SubTopic>> {
    return this.http.get<ApiResponse<SubTopic>>(
        this.baseUrl + "sub-topics/" + id,
      { headers: this.headersWithToken = this.getHeaders() }
    );
  }

  addSubTopic(data: Partial<SubTopic>): Observable<ApiResponse<SubTopic>> {
    return this.http.post<ApiResponse<SubTopic>>(
        this.baseUrl + "sub-topics", data,
      { headers: this.headersWithToken = this.getHeaders('application/json') }
    );
  }

  updateSubTopic(id: number, data: Partial<SubTopic>): Observable<ApiResponse<SubTopic>> {
    return this.http.put<ApiResponse<SubTopic>>(
        this.baseUrl + "sub-topics/" + id, data,
      { headers: this.headersWithToken = this.getHeaders('application/json') }
    );
  }

  deleteSubTopic(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(
        this.baseUrl + "sub-topics/" + id,
      { headers: this.headersWithToken = this.getHeaders() }
    );
  }

  activateSubTopic(id: number): Observable<ApiResponse<SubTopic>> {
    return this.http.post<ApiResponse<SubTopic>>(
        this.baseUrl + "sub-topics/" + id + "/activate", {},
      { headers: this.headersWithToken = this.getHeaders('application/json') }
    );
  }

  deactivateSubTopic(id: number): Observable<ApiResponse<SubTopic>> {
    return this.http.post<ApiResponse<SubTopic>>(
        this.baseUrl + "sub-topics/" + id + "/deactivate", {},
      { headers: this.headersWithToken = this.getHeaders('application/json') }
    );
  }

  getSubTopicsByTopic(topicId: number, ): Observable<ApiResponse<SubTopic[]>> {
    return this.http.get<ApiResponse<SubTopic[]>>(
        this.baseUrl + `sub-topics/by-topic/${topicId}`,
      { headers: this.headersWithToken = this.getHeaders() }
    );
  }

  getSubTopicsByTopicForForm(topicId: number): Observable<ApiResponse<SubTopic[]>> {
    return this.http.get<ApiResponse<SubTopic[]>>(
        this.baseUrl + `sub-topics/topic/${topicId}`,
      { headers: this.headersWithToken = this.getHeaders() }
    );
  }

  searchSubTopics(searchTerm: string, page = 1, limit = 10): Observable<ApiResponse<SubTopic[]>> {
    return this.http.get<ApiResponse<SubTopic[]>>(
        this.baseUrl + `sub-topics/search/${searchTerm}?page=${page}&limit=${limit}`,
      { headers: this.headersWithToken = this.getHeaders() }
    );
  }

  getActiveSubTopics(): Observable<ApiResponse<SubTopic[]>> {
    return this.http.get<ApiResponse<SubTopic[]>>(
        this.baseUrl + "sub-topics/active",
      { headers: this.headersWithToken = this.getHeaders() }
    );
  }

  getActiveSubTopicsStatus(): Observable<ApiResponse<SubTopic[]>> {
    return this.http.get<ApiResponse<SubTopic[]>>(
        this.baseUrl + "sub-topics/status/active",
      { headers: this.headersWithToken = this.getHeaders() }
    );
  }

  getSubTopicStats(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
        this.baseUrl + "sub-topics/stats/overview",
      { headers: this.headersWithToken = this.getHeaders() }
    );
  }

  cloneSubTopic(id: number): Observable<ApiResponse<SubTopic>> {
    return this.http.post<ApiResponse<SubTopic>>(
        this.baseUrl + "sub-topics/" + id + "/clone", {},
      { headers: this.headersWithToken = this.getHeaders('application/json') }
    );
  }

  updateSubTopicOrder(id: number, displayOrder: number): Observable<ApiResponse<SubTopic>> {
    return this.http.put<ApiResponse<SubTopic>>(
        this.baseUrl + "sub-topics/" + id + "/order", { displayOrder },
      { headers: this.headersWithToken = this.getHeaders('application/json') }
    );
  }

  reorderSubTopics(orders: { id: number; displayOrder: number }[]): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(
        this.baseUrl + "sub-topics/reorder", { orders },
      { headers: this.headersWithToken = this.getHeaders('application/json') }
    );
  }

  getSubTopicQuestions(id: number, page: number = 1, limit: number = 10): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(
        this.baseUrl + `sub-topics/${id}/questions?page=${page}&limit=${limit}`,
      { headers: this.headersWithToken = this.getHeaders() }
    );
  }

  getSubTopicPerformanceStatistics(id: number, page: number = 1, limit: number = 10): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(
        this.baseUrl + `sub-topics/${id}/performance-statistics?page=${page}&limit=${limit}`,
      { headers: this.headersWithToken = this.getHeaders() }
    );
  }

  // Question Operations - Simple pagination only
  getQuestions(page: number = 1, limit: number = 10): Observable<ApiResponse<Question[]>> {
    const params = `?page=${page}&limit=${limit}&sortBy=priority&sortOrder=ASC`;
    
    return this.http.get<ApiResponse<Question[]>>(
        this.baseUrl + "questions" + params,
      { headers: this.headersWithToken = this.getHeaders() }
    );
  }

  // Full Questions API with all filters (keeping for other use cases)
  getQuestionsWithFilters(page: number = 1, limit: number = 10, search?: string, sortBy?: string, sortOrder?: string, topicId?: number, subTopicId?: number, type?: string, status?: string, moduleId?: number): Observable<ApiResponse<Question[]>> {
    let params = `?page=${page}&limit=${limit}`;
    if (search && search.trim()) {
      params += `&search=${encodeURIComponent(search)}`;
    }
    if (sortBy) {
      params += `&sortBy=${sortBy}`;
    }
    if (sortOrder) {
      params += `&sortOrder=${sortOrder}`;
    }
    if (topicId) {
      params += `&topicId=${topicId}`;
    }
    if (subTopicId) {
      params += `&subTopicId=${subTopicId}`;
    }
    if (type) {
      params += `&type=${type}`;
    }
    if (status) {
      params += `&status=${status}`;
    }
    if (moduleId) {
      params += `&moduleId=${moduleId}`;
    }
    
    return this.http.get<ApiResponse<Question[]>>(
        this.baseUrl + "questions" + params,
      { headers: this.headersWithToken = this.getHeaders() }
    );
  }

  getQuestionById(id: number): Observable<ApiResponse<Question>> {
    return this.http.get<ApiResponse<Question>>(
        this.baseUrl + "questions/" + id,
      { headers: this.headersWithToken = this.getHeaders() }
    );
  }

  addQuestion(data: Partial<Question>): Observable<ApiResponse<Question>> {
    return this.http.post<ApiResponse<Question>>(
        this.baseUrl + "questions", data,
      { headers: this.headersWithToken = this.getHeaders('application/json') }
    );
  }

  updateQuestion(id: number, data: Partial<Question>): Observable<ApiResponse<Question>> {
    return this.http.put<ApiResponse<Question>>(
        this.baseUrl + "questions/" + id, data,
      { headers: this.headersWithToken = this.getHeaders('application/json') }
    );
  }

  deleteQuestion(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(
        this.baseUrl + "questions/" + id,
      { headers: this.headersWithToken = this.getHeaders() }
    );
  }

  activateQuestion(id: number): Observable<ApiResponse<Question>> {
    return this.http.post<ApiResponse<Question>>(
        this.baseUrl + "questions/" + id + "/activate", {},
      { headers: this.headersWithToken = this.getHeaders('application/json') }
    );
  }

  deactivateQuestion(id: number): Observable<ApiResponse<Question>> {
    return this.http.post<ApiResponse<Question>>(
        this.baseUrl + "questions/" + id + "/deactivate", {},
      { headers: this.headersWithToken = this.getHeaders('application/json') }
    );
  }

  getQuestionsBySubTopic(subTopicId: number, page: number = 1, limit: number = 10, sortBy?: string, sortOrder?: string, type?: string, status?: string): Observable<ApiResponse<Question[]>> {
    let params = `?page=${page}&limit=${limit}`;
    if (sortBy) {
      params += `&sortBy=${sortBy}`;
    }
    if (sortOrder) {
      params += `&sortOrder=${sortOrder}`;
    }
    if (type) {
      params += `&type=${type}`;
    }
    if (status) {
      params += `&status=${status}`;
    }
    
    return this.http.get<ApiResponse<Question[]>>(
        this.baseUrl + `questions/by-sub-topic/${subTopicId}` + params,
      { headers: this.headersWithToken = this.getHeaders() }
    );
  }

  getQuestionsByType(type: string, page: number = 1, limit: number = 10, sortBy?: string, sortOrder?: string, topicId?: number, subTopicId?: number, moduleId?: number, status?: string): Observable<ApiResponse<Question[]>> {
    let params = `?page=${page}&limit=${limit}`;
    if (sortBy) {
      params += `&sortBy=${sortBy}`;
    }
    if (sortOrder) {
      params += `&sortOrder=${sortOrder}`;
    }
    if (topicId) {
      params += `&topicId=${topicId}`;
    }
    if (subTopicId) {
      params += `&subTopicId=${subTopicId}`;
    }
    if (moduleId) {
      params += `&moduleId=${moduleId}`;
    }
    if (status) {
      params += `&status=${status}`;
    }
    
    return this.http.get<ApiResponse<Question[]>>(
        this.baseUrl + `questions/by-type/${type}` + params,
      { headers: this.headersWithToken = this.getHeaders() }
    );
  }

  searchQuestions(searchTerm: string, page = 1, limit = 10, topicId?: number, subTopicId?: number, moduleId?: number, type?: string, status?: string): Observable<ApiResponse<Question[]>> {
    let params = `?page=${page}&limit=${limit}`;
    if (topicId) {
      params += `&topicId=${topicId}`;
    }
    if (subTopicId) {
      params += `&subTopicId=${subTopicId}`;
    }
    if (moduleId) {
      params += `&moduleId=${moduleId}`;
    }
    if (type) {
      params += `&type=${type}`;
    }
    if (status) {
      params += `&status=${status}`;
    }
    
    return this.http.get<ApiResponse<Question[]>>(
        this.baseUrl + `questions/search/${searchTerm}` + params,
      { headers: this.headersWithToken = this.getHeaders() }
    );
  }

  getActiveQuestions(): Observable<ApiResponse<Question[]>> {
    return this.http.get<ApiResponse<Question[]>>(
        this.baseUrl + "questions/status/active",
      { headers: this.headersWithToken = this.getHeaders() }
    );
  }

  getQuestionTypes(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(
        this.baseUrl + "questions/config/types",
      { headers: this.headersWithToken = this.getHeaders() }
    );
  }

  getQuestionStats(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
        this.baseUrl + "questions/stats/overview",
      { headers: this.headersWithToken = this.getHeaders() }
    );
  }

  validateQuestionFormula(formula: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
        this.baseUrl + "questions/validate-formula", { formula },
      { headers: this.headersWithToken = this.getHeaders('application/json') }
    );
  }

  getQuestionsWithFormulas(topicId: number): Observable<ApiResponse<Question[]>> {
    return this.http.get<ApiResponse<Question[]>>(
        this.baseUrl + `questions/topic/${topicId}/formulas`,
      { headers: this.headersWithToken = this.getHeaders() }
    );
  }

  getQuestionsForFormula(topicId: number): Observable<ApiResponse<Question[]>> {
    return this.http.get<ApiResponse<Question[]>>(
        this.baseUrl + `questions/topic/${topicId}/for-formula`,
      { headers: this.headersWithToken = this.getHeaders() }
    );
  }

  getQuestionsForForm(topicId: number): Observable<ApiResponse<Question[]>> {
    return this.http.get<ApiResponse<Question[]>>(
        this.baseUrl + `questions/topic/${topicId}/form`,
      { headers: this.headersWithToken = this.getHeaders() }
    );
  }

  cloneQuestion(id: number): Observable<ApiResponse<Question>> {
    return this.http.post<ApiResponse<Question>>(
        this.baseUrl + "questions/" + id + "/clone", {},
      { headers: this.headersWithToken = this.getHeaders('application/json') }
    );
  }

  updateQuestionOrder(id: number, order: number): Observable<ApiResponse<Question>> {
    return this.http.put<ApiResponse<Question>>(
        this.baseUrl + "questions/" + id + "/order", { order },
      { headers: this.headersWithToken = this.getHeaders('application/json') }
    );
  }

  reorderQuestions(items: { id: number; displayOrder: number }[]): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(
        this.baseUrl + "questions/reorder", { items },
      { headers: this.headersWithToken = this.getHeaders('application/json') }
    );
  }

  bulkCreateQuestions(questions: Partial<Question>[]): Observable<ApiResponse<Question[]>> {
    return this.http.post<ApiResponse<Question[]>>(
        this.baseUrl + "questions/bulk-create", { questions },
      { headers: this.headersWithToken = this.getHeaders('application/json') }
    );
  }

  getQuestionPerformanceStatistics(id: number, page: number = 1, limit: number = 10): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(
        this.baseUrl + `questions/${id}/performance-statistics?page=${page}&limit=${limit}`,
      { headers: this.headersWithToken = this.getHeaders() }
    );
  }

  updateQuestionMetadata(id: number, metadata: any): Observable<ApiResponse<Question>> {
    return this.http.put<ApiResponse<Question>>(
        this.baseUrl + "questions/" + id + "/metadata", metadata,
      { headers: this.headersWithToken = this.getHeaders('application/json') }
    );
  }

}
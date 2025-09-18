import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  headersWithToken: HttpHeaders | { [header: string]: string | string[]; } | undefined;
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

 private getHeaders(contentType?: string): HttpHeaders {
    const token = sessionStorage.getItem('token');
    let headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    if (contentType) {
      headers = headers.set('Content-Type', contentType);
    }
    return headers;
  }

  get_user_menu(): Observable<any> {
    return this.http.get(
        this.baseUrl + "menus/user/2",
      { headers: this.headersWithToken = this.getHeaders() }
    );
  }

}

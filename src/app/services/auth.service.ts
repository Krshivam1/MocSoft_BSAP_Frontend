import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor() {
    // Check if user is already logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    this.isAuthenticatedSubject.next(isLoggedIn);
  }

  async login(email: string, password: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Simulate API call
      setTimeout(() => {
        if (email === 'admin@example.com' && password === 'password') {
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('userEmail', email);
          this.isAuthenticatedSubject.next(true);
          resolve();
        } else {
          reject(new Error('Invalid credentials'));
        }
      }, 1000);
    });
  }

  logout(): void {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    this.isAuthenticatedSubject.next(false);
  }

  isLoggedIn(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  getUserEmail(): string | null {
    return localStorage.getItem('userEmail');
  }
}
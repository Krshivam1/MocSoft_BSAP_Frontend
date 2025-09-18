import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService, User } from '../services/auth.service';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
 
  isSidenavCollapsed = false;
  user: User | null = null;
  isLoadingMenu = true;
  menuData: any[] = [];
  expandedMenus: { [id: number]: boolean } = {};
  expandedSubmenus: { [id: number]: boolean } = {};
  expandedSubchildren: { [id: number]: boolean } = {};
  toggleMenu(menuId: number) {
    const wasOpen = !!this.expandedMenus[menuId];
    Object.keys(this.expandedMenus).forEach(id => {
      this.expandedMenus[+id] = false;
    });
    // If it was open, close it; otherwise, open it
    this.expandedMenus[menuId] = !wasOpen;
  }

  toggleSubmenu(submenuId: number) {
    const wasOpen = !!this.expandedSubmenus[submenuId];
    Object.keys(this.expandedSubmenus).forEach(id => {
      this.expandedSubmenus[+id] = false;
    });
    this.expandedSubmenus[submenuId] = !wasOpen;
  }

  toggleSubchild(subchildId: number) {
    this.expandedSubchildren[subchildId] = !this.expandedSubchildren[subchildId];
  }
  private subscriptions: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    this.loadUserMenu();
    this.loadUserData();
   
  }

  private loadUserData() {
    const userSub = this.authService.user$.subscribe(user => {
      this.user = user;
    });
    this.subscriptions.push(userSub);

    // Load user profile if not already loaded
    if (!this.user) {
      const profileSub = this.authService.loadUserProfile().subscribe({
        next: (user) => {
          this.user = user;
        },
        error: (error) => {
          console.error('Failed to load user profile:', error);
          // If profile loading fails, user might need to re-login
          //this.logout();
        }
      });
      this.subscriptions.push(profileSub);
    }
  }

  loadUserMenu() {
    this.isLoadingMenu = true;
    const menuSub = this.apiService.get_user_menu().subscribe({
      next: (res) => {
        // Expecting res.status, res.message, res.data
        if (res.status === 'SUCCESS' && Array.isArray(res.data)) {
          this.menuData = res.data;
        } else {
          this.menuData = [];
        }
        console.log('User menu loaded:', res);
        this.isLoadingMenu = false;
      },
      error: (error) => {
        console.error('Failed to load user menu:', error);
        this.isLoadingMenu = false;
        this.menuData = [];
      }
    });
    this.subscriptions.push(menuSub);
  }

  toggleSidenav() {
    this.isSidenavCollapsed = !this.isSidenavCollapsed;
  }
 navigate(url: string) {
    // Remove leading slash to make it relative navigation
    const relativePath = url.startsWith('/') ? url.substring(1) : url;
    this.router.navigate([relativePath], { relativeTo: this.route });
  }
 
  // logout() {
  //   const logoutSub = this.authService.logout().subscribe({
  //     next: () => {
  //       this.menuService.clearMenu();
  //       this.router.navigate(['/']);
  //     },
  //     error: (error) => {
  //       console.error('Logout error:', error);
  //       // Even if logout fails on server, clear local data and redirect
  //       this.menuService.clearMenu();
  //       this.router.navigate(['/']);
  //     }
  //   });
  //   this.subscriptions.push(logoutSub);
  // }

  getUserDisplayName(): string {
    if (this.user?.name) {
      return this.user.name;
    }
    if (this.user?.email) {
      return this.user.email.split('@')[0];
    }
    return 'User';
  }

  getUserEmail(): string {
    return this.user?.email || '';
  }

  getUserRole(): string {
    return this.user?.role || '';
  }

  hasRole(role: string): boolean {
    return this.authService.hasRole(role);
  }

  hasPermission(permission: string): boolean {
    return this.authService.hasPermission(permission);
  }

  // Method to handle menu item badge updates
 

}
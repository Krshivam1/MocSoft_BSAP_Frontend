import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService, User } from '../services/auth.service';
import { MenuService, MenuItem } from '../services/menu.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  isSidenavCollapsed = false;
  user: User | null = null;
  menuItems: MenuItem[] = [];
  isLoadingMenu = true;
  
  private subscriptions: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private menuService: MenuService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadUserData();
    this.loadMenu();
    this.subscribeToMenuChanges();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private loadUserData() {
    // Subscribe to user changes
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

  private loadMenu() {
    this.isLoadingMenu = true;
    
    const menuSub = this.menuService.initializeMenu().subscribe({
      next: (menuItems) => {
        this.menuItems = menuItems;
        this.isLoadingMenu = false;
      },
      error: (error) => {
        console.error('Failed to load menu:', error);
        this.isLoadingMenu = false;
        // Use default menu items as fallback
        this.menuItems = this.getDefaultMenuItems();
      }
    });
    this.subscriptions.push(menuSub);
  }

  private subscribeToMenuChanges() {
    const menuSub = this.menuService.menuItems$.subscribe(menuItems => {
      this.menuItems = menuItems;
    });
    this.subscriptions.push(menuSub);
  }

  private getDefaultMenuItems(): MenuItem[] {
    return [
      {
        id: 'home',
        label: 'Dashboard',
        icon: '🏠',
        route: '/dashboard/home'
      },
      {
        id: 'profile',
        label: 'Profile',
        icon: '👤',
        route: '/dashboard/profile'
      }
    ];
  }

  toggleSidenav() {
    this.isSidenavCollapsed = !this.isSidenavCollapsed;
  }

  toggleMenuItem(item: MenuItem) {
    if (item.children && item.children.length > 0) {
      this.menuService.toggleMenuItem(item.id);
    } else if (item.route) {
      this.navigateToRoute(item.route);
    } else if (item.url) {
      this.openExternalUrl(item.url, item.target);
    }
  }

  private navigateToRoute(route: string) {
    this.router.navigate([route]);
  }

  private openExternalUrl(url: string, target: string = '_blank') {
    window.open(url, target);
  }

  isMenuItemActive(item: MenuItem): boolean {
    if (!item.route) return false;
    return this.router.url === item.route || this.router.url.startsWith(item.route + '/');
  }

  hasMenuPermission(item: MenuItem): boolean {
    if (!item.permissions || item.permissions.length === 0) {
      return true;
    }

    return item.permissions.some(permission => 
      this.authService.hasPermission(permission)
    );
  }

  refreshMenu() {
    this.loadMenu();
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
  updateMenuBadge(itemId: string, badge: { text: string; color: string } | null) {
    this.menuService.updateMenuBadge(itemId, badge);
  }

  // Method to get menu item by ID
  getMenuItem(itemId: string): MenuItem | null {
    return this.menuService.findMenuItem(itemId);
  }

  // Method to check if a menu item should be visible
  isMenuItemVisible(item: MenuItem): boolean {
    if (item.visible === false) {
      return false;
    }

    // Check role requirements
    if (item.roles && item.roles.length > 0) {
      const hasRole = item.roles.some(role => this.hasRole(role));
      if (!hasRole) {
        return false;
      }
    }

    // Check permission requirements
    if (item.permissions && item.permissions.length > 0) {
      const hasPermission = item.permissions.some(permission => 
        this.hasPermission(permission)
      );
      if (!hasPermission) {
        return false;
      }
    }

    return true;
  }

  // Method to get visible menu items
  getVisibleMenuItems(): MenuItem[] {
    return this.menuItems.filter(item => this.isMenuItemVisible(item));
  }

  // Method to get visible children for a menu item
  getVisibleChildren(item: MenuItem): MenuItem[] {
    if (!item.children) {
      return [];
    }
    return item.children.filter(child => this.isMenuItemVisible(child));
  }
}
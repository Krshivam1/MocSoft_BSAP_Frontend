import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../environment/environment';
import { AuthService } from './auth.service';

export interface MenuItem {
  id: string;
  label: string;
  icon: string;
  route?: string;
  url?: string;
  target?: '_blank' | '_self';
  children?: MenuItem[];
  expanded?: boolean;
  permissions?: string[];
  roles?: string[];
  order?: number;
  visible?: boolean;
  disabled?: boolean;
  badge?: {
    text: string;
    color: string;
  };
}

export interface MenuResponse {
  success: boolean;
  message: string;
  data: MenuItem[];
}

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private menuItemsSubject = new BehaviorSubject<MenuItem[]>([]);
  public menuItems$ = this.menuItemsSubject.asObservable();

  private defaultMenuItems: MenuItem[] = [
    {
      id: 'home',
      label: 'Dashboard',
      icon: '🏠',
      route: '/dashboard/home',
      order: 1,
      visible: true
    },
    {
      id: 'management',
      label: 'Management',
      icon: '⚙️',
      expanded: false,
      order: 2,
      visible: true,
      children: [
        {
          id: 'users',
          label: 'Users',
          icon: '👥',
          route: '/dashboard/users',
          permissions: ['user.read', 'user.list'],
          order: 1,
          visible: true
        },
        {
          id: 'settings',
          label: 'Settings',
          icon: '🔧',
          route: '/dashboard/settings',
          permissions: ['settings.read'],
          order: 2,
          visible: true
        }
      ]
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: '👤',
      route: '/dashboard/profile',
      order: 3,
      visible: true
    }
  ];

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // Load menu from API
  loadMenuFromApi(): Observable<MenuItem[]> {
    const headers = this.getHeaders();
    
    return this.http.get<any>(
      `${environment.apiUrl}menus/user/2`,
      { headers }
    ).pipe(
      map(response => {
        // Map backend fields to MenuItem
        const items = response.data || [];
        return items.map((item: any) => ({
          id: String(item.id),
          label: item.menuName,
          route: item.menuUrl !== '#' ? item.menuUrl : undefined,
          url: item.menuUrl === '#' ? undefined : item.menuUrl,
          order: item.priority,
          visible: item.active,
          // You can add more mappings if needed
        }));
      }),
      tap(menuItems => {
        const filteredMenu = this.filterMenuByPermissions(menuItems);
        this.menuItemsSubject.next(filteredMenu);
      }),
      catchError(error => {
        console.warn('Failed to load menu from API, using default menu:', error);
        const filteredDefault = this.filterMenuByPermissions(this.defaultMenuItems);
        this.menuItemsSubject.next(filteredDefault);
        return new Observable<MenuItem[]>(observer => {
          observer.next(filteredDefault);
          observer.complete();
        });
      })
    );
  }

  // Get admin menu for admin users
  loadAdminMenu(): Observable<MenuItem[]> {
    const headers = this.getHeaders();
    
    return this.http.get<MenuResponse>(
      `${environment.apiUrl}menu/admin-menu`,
      { headers }
    ).pipe(
      map(response => response.data || []),
      tap(menuItems => {
        const filteredMenu = this.filterMenuByPermissions(menuItems);
        this.menuItemsSubject.next(filteredMenu);
      }),
      catchError(this.handleError.bind(this))
    );
  }

  // Get current menu items
  getCurrentMenu(): MenuItem[] {
    return this.menuItemsSubject.value;
  }

  // Filter menu items based on user permissions and roles
  private filterMenuByPermissions(menuItems: MenuItem[]): MenuItem[] {
    const currentUser = this.authService.getCurrentUser();
    
    if (!currentUser) {
      return [];
    }

    return menuItems.filter(item => this.isMenuItemVisible(item, currentUser))
                   .map(item => ({
                     ...item,
                     children: item.children ? 
                       this.filterMenuByPermissions(item.children) : undefined
                   }))
                   .sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  private isMenuItemVisible(item: MenuItem, user: any): boolean {
    // Check if item is explicitly hidden
    if (item.visible === false) {
      return false;
    }

    // Check role requirements
    if (item.roles && item.roles.length > 0) {
      const hasRole = item.roles.some(role => user.role === role);
      if (!hasRole) {
        return false;
      }
    }

    // Check permission requirements
    if (item.permissions && item.permissions.length > 0) {
      const hasPermission = item.permissions.some(permission => 
        this.authService.hasPermission(permission)
      );
      if (!hasPermission) {
        return false;
      }
    }

    return true;
  }

  // Toggle menu item expansion
  toggleMenuItem(itemId: string): void {
    const menuItems = this.getCurrentMenu();
    const updatedMenu = this.toggleMenuItemRecursive(menuItems, itemId);
    this.menuItemsSubject.next(updatedMenu);
  }

  private toggleMenuItemRecursive(items: MenuItem[], targetId: string): MenuItem[] {
    return items.map(item => {
      if (item.id === targetId && item.children) {
        return { ...item, expanded: !item.expanded };
      }
      
      if (item.children) {
        return {
          ...item,
          children: this.toggleMenuItemRecursive(item.children, targetId)
        };
      }
      
      return item;
    });
  }

  // Find menu item by ID
  findMenuItem(itemId: string): MenuItem | null {
    return this.findMenuItemRecursive(this.getCurrentMenu(), itemId);
  }

  private findMenuItemRecursive(items: MenuItem[], targetId: string): MenuItem | null {
    for (const item of items) {
      if (item.id === targetId) {
        return item;
      }
      
      if (item.children) {
        const found = this.findMenuItemRecursive(item.children, targetId);
        if (found) {
          return found;
        }
      }
    }
    
    return null;
  }

  // Update menu item badge
  updateMenuBadge(itemId: string, badge: { text: string; color: string } | null): void {
    const menuItems = this.getCurrentMenu();
    const updatedMenu = this.updateMenuBadgeRecursive(menuItems, itemId, badge);
    this.menuItemsSubject.next(updatedMenu);
  }

  private updateMenuBadgeRecursive(items: MenuItem[], targetId: string, badge: any): MenuItem[] {
    return items.map(item => {
      if (item.id === targetId) {
        return { ...item, badge };
      }
      
      if (item.children) {
        return {
          ...item,
          children: this.updateMenuBadgeRecursive(item.children, targetId, badge)
        };
      }
      
      return item;
    });
  }

  // Initialize menu (called after login)
  initializeMenu(): Observable<MenuItem[]> {
    const user = this.authService.getCurrentUser();
    
    if (user?.role === 'admin' || user?.role === 'super_admin') {
      return this.loadAdminMenu();
    } else {
      return this.loadMenuFromApi();
    }
  }

  // Refresh menu items
  refreshMenu(): Observable<MenuItem[]> {
    return this.initializeMenu();
  }

  // Clear menu (on logout)
  clearMenu(): void {
    this.menuItemsSubject.next([]);
  }

  private getHeaders() {
    const token = this.authService['getToken']();
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  private handleError(error: any): Observable<never> {
    let errorMessage = 'An error occurred while loading menu';
    
    if (error.error) {
      if (typeof error.error === 'string') {
        errorMessage = error.error;
      } else if (error.error.message) {
        errorMessage = error.error.message;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }

    console.error('Menu Service Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
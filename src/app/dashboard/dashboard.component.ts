import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  route?: string;
  children?: MenuItem[];
  expanded?: boolean;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  isSidenavCollapsed = false;
  userEmail = '';

  menuItems: MenuItem[] = [
    {
      id: 'home',
      label: 'Dashboard',
      icon: '🏠',
      route: '/dashboard/home'
    },
    {
      id: 'management',
      label: 'Management',
      icon: '⚙️',
      expanded: false,
      children: [
        {
          id: 'users',
          label: 'Users',
          icon: '👥',
          route: '/dashboard/users'
        },
        {
          id: 'settings',
          label: 'Settings',
          icon: '🔧',
          route: '/dashboard/settings'
        }
      ]
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: '👤',
      route: '/dashboard/profile'
    }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.userEmail = this.authService.getUserEmail() || '';
  }

  toggleSidenav() {
    this.isSidenavCollapsed = !this.isSidenavCollapsed;
  }

  toggleMenuItem(item: MenuItem) {
    if (item.children) {
      item.expanded = !item.expanded;
    } else if (item.route) {
      this.router.navigate([item.route]);
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
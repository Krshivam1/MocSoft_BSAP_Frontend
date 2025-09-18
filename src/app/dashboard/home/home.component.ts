import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  // user/profile information shown in header
  user = {
    name: 'Prem P',
    email: 'prem@gmail.com',
    contact: '7020758597',
    mobile: '9561417403',
    joiningDate: ''
  };

  // cards shown in the dashboard grid (title + count + gradient)
  cards = [
    { title: 'Roles', count: 11, gradient: 'linear-gradient(90deg,#2dd4bf,#16a34a)' },
    { title: 'Permission', count: 176, gradient: 'linear-gradient(90deg,#fb7185,#f97316)' },
    { title: 'Menus', count: 9, gradient: 'linear-gradient(90deg,#6366f1,#06b6d4)' },
    { title: 'SubMenus', count: 165, gradient: 'linear-gradient(90deg,#f59e0b,#f97316)' },
    { title: 'State', count: 1, gradient: 'linear-gradient(90deg,#a78bfa,#c084fc)' },
    { title: 'Modules', count: 9, gradient: 'linear-gradient(90deg,#06b6d4,#60a5fa)' },
    { title: 'Range', count: 13, gradient: 'linear-gradient(90deg,#fb7185,#ef4444)' },
    { title: 'Districts', count: 44, gradient: 'linear-gradient(90deg,#fda4af,#fecaca)' },
    { title: 'Topic', count: 63, gradient: 'linear-gradient(90deg,#60a5fa,#93c5fd)' },
    { title: 'SubTopic', count: 66, gradient: 'linear-gradient(90deg,#0ea5a4,#075985)' },
    { title: 'Questions', count: 496, gradient: 'linear-gradient(90deg,#c084fc,#bfdbfe)' }
  ];

  // sidebar data-entry status list
  dataStatus = Array.from({ length: 30 }).map((_, i) => ({
    name: `SP Example ${i + 1}`,
    progress: '0 out of 9'
  }));
}
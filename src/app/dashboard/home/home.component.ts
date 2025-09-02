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
  stats = [
    { label: 'Total Users', value: '1,234', change: '+12%', trend: 'up' },
    { label: 'Revenue', value: '$45,678', change: '+8%', trend: 'up' },
    { label: 'Orders', value: '891', change: '-2%', trend: 'down' },
    { label: 'Conversion', value: '3.2%', change: '+5%', trend: 'up' }
  ];
}
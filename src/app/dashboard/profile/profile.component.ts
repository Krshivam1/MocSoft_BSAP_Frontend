import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user = {
    name: 'John Doe',
    email: '',
    role: 'Administrator',
    joinDate: 'January 2024',
    avatar: ''
  };

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.user.email = this.authService.getUserEmail() || '';
  }

  onSave() {
    console.log('Profile updated:', this.user);
  }
}
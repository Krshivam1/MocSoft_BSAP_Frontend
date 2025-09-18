import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-communications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './communications.component.html',
  styleUrls: ['./communications.component.css']
})
export class CommunicationsComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
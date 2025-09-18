import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-crime-modus',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './crime-modus.component.html',
  styleUrls: ['./crime-modus.component.css']
})
export class CrimeModusComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface Range {
  id: number;
  stateName: string;
  rangeName: string;
  rangeHead: string;
  rangeContactNo: string;
  rangeMobileNo: string;
  rangeEmail: string;
  rangeDiscription: string;
  rangeImage?: string;
  rangePersonImage?: string;
  active: boolean;
  stateId: number;
}

@Component({
  selector: 'app-range',
  standalone:true,
  templateUrl: './range.component.html',
  styleUrls: ['./range.component.css'],
  imports:[CommonModule,FormsModule]
})
export class RangeComponent implements OnInit {
  ranges: Range[] = [];
  filteredRanges: Range[] = [];
  searchTerm: string = '';

  // Mock data
  private mockRanges: Range[] = [
    {
      id: 1,
      stateName: 'Maharashtra',
      rangeName: 'Mumbai Range',
      rangeHead: 'John Doe',
      rangeContactNo: '0221234567',
      rangeMobileNo: '9876543210',
      rangeEmail: 'mumbai.range@example.com',
      rangeDiscription: 'Mumbai metropolitan area range',
      active: true,
      stateId: 1
    },
    {
      id: 2,
      stateName: 'Karnataka',
      rangeName: 'Bangalore Range',
      rangeHead: 'Jane Smith',
      rangeContactNo: '0802345678',
      rangeMobileNo: '8765432109',
      rangeEmail: 'bangalore.range@example.com',
      rangeDiscription: 'Bangalore urban area range',
      active: true,
      stateId: 2
    },
    {
      id: 3,
      stateName: 'Tamil Nadu',
      rangeName: 'Chennai Range',
      rangeHead: 'Robert Johnson',
      rangeContactNo: '0443456789',
      rangeMobileNo: '7654321098',
      rangeEmail: 'chennai.range@example.com',
      rangeDiscription: 'Chennai coastal area range',
      active: false,
      stateId: 3
    }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadRanges();
  }

  loadRanges(): void {
    // Simulate API call delay
    setTimeout(() => {
      this.ranges = this.mockRanges;
      this.filteredRanges = [...this.ranges];
    }, 500);
  }

  filterRanges(): void {
    if (!this.searchTerm) {
      this.filteredRanges = [...this.ranges];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredRanges = this.ranges.filter(range =>
        range.rangeName.toLowerCase().includes(term) ||
        range.stateName.toLowerCase().includes(term) ||
        range.rangeHead.toLowerCase().includes(term) ||
        range.rangeEmail.toLowerCase().includes(term)
      );
    }
  }

  addNewRange(): void {
    this.router.navigate(['/dashboard/range/add']);
  }

  editRange(id: number): void {
    this.router.navigate(['/dashboard/range/edit', id]);
  }

  toggleStatus(range: Range): void {
    range.active = !range.active;
    // Here you would typically make an API call to update the status
    console.log(`Range ${range.id} status updated to: ${range.active}`);
  }

  deleteRange(id: number): void {
    if (confirm('Are you sure you want to delete this range?')) {
      this.ranges = this.ranges.filter(range => range.id !== id);
      this.filteredRanges = this.filteredRanges.filter(range => range.id !== id);
      // Here you would typically make an API call to delete the range
      console.log(`Range ${id} deleted`);
    }
  }
}
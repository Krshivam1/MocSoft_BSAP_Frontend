import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Module {
  id: number;
  name: string;
  priority: number;
  active: boolean;
}

@Component({
  selector: 'app-modules',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modules.component.html'
})
export class ModulesComponent implements OnInit {
  modules: Module[] = [];
  showAddModal = false;
  showEditModal = false;
  editModuleData: Module | null = null;

  ngOnInit(): void {
    // Dummy data (replace with API call)
    this.modules = [
      { id: 4, name: 'Crime Statistics', priority: 1, active: true },
      { id: 5, name: 'General Administration', priority: 4, active: true },
      { id: 6, name: 'Prosecution and Trial', priority: 2, active: true },
      { id: 7, name: 'Crime Prevention Measures', priority: 3, active: true },
      { id: 8, name: 'Police Line Functioning', priority: 5, active: true },
    ];
  }

  openAddModal() {
    this.showAddModal = true;
  }

  openEditModal(module: Module) {
    this.editModuleData = { ...module };
    this.showEditModal = true;
  }

  saveModule(newModule: Module) {
    newModule.id = this.modules.length + 1;
    this.modules.push(newModule);
    this.showAddModal = false;
  }

  updateModule() {
    if (this.editModuleData) {
      const index = this.modules.findIndex(m => m.id === this.editModuleData!.id);
      if (index > -1) this.modules[index] = { ...this.editModuleData };
      this.showEditModal = false;
    }
  }

  deactivateModule(id: number) {
    const mod = this.modules.find(m => m.id === id);
    if (mod) mod.active = false;
  }
}

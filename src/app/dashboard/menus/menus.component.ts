import { CommonModule } from '@angular/common';
import { Component} from '@angular/core';
import { FormsModule } from '@angular/forms';

interface Menu {
  id: number;
  name: string;
  url: string;
  priority: number;
  active: boolean;
}

@Component({
  selector: 'app-menus',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './menus.component.html',
  styleUrl: './menus.component.css',

})
export class MenusComponent{
  menus: Menu[] = [];
  addMenuVisible = true;   // like ADDMEN
  editMenuVisible = true;  // like EDTMEN

  newMenu: Menu = { id: 0, name: '', url: '', priority: 0, active: true };
  editMenu: Menu = { id: 0, name: '', url: '', priority: 0, active: true };

  ngOnInit() {
    // TODO: Replace with API call
    this.menus = [
      { id: 1, name: 'Dashboard', url: '/dashboard', priority: 1, active: true },
      { id: 2, name: 'Users', url: '/users', priority: 2, active: true },
      { id: 3, name: 'Reports', url: '/reports', priority: 3, active: false }
    ];
  }

  // Open Add Modal
  openAddModal() {
    this.newMenu = { id: 0, name: '', url: '', priority: 0, active: true };
    (document.getElementById('menuAddModal') as any).style.display = 'block';
  }

  // Open Edit Modal
  openEditModal(menu: Menu) {
    this.editMenu = { ...menu }; // clone selected
    (document.getElementById('menuEditModal') as any).style.display = 'block';
  }

  // Close Add Modal
  closeAddModal() {
    (document.getElementById('menuAddModal') as any).style.display = 'none';
  }

  // Close Edit Modal
  closeEditModal() {
    (document.getElementById('menuEditModal') as any).style.display = 'none';
  }

  // Save New Menu
  saveMenu() {
    const newId = this.menus.length + 1;
    this.menus.push({
      ...this.newMenu,
      id: newId
    });
    this.closeAddModal();
  }

  // Update Existing Menu
  updateMenu() {
    const index = this.menus.findIndex(m => m.id === this.editMenu.id);
    if (index > -1) {
      this.menus[index] = { ...this.editMenu };
    }
    this.closeEditModal();
  }
}

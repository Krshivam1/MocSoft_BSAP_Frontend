import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface Menu {
  id: number;
  menuName: string;
}

interface SubMenu {
  id: number;
  menuId: number;
  parentSubMenuId?: number;
  name: string;
  url: string;
  priority: number;
  active: boolean;
}

@Component({
  selector: 'app-submenus',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './submenus.component.html',
    styleUrl: './submenus.component.css',

})
export class SubmenusComponent{
  menus: Menu[] = [
    { id: 1, menuName: 'Dashboard' },
    { id: 2, menuName: 'Reports' }
  ];

  submenus: SubMenu[] = [
    { id: 1, menuId: 1, name: 'User Management', url: '/users', priority: 1, active: true },
    { id: 2, menuId: 2, name: 'Monthly Report', url: '/reports/monthly', priority: 2, active: false }
  ];

  // Modal visibility
  addVisible = false;
  editVisible = false;

  // Models
  newSubmenu: Partial<SubMenu> = {};
  editSubmenu: Partial<SubMenu> = {};

  openAddModal() {
    this.newSubmenu = {};
    this.addVisible = true;
  }

  closeAddModal() {
    this.addVisible = false;
  }

  saveSubmenu() {
    if (this.newSubmenu.name && this.newSubmenu.url) {
      const id = this.submenus.length + 1;
      this.submenus.push({
        id,
        menuId: this.newSubmenu.menuId!,
        parentSubMenuId: this.newSubmenu.parentSubMenuId,
        name: this.newSubmenu.name!,
        url: this.newSubmenu.url!,
        priority: this.newSubmenu.priority || 0,
        active: true
      });
      this.closeAddModal();
    }
  }

  openEditModal(submenu: SubMenu) {
    this.editSubmenu = { ...submenu };
    this.editVisible = true;
  }

  closeEditModal() {
    this.editVisible = false;
  }

  updateSubmenu() {
    const index = this.submenus.findIndex(s => s.id === this.editSubmenu.id);
    if (index > -1) {
      this.submenus[index] = this.editSubmenu as SubMenu;
    }
    this.closeEditModal();
  }
  getMenuName(menuId: number): string {
  const menu = this.menus.find(m => m.id === menuId);
  return menu ? menu.menuName : '';
}

}

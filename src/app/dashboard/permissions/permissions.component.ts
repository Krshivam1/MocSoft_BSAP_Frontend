import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface Permission {
  id: number;
  name: string;
  code: string;
  url: string;
  active: boolean;
}

@Component({
  selector: 'app-permissions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './permissions.component.html',
  styleUrl: './permissions.component.css'
})
export class PermissionsComponent{
  permissions: Permission[] = [];
  addPermissionVisible: boolean = true;

  // form model
  newPermission: Permission = { id: 0, name: '', code: '', url: '', active: true };
  isEditMode: boolean = false;  // 🔹 track add vs edit

  constructor() {}

  ngOnInit() {
    // TODO: Replace with API call
    this.permissions = [
      { id: 1, name: 'View Users', code: 'VIEW_USER', url: '/users', active: true },
      { id: 2, name: 'Edit Users', code: 'EDIT_USER', url: '/users/edit', active: true },
      { id: 3, name: 'Delete Users', code: 'DELETE_USER', url: '/users/delete', active: false }
    ];
  }

  // 🔹 Open Add Modal
  openAddModal() {
    this.isEditMode = false;
    this.newPermission = { id: 0, name: '', code: '', url: '', active: true };
    (document.getElementById('permissionModal') as any).style.display = 'block';
  }

  // 🔹 Open Edit Modal
  openEditModal(permission: Permission) {
    this.isEditMode = true;
    this.newPermission = { ...permission }; // copy existing data
    (document.getElementById('permissionModal') as any).style.display = 'block';
  }

  // Close modal
  closeModal() {
    (document.getElementById('permissionModal') as any).style.display = 'none';
  }

  // 🔹 Save or Update
  savePermission() {
    if (this.isEditMode) {
      // update existing permission
      const index = this.permissions.findIndex(p => p.id === this.newPermission.id);
      if (index !== -1) {
        this.permissions[index] = { ...this.newPermission };
      }
    } else {
      // add new
      const newId = this.permissions.length + 1;
      this.permissions.push({
        ...this.newPermission,
        id: newId
      });
    }
    this.closeModal();
  }
}

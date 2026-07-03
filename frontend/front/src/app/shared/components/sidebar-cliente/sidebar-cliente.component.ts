// 📁 src/app/shared/components/sidebar-cliente/sidebar-cliente.component.ts
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar-cliente',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './sidebar-cliente.component.html',
  styleUrl: './sidebar-cliente.component.scss'
})
export class SidebarClienteComponent {
  isCollapsed = false;

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }
}
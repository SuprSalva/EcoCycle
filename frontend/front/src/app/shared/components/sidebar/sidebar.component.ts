<<<<<<< HEAD
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
=======
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
>>>>>>> origin/main

@Component({
  selector: 'app-sidebar',
  standalone: true,
<<<<<<< HEAD
  imports: [RouterModule, CommonModule],
=======
  imports: [CommonModule, RouterModule, FormsModule],
>>>>>>> origin/main
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  @Input() perfil: any;
  @Output() logout = new EventEmitter<void>();
  isCollapsed = false;
  searchTerm = '';

  menu = [
    { section: 'Principal', items: [
      { name: 'Dashboard', icon: 'fa-solid fa-house', route: '/panel/dashboard' },
      { name: 'Usuarios', icon: 'fa-solid fa-users', route: '/panel/usuarios' }
    ]},
    { section: 'Operaciones', items: [
      { name: 'Terminal IoT', icon: 'fa-solid fa-cube', route: '/panel/reciclaje' },
      { name: 'Catálogo', icon: 'fa-solid fa-box', route: '/panel/catalogo' },
      { name: 'Recompensas', icon: 'fa-solid fa-layer-group', route: '/panel/historial-recompensas' }
    ]},
    { section: 'Abastecimiento', items: [
      { name: 'Proveedores', icon: 'fa-solid fa-truck', route: '/panel/proveedores' },
      { name: 'Compras a Proveedores', icon: 'fa-solid fa-cart-shopping', route: '/panel/compras-proveedores' },
      { name: 'Soporte Técnico', icon: 'fa-solid fa-headset', route: '/panel/soporte' }
    ]},
    { section: 'Análisis', items: [
      { name: 'Reportes', icon: 'fa-solid fa-chart-column', route: '/panel/reportes' },
      { name: 'Materia Prima', icon: 'fa-solid fa-warehouse', route: '/panel/materia-prima' },
      { name: 'Portal Cliente', icon: 'fa-solid fa-user-circle', route: '/panel/cliente' }
    ]}
  ];

  get filteredMenu() {
    if (!this.searchTerm.trim()) return this.menu;
    
    const term = this.searchTerm.toLowerCase().trim();
    
    return this.menu.map(group => {
      const filteredItems = group.items.filter(item => 
        item.name.toLowerCase().includes(term)
      );
      return { ...group, items: filteredItems };
    }).filter(group => group.items.length > 0); // Only keep sections that have matching items
  }

  isLightTheme = false;

  ngOnInit() {
   
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      this.isLightTheme = true;
      document.body.classList.add('light-theme');
    }
  }

  toggleTheme() {
    this.isLightTheme = !this.isLightTheme;
    if (this.isLightTheme) {
      document.body.classList.add('light-theme');
      localStorage.setItem('theme', 'light');
    } else {
      document.body.classList.remove('light-theme');
      localStorage.setItem('theme', 'dark');
    }
  }

  onLogout() {
    this.logout.emit();
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }
}
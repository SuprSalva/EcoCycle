import { Component, Input, Output, EventEmitter, HostListener, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})

export class SidebarComponent implements OnInit {

  @Input() perfil: any;
  @Output() logout = new EventEmitter<void>();

  isCollapsed = false;
  searchTerm = '';
  isLightTheme = false;

  showUserMenu = false;

  menu = [
    {
      section: 'Principal',
      items: [
        { name: 'Dashboard', icon: 'fa-solid fa-house', route: '/admin/dashboard' },
        { name: 'Usuarios', icon: 'fa-solid fa-users', route: '/admin/usuarios' }
      ]
    },
    {
      section: 'Operaciones',
      items: [
      //  { name: 'Terminal IoT', icon: 'fa-solid fa-cube', route: '/panel/reciclaje' },
        { name: 'Catálogo', icon: 'fa-solid fa-box', route: '/admin/catalogo' },
        { name: 'Recompensas', icon: 'fa-solid fa-layer-group', route: '/admin/historial-recompensas' }
      ]
    },
    {
      section: 'Abastecimiento',
      items: [
        { name: 'Proveedores', icon: 'fa-solid fa-truck', route: '/admin/proveedores' },
        { name: 'Compras a Proveedores', icon: 'fa-solid fa-cart-shopping', route: '/admin/compras-proveedores' },
      ]
    },
    {
      section: 'Análisis',
      items: [
        { name: 'Reportes', icon: 'fa-solid fa-chart-column', route: '/admin/reportes' },
        { name: 'Materia Prima', icon: 'fa-solid fa-warehouse', route: '/admin/materia-prima' },
        { name: 'Comentarios y Opiniones', icon: 'fa-solid fa-shopping-bag', route: '/admin/compras' },

        
      ]
    }
  ];

  get filteredMenu() {
    if (!this.searchTerm.trim()) return this.menu;

    const term = this.searchTerm.toLowerCase().trim();

    return this.menu
      .map(group => ({
        ...group,
        items: group.items.filter(item =>
          item.name.toLowerCase().includes(term)
        )
      }))
      .filter(group => group.items.length > 0);
  }

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
    console.log("logout ejecutao");
    this.logout.emit();
    this.showUserMenu = false;
  }

  toggleSidebar() {     
    this.isCollapsed = !this.isCollapsed;
  }

  toggleUserMenu(event?: MouseEvent) {
    event?.stopPropagation();
    this.showUserMenu = !this.showUserMenu;
    console.log('showUserMenu:', this.showUserMenu);
  }

  closeUserMenu() {
    this.showUserMenu = false;
  }

  @HostListener('document:click')
  onDocumentClick() {
    this.showUserMenu = false;
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    this.showUserMenu = false;
  }

}
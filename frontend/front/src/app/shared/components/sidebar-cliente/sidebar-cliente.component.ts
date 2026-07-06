import { Component, Input, Output, EventEmitter, HostListener, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-sidebar-cliente',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './sidebar-cliente.component.html',
  styleUrl: './sidebar-cliente.component.scss'
})
export class SidebarClienteComponent  implements OnInit {

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
        { name: 'Dashboard', icon: 'fa-solid fa-house', route: '/cliente/dashboard' },
        {name: 'Mis Productos', icon: 'fa-solid fa-box', route: '/cliente/mis-productos'},
        {name: 'Mis Compras', icon: 'fa-solid fa-receipt', route: '/cliente/mis-compras'},
      ]
    },
    {
      section: 'Operaciones',
      items: [
     
        { name: 'Catálogo', icon: 'fa-solid fa-box', route: '/cliente/catalogo' },
        { name: 'Recompensas', icon: 'fa-solid fa-layer-group', route: '/cliente/historial-recompensas' }
      ]
    },
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
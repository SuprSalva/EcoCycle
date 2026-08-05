import { Component, HostListener, AfterViewInit, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { RouterLink } from '@angular/router';  
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-bar',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './bar.component.html',
  styleUrl: './bar.component.scss'
})
export class BarComponent implements AfterViewInit, OnInit {

  @Input() perfil: any;
  @Input() forceTransparent = false; // <-- NUEVO: Input para forzar transparencia
  @Input() forceSolid = false;
  @Output() logout = new EventEmitter<void>();

  isScrolled = false;
  private heroHeight = 0;
  isLightTheme = false;

  ngOnInit(): void {

    const savedTheme = localStorage.getItem('theme') || 'light';
    this.isLightTheme = savedTheme === 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
  
  }

  toggleTheme(): void {

    this.isLightTheme = !this.isLightTheme;
    const theme = this.isLightTheme ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }

  ngAfterViewInit(): void {
    
    if (this.forceSolid) {
      this.isScrolled = true;
      return;
    }

    if (this.forceTransparent) {
      this.isScrolled = false;
      return;
    }

    const hero = document.querySelector('.hero') as HTMLElement;
    if (hero) {
      this.heroHeight = hero.offsetHeight;
    } else {
      this.isScrolled = true;
    }
  }
  
  @HostListener('window:scroll')
  onScroll() {
    
    if (this.forceSolid) {
      this.isScrolled = true;
      return;
    }

    if (this.forceTransparent) {
      this.isScrolled = false;
      return;
    }

    const hero = document.querySelector('.hero') as HTMLElement;
    if (hero) {
      this.isScrolled = window.scrollY >= hero.offsetHeight - 80;
    } else {
      this.isScrolled = true;
    }
  }
}
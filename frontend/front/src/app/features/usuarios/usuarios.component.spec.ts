

/// <reference types="jasmine" />
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UsuariosComponent } from './usuarios.component';
import { AuthService } from '../../core/services/auth.service';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

describe('UsuariosComponent', () => {
  let component: UsuariosComponent;
  let fixture: ComponentFixture<UsuariosComponent>;
  
  // Creamos un simulador falso del AuthService para que no intente pegarle al backend real
  const authServiceMock = {
    obtenerTodosLosUsuarios: () => of({ data: [] }) // Simula que el backend responde un array vacío exitosamente
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsuariosComponent],
      providers: [
        // 1. Inyectamos el simulador en lugar del servicio real
        { provide: AuthService, useValue: authServiceMock },
        // 2. Proveemos las rutas para que el 'routerLink' no rompa el HTML
        provideRouter([])
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsuariosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
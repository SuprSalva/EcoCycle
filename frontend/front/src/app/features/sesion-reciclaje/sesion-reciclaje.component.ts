import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service'; // Ajusta la ruta a tu proyecto
import Swal from 'sweetalert2';

@Component({
  selector: 'app-sesion-reciclaje',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './sesion-reciclaje.component.html',
  styleUrls: ['./sesion-reciclaje.component.scss']
})
export class SesionReciclajeComponent implements OnInit {
  reciclajeForm!: FormGroup;
  puntosCalculados: number = 0;
  procesando: boolean = false;
  listaUsuarios: any[] = []; 

  private readonly API_RECICLAJE = 'http://localhost:5171/api/SesionReciclaje';

  constructor(
    private fb: FormBuilder, 
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.cargarUsuarios();
    
    this.reciclajeForm.get('botellas')?.valueChanges.subscribe((valor) => {
      this.puntosCalculados = (valor && valor > 0) ? Number((valor * 0.10).toFixed(2)) : 0;
    });
  }

  initForm(): void {
    this.reciclajeForm = this.fb.group({
      usuarioId: ['', [Validators.required]], // Aquí guardaremos el ID oculto para C#
      maquinaId: ['MQ-ECO-01', [Validators.required]],
      botellas: ['', [Validators.required, Validators.min(1)]]
    });
  }

  cargarUsuarios(): void {
    this.authService.obtenerTodosLosUsuarios().subscribe({
      next: (usuarios) => {
        this.listaUsuarios = usuarios;
      },
      error: (err) => console.error('Error cargando usuarios del sistema:', err)
    });
  }

  // ⚡ FUNCIÓN CLAVE PARA LA UX AUTÓGONA: Mapea el texto seleccionado al ID real de Firestore
  onUsuarioSeleccionado(event: any): void {
    const valorSeleccionado = event.target.value;
    
    // Buscamos cuál usuario coincide con la cadena armada en el datalist
    const usuarioEncontrado = this.listaUsuarios.find(user => 
      `${user.nombre} ${user.apellidos} (${user.email})` === valorSeleccionado
    );

    if (usuarioEncontrado) {
      // Seteamos el ID real en el formulario reactivo de forma transparente
      this.reciclajeForm.get('usuarioId')?.setValue(usuarioEncontrado.id);
    } else {
      // Si borra o escribe algo inválido, reseteamos el ID
      this.reciclajeForm.get('usuarioId')?.setValue('');
    }
  }

  registrarSesion(): void {
    if (this.reciclajeForm.invalid) {
      Swal.fire('Atención', 'Por favor selecciona un usuario válido de la lista y la cantidad de botellas.', 'warning');
      return;
    }

    this.procesando = true;

    const payload = {
      UsuarioId: this.reciclajeForm.value.usuarioId,
      MaquinaId: this.reciclajeForm.value.maquinaId,
      Botellas: Number(this.reciclajeForm.value.botellas)
    };

    this.http.post<any>(this.API_RECICLAJE, payload).subscribe({
      next: (respuesta) => {
        this.procesando = false;
        
        Swal.fire({
          title: '¡Depósito Exitoso!',
          text: `Sesión guardada en el core. Puntos acreditados correctamente.`,
          icon: 'success',
          confirmButtonColor: '#7cb342'
        });

        this.reciclajeForm.reset({ maquinaId: 'MQ-ECO-01', usuarioId: '' });
        // Limpiamos también visualmente el input buscador del HTML
        (document.getElementById('usuariosList')?.previousElementSibling as HTMLInputElement).value = '';
        this.puntosCalculados = 0;
      },
      error: (err) => {
        this.procesando = false;
        const msg = err.error?.message || 'Error al conectar con la base de datos IoT.';
        Swal.fire('Error de Procesamiento', msg, 'error');
      }
    });
  }
}
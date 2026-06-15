import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';
import { RecompensaService, Recompensa } from '../../../core/services/recompensa.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-recompensa-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './recompensa-form.component.html'
})
export class RecompensaFormComponent implements OnInit, OnChanges {
  @Input() recompensaAEditar: Recompensa | null = null;
  @Output() cerrar = new EventEmitter<void>();
  @Output() recargar = new EventEmitter<void>();

  recompensaForm: FormGroup;
  cargando = false;
  esEdicion = false;
  
  archivoSeleccionado: File | null = null;
  imagenPreviewUrl: string | null = null;

  constructor(
    private fb: FormBuilder,
    private recompensaService: RecompensaService,
    private notificationService: NotificationService,
    private storage: Storage
  ) {
    this.recompensaForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: ['', [Validators.required]],
      costoPuntos: [10, [Validators.required, Validators.min(1)]],
      stock: [0, [Validators.required, Validators.min(-1)]],
      activa: [true],
      imagenUrl: ['']
    });
  }

  ngOnInit(): void {
    this.iniciarFormulario();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['recompensaAEditar']) {
      this.iniciarFormulario();
    }
  }

  iniciarFormulario(): void {
    this.archivoSeleccionado = null;
    this.imagenPreviewUrl = null;

    if (this.recompensaAEditar) {
      this.esEdicion = true;
      this.imagenPreviewUrl = this.recompensaAEditar.imagenUrl || null;
      this.recompensaForm.patchValue({
        nombre: this.recompensaAEditar.nombre,
        descripcion: this.recompensaAEditar.descripcion || '',
        costoPuntos: this.recompensaAEditar.costoPuntos,
        stock: this.recompensaAEditar.stock,
        activa: this.recompensaAEditar.activa,
        imagenUrl: this.recompensaAEditar.imagenUrl || ''
      });
    } else {
      this.esEdicion = false;
      this.recompensaForm.reset({
        nombre: '',
        descripcion: '',
        costoPuntos: 10,
        stock: 0,
        activa: true,
        imagenUrl: ''
      });
    }
  }

  alSeleccionarArchivo(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.archivoSeleccionado = file;
      
      // Crear preview local
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagenPreviewUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  async guardarRecompensa() {
    if (this.recompensaForm.invalid) {
      this.notificationService.warning('Campos incompletos', 'Revisa los campos requeridos marcados en rojo.');
      this.recompensaForm.markAllAsTouched();
      return;
    }

    this.cargando = true;
    this.notificationService.showLoading('Guardando...', 'Subiendo datos y validando recompensa');

    try {
      let finalImageUrl = this.recompensaForm.value.imagenUrl;

      // Si seleccionaron un nuevo archivo, lo subimos primero
      if (this.archivoSeleccionado) {
        const filePath = `recompensas/${Date.now()}_${this.archivoSeleccionado.name}`;
        const storageRef = ref(this.storage, filePath);
        const uploadTask = await uploadBytes(storageRef, this.archivoSeleccionado);
        finalImageUrl = await getDownloadURL(uploadTask.ref);
      }

      const datos = {
        ...this.recompensaForm.value,
        imagenUrl: finalImageUrl
      };

      if (this.esEdicion && this.recompensaAEditar) {
        this.recompensaService.actualizarRecompensa(this.recompensaAEditar.id, datos).subscribe({
          next: () => {
            this.cargando = false;
            this.notificationService.hideLoading();
            this.notificationService.success('¡Actualizada!', 'La recompensa se actualizó correctamente.');
            this.recargar.emit();
          },
          error: (err: any) => {
            this.cargando = false;
            this.notificationService.hideLoading();
            console.error(err);
            this.notificationService.error('Error', 'No se pudo actualizar la recompensa.');
          }
        });
      } else {
        this.recompensaService.crearRecompensa(datos).subscribe({
          next: () => {
            this.cargando = false;
            this.notificationService.hideLoading();
            this.notificationService.success('¡Creada!', 'Recompensa agregada al catálogo exitosamente.');
            this.recargar.emit();
          },
          error: (err: any) => {
            this.cargando = false;
            this.notificationService.hideLoading();
            console.error(err);
            this.notificationService.error('Error', 'No se pudo crear la recompensa.');
          }
        });
      }
    } catch (err) {
      this.cargando = false;
      this.notificationService.hideLoading();
      console.error('Error al subir imagen', err);
      this.notificationService.error('Error de subida', 'Ocurrió un error al intentar subir la imagen.');
    }
  }

  volver(): void {
    this.cerrar.emit();
  }
}

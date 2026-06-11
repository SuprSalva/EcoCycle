import { Injectable } from '@angular/core';
import Swal, { SweetAlertIcon } from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  // Configuramos un Toast para notificaciones rápidas y no intrusivas
  private Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.onmouseenter = Swal.stopTimer;
      toast.onmouseleave = Swal.resumeTimer;
    }
  });

  // Notificación tipo Toast (esquinada, se quita sola)
  toast(icon: SweetAlertIcon, title: string) {
    this.Toast.fire({
      icon: icon,
      title: title
    });
  }

  toastSuccess(title: string) {
    this.toast('success', title);
  }

  toastError(title: string) {
    this.toast('error', title);
  }

  toastWarning(title: string) {
    this.toast('warning', title);
  }

  // Alertas modales centradas (para mensajes importantes)
  success(title: string, text: string = '') {
    return Swal.fire({
      title: title,
      text: text,
      icon: 'success',
      confirmButtonColor: '#0D631B',
      confirmButtonText: 'Aceptar',
      customClass: {
        confirmButton: 'btn btn-success shadow-sm rounded-3 px-4 py-2 fw-semibold'
      },
      buttonsStyling: false
    });
  }

  error(title: string, text: string = '') {
    return Swal.fire({
      title: title,
      text: text,
      icon: 'error',
      confirmButtonColor: '#ef233c',
      confirmButtonText: 'Cerrar',
      customClass: {
        confirmButton: 'btn btn-danger shadow-sm rounded-3 px-4 py-2 fw-semibold'
      },
      buttonsStyling: false
    });
  }

  warning(title: string, text: string = '') {
    return Swal.fire({
      title: title,
      text: text,
      icon: 'warning',
      confirmButtonColor: '#0D631B',
      confirmButtonText: 'Entendido',
      customClass: {
        confirmButton: 'btn btn-success shadow-sm rounded-3 px-4 py-2 fw-semibold'
      },
      buttonsStyling: false
    });
  }

  // Diálogo de confirmación para acciones peligrosas
  confirmAction(title: string, text: string, confirmText: string = 'Sí, continuar', confirmColor: string = '#ef233c') {
    return Swal.fire({
      title: title,
      text: text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: confirmColor,
      cancelButtonColor: '#6c757d',
      confirmButtonText: confirmText,
      cancelButtonText: 'Cancelar',
      customClass: {
        confirmButton: 'btn shadow-sm rounded-3 px-4 py-2 fw-semibold mx-2 text-white',
        cancelButton: 'btn btn-light shadow-sm rounded-3 px-4 py-2 fw-semibold mx-2'
      },
      buttonsStyling: false,
      didOpen: () => {
        // Asignar el color dinámicamente al botón personalizado
        const confirmBtn = Swal.getConfirmButton();
        if (confirmBtn) {
          confirmBtn.style.backgroundColor = confirmColor;
          confirmBtn.style.border = 'none';
        }
      }
    });
  }
}

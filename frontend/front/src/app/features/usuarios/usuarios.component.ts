import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { UsuarioFormComponent } from './usuario-form/usuario-form.component';
import { NotificationService } from '../../core/services/notification.service';

import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, UsuarioFormComponent],
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.scss']
})
export class UsuariosComponent implements OnInit {
  usuarios: any[] = [];
  cargando: boolean = true;
  
  private _searchTerm: string = '';
  get searchTerm(): string {
    return this._searchTerm;
  }
  set searchTerm(value: string) {
    this._searchTerm = value;
    this.currentPage = 1;
  }

  currentPage: number = 1;
  itemsPerPage: number = 10;
  itemsPerPageOptions: number[] = [10, 20, 50];

  vistaActual: 'lista' | 'formulario' = 'lista';
  idEdicion: string | null = null;

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.obtenerLista();
  }

  obtenerLista(): void {
    this.cargando = true;
    this.notificationService.showLoading('Cargando usuarios...', 'Sincronizando usuarios con el servidor');
    this.authService.obtenerTodosLosUsuarios().subscribe({
      next: (data: any[]) => {
        this.usuarios = data;
        this.cargando = false;
        this.notificationService.hideLoading();
      },
      error: (err: any) => {
        console.error('Error al listar usuarios:', err);
        this.cargando = false;
        this.notificationService.hideLoading();
        this.notificationService.error('Error', 'No se pudieron cargar los usuarios.');
      }
    });
  }

  get usuariosFiltrados(): any[] {
    if (!this.searchTerm.trim()) {
      return this.usuarios;
    }
    const term = this.searchTerm.toLowerCase();
    return this.usuarios.filter(u => 
      (u.nombre && u.nombre.toLowerCase().includes(term)) ||
      (u.apellidos && u.apellidos.toLowerCase().includes(term)) ||
      (u.email && u.email.toLowerCase().includes(term)) ||
      (u.rol && u.rol.toLowerCase().includes(term))
    );
  }

  get paginatedUsuarios(): any[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.usuariosFiltrados.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.usuariosFiltrados.length / this.itemsPerPage) || 1;
  }

  cambiarPagina(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  cambiarItemsPorPagina(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.itemsPerPage = Number(selectElement.value);
    this.currentPage = 1;
  }

  exportToExcel(): void {
    const datosBase = this.usuariosFiltrados.map(u => ({
      'Nombre Completo': `${u.nombre} ${u.apellidos}`,
      'Correo Electrónico': u.email,
      'Puntos Acumulados': u.saldoPuntos || 0,
      'Rol Asignado': u.rol.toUpperCase(),
      'Estatus': u.rol !== 'suspendido' ? 'ACTIVO' : 'INACTIVO'
    }));

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet([]);
    
    XLSX.utils.sheet_add_aoa(worksheet, [
      ['Reporte Maestro de Usuarios - EcoCycle'],
      [`Fecha de generación: ${new Date().toLocaleDateString()} a las ${new Date().toLocaleTimeString()}`],
      [`Total de registros: ${this.usuariosFiltrados.length}`],
      []
    ], { origin: 'A1' });

    XLSX.utils.sheet_add_json(worksheet, datosBase, { origin: 'A5' });

    worksheet['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 4 } },
      { s: { r: 2, c: 0 }, e: { r: 2, c: 4 } }
    ];

    worksheet['!cols'] = [
      { wch: 35 },
      { wch: 40 },
      { wch: 18 },
      { wch: 22 },
      { wch: 15 }
    ];

    const workbook: XLSX.WorkBook = { Sheets: { 'Usuarios': worksheet }, SheetNames: ['Usuarios'] };
    XLSX.writeFile(workbook, 'Reporte_Usuarios_EcoCycle.xlsx');
  }

  exportToPDF(): void {
    const doc = new jsPDF();
    const fecha = new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString();

    doc.setFontSize(24);
    doc.setTextColor(13, 99, 27);
    doc.text('EcoCycle', 14, 22);

    doc.setFontSize(16);
    doc.setTextColor(26, 28, 28);
    doc.text('Reporte Maestro de Usuarios', 14, 32);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Fecha de generación: ${fecha}`, 14, 40);
    doc.text(`Total de registros listados: ${this.usuariosFiltrados.length}`, 14, 45);

    const bodyData = this.usuariosFiltrados.map(u => [
      `${u.nombre} ${u.apellidos}`,
      u.email,
      (u.saldoPuntos || 0).toString(),
      u.rol.toUpperCase(),
      u.rol !== 'suspendido' ? 'ACTIVO' : 'INACTIVO'
    ]);

    autoTable(doc, {
      startY: 50,
      head: [['Nombre Completo', 'Correo', 'Puntos', 'Rol', 'Estatus']],
      body: bodyData,
      theme: 'grid',
      headStyles: { 
        fillColor: [13, 99, 27],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        textColor: [40, 40, 40]
      },
      alternateRowStyles: { 
        fillColor: [249, 249, 249]
      },
      columnStyles: {
        0: { cellWidth: 45 },
        1: { cellWidth: 60 },
        2: { cellWidth: 20, halign: 'center' },
        3: { cellWidth: 30, halign: 'center' },
        4: { cellWidth: 25, halign: 'center' }
      },
      didDrawPage: (data) => {
        const pageSize = doc.internal.pageSize;
        const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
        const text = `Página ${data.pageNumber}`;
        
        doc.setFontSize(9);
        doc.setTextColor(150, 150, 150);
        doc.text(text, (pageSize.width - doc.getTextWidth(text)) / 2, pageHeight - 10);
      }
    });

    doc.save('Reporte_Usuarios_EcoCycle.pdf');
  }

  irANuevoUsuario(): void {
    this.idEdicion = null;
    this.vistaActual = 'formulario';
  }

  irAEditarUsuario(usuario: any): void {
    this.idEdicion = usuario.id;
    this.vistaActual = 'formulario';
  }

  volverDeFormulario(): void {
    this.vistaActual = 'lista';
    this.idEdicion = null;
    this.obtenerLista();
  }

  alternarEstado(usuario: any, event: Event): void {
    event.stopPropagation();
    const esSuspendido = usuario.rol === 'suspendido';
    const nuevoRol = esSuspendido ? 'usuario' : 'suspendido';

    this.notificationService.confirmAction(
      esSuspendido ? '¿Deseas reactivar esta cuenta?' : '¿Seguro que deseas desactivar al usuario?',
      esSuspendido ? 'Volverá a tener acceso normal.' : 'Se le denegará el acceso a los módulos operativos.',
      esSuspendido ? 'Sí, reactivar' : 'Sí, desactivar',
      esSuspendido ? '#0D631B' : '#ef233c'
    ).then((result: any) => {
      if (result.isConfirmed) {
        const bodyActualizado = {
          nombre: usuario.nombre,
          apellidos: usuario.apellidos,
          telefono: usuario.telefono || '',
          direccion: usuario.direccion || '',
          rol: nuevoRol
        };

        this.notificationService.showLoading('Actualizando...', 'Modificando estatus del usuario');
        this.authService.actualizarUsuario(usuario.id, bodyActualizado).subscribe({
          next: () => {
            this.notificationService.hideLoading();
            this.notificationService.toastSuccess('Estatus modificado exitosamente.');
            this.obtenerLista();
          },
          error: (err: any) => {
            this.notificationService.hideLoading();
            console.error(err);
            this.notificationService.error('Error', 'No se pudo actualizar el estatus.');
          }
        });
      }
    });
  }
}
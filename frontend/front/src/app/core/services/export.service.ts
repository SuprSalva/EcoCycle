import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { AuthService } from './auth.service';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  constructor(private authService: AuthService) { }

  private async getAuthorName(): Promise<string> {
    try {
      const perfil = await firstValueFrom(this.authService.obtenerPerfilUsuario());
      if (perfil) {
        const email = perfil.email || perfil.correo || '';
        return `${perfil.nombre} ${perfil.apellidos || ''} ${email ? '(' + email + ')' : ''}`.trim();
      }
    } catch (e) {
      console.error('Error fetching author for export', e);
    }
    return 'Administrador del Sistema';
  }

  /**
   * Genera un PDF con un diseño premium y moderno, alineado a EcoCycle.
   */
  async exportToPDF(title: string, headers: string[], data: any[][], fileName: string): Promise<void> {
    const author = await this.getAuthorName();
    const doc = new jsPDF();

    // Color primario EcoCycle (verde moderno)
    const primaryColor: [number, number, number] = [19, 115, 51]; // #137333

    // Bloque de cabecera sólido
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 210, 40, 'F'); // 210mm es el ancho A4 por defecto

    // Título Principal en Blanco
    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 14, 22);
    
    // Subtítulo con fecha y autor
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generado el: ${new Date().toLocaleString()}  |  Por: ${author}`, 14, 30);

    // Tabla con Autotable
    autoTable(doc, {
      startY: 48,
      head: [headers],
      body: data,
      theme: 'grid',
      styles: { 
        fontSize: 9, 
        cellPadding: 6,
        font: 'helvetica'
      },
      headStyles: { 
        fillColor: primaryColor, // Verde primario de EcoCycle en lugar del negro
        textColor: 255, 
        fontStyle: 'bold',
        halign: 'left'
      },
      alternateRowStyles: { 
        fillColor: [248, 249, 250] // Bootstrap light
      },
      bodyStyles: {
        textColor: [60, 60, 60],
        halign: 'left'
      },
      didDrawPage: (dataArg) => {
        // Pie de página con numeración y marca de agua de texto
        const pageSize = doc.internal.pageSize;
        const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
        
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.setFont('helvetica', 'italic');
        doc.text('Documento confidencial - Generado por el Sistema EcoCycle', 14, pageHeight - 10);
        
        const str = `Página ${doc.internal.pages.length - 1}`;
        doc.text(str, pageSize.width - 14 - doc.getTextWidth(str), pageHeight - 10);
      }
    });

    doc.save(fileName);
  }

  /**
   * Genera un Excel con celdas estilizadas, colores y auto-ajuste.
   */
  async exportToExcel(title: string, headers: string[], data: any[][], fileName: string): Promise<void> {
    const author = await this.getAuthorName();
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Datos');

    // Título en la primera fila con bloque de color oscuro
    worksheet.mergeCells(`A1:${String.fromCharCode(64 + headers.length)}2`);
    const titleCell = worksheet.getCell('A1');
    titleCell.value = title.toUpperCase();
    titleCell.font = { name: 'Arial', size: 18, bold: true, color: { argb: 'FFFFFFFF' } };
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF137333' } };
    
    // Subtítulo (Fecha y Autor)
    worksheet.mergeCells(`A3:${String.fromCharCode(64 + headers.length)}3`);
    const dateCell = worksheet.getCell('A3');
    dateCell.value = `Generado el: ${new Date().toLocaleString()}  |  Autor: ${author}  |  Documento Confidencial - EcoCycle`;
    dateCell.font = { name: 'Arial', size: 10, italic: true, color: { argb: 'FF333333' } };
    dateCell.alignment = { vertical: 'middle', horizontal: 'right' };
    dateCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF4F7FE' } };

    // Fila en blanco
    worksheet.addRow([]);

    // Cabeceras de tabla (Fila 5)
    const headerRow = worksheet.addRow(headers);
    headerRow.eachCell((cell, colNumber) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF137333' } }; // Verde primario en lugar de negro
      cell.font = { name: 'Arial', color: { argb: 'FFFFFFFF' }, bold: true };
      cell.alignment = { vertical: 'middle', horizontal: 'left' };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFDDDDDD' } },
        bottom: { style: 'thin', color: { argb: 'FFDDDDDD' } },
        left: { style: 'thin', color: { argb: 'FFDDDDDD' } },
        right: { style: 'thin', color: { argb: 'FFDDDDDD' } }
      };
    });
    headerRow.height = 25;

    // Autofilter para las cabeceras
    worksheet.autoFilter = `A5:${String.fromCharCode(64 + headers.length)}5`;

    // Datos con filas estilo cebra
    data.forEach((rowData, index) => {
      const row = worksheet.addRow(rowData);
      row.eachCell(cell => {
        cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFEEEEEE' } },
          bottom: { style: 'thin', color: { argb: 'FFEEEEEE' } },
          left: { style: 'thin', color: { argb: 'FFEEEEEE' } },
          right: { style: 'thin', color: { argb: 'FFEEEEEE' } }
        };
        // Estilo cebra sutil
        if (index % 2 !== 0) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8F9FA' } };
        }
      });
    });

    // Auto-ajustar ancho de columnas
    worksheet.columns.forEach((column, i) => {
      let maxColumnLength = 0;
      column.eachCell?.({ includeEmpty: true }, (cell, rowNumber) => {
        // Ignoramos el título para calcular el ancho (filas 1 a 4)
        if (Number(rowNumber) > 4) {
          const columnLength = cell.value ? cell.value.toString().length : 10;
          if (columnLength > maxColumnLength) {
            maxColumnLength = columnLength;
          }
        }
      });
      column.width = Math.min(Math.max(maxColumnLength + 4, 15), 50);
    });

    // Descargar
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, fileName);
  }
}

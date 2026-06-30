using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Back.Models.DTOs.Request;

public class ComentarioRequest
{
    public string Asunto { get; set; } = string.Empty;
    public string Mensaje { get; set; } = string.Empty;
    // Categoría para clasificar: "Sugerencia", "Reporte de Fallo", "Problema con Puntos"
    public string Categoria { get; set; } = "Sugerencia"; 
}
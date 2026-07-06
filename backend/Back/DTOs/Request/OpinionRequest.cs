using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Back.DTOs.Request
{
    public class OpinionRequest
    {
       public string Opinion { get; set; } = string.Empty;
    public int Calificacion { get; set; }
    }
}
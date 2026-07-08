using System.ComponentModel.DataAnnotations;

namespace Back.Models.DTOs.Request{

    public class ResponderComentarioRequest
    {
        public string NombreCliente { get; set; } = "Usuario Anónimo";
        public string MensajeOriginal { get; set; } = string.Empty;
        public string RespuestaAdmin { get; set; } = string.Empty;
    }
}
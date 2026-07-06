// 📁 Back/Services/PdfGeneratorService.cs
using System;
using System.Text;

namespace Back.Services;

public interface IPdfGeneratorService
{
    byte[] GenerarManualUsuario(string nombre, string email);
}

public class PdfGeneratorService : IPdfGeneratorService
{
    public byte[] GenerarManualUsuario(string nombre, string email)
    {
        // Contenido del manual
        var contenido = $@"
╔═══════════════════════════════════════════════════════════════════╗
║                                                                   ║
║                        🌱 EcoCycle                                ║
║               Manual de Usuario - Sistema de Reciclaje            ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝

📋 INFORMACIÓN DEL USUARIO
─────────────────────────────────────────────────────────────────────
    Usuario: {nombre}
    Correo: {email}
    Fecha de registro: {DateTime.Now:dd/MM/yyyy HH:mm}
─────────────────────────────────────────────────────────────────────

📖 ¿QUÉ ES EcoCycle?
─────────────────────────────────────────────────────────────────────
EcoCycle es un sistema inteligente de reciclaje PET que te permite
ganar puntos por cada botella de plástico que recicles.

🚀 ¿CÓMO FUNCIONA?
─────────────────────────────────────────────────────────────────────
1. Inicia sesión en la aplicación
2. Escanea el código QR en la máquina de reciclaje
3. Coloca tu botella frente a la cámara
4. ¡Acumula puntos por cada botella reciclada!
5. Canjea tus puntos por recompensas

📱 FUNCIONALIDADES PRINCIPALES
─────────────────────────────────────────────────────────────────────
✅ Ver saldo de puntos
✅ Historial de reciclaje
✅ Catálogo de recompensas
✅ Canje de puntos
✅ Perfil de usuario

💰 SISTEMA DE PUNTOS
─────────────────────────────────────────────────────────────────────
• Cada botella PET válida = 10 puntos
• Las botellas deben estar limpias y sin líquido

⚠️ RECOMENDACIONES IMPORTANTES
─────────────────────────────────────────────────────────────────────
• Mantén tu contraseña segura
• No compartas tus credenciales
• Cambia tu contraseña periódicamente

📞 CONTACTO Y SOPORTE
─────────────────────────────────────────────────────────────────────
Correo: soporte@ecocycle.com
Teléfono: +52 477 566 0275

─────────────────────────────────────────────────────────────────────
© {DateTime.Now.Year} EcoCycle - Todos los derechos reservados.
";

        return Encoding.UTF8.GetBytes(contenido);
    }
}
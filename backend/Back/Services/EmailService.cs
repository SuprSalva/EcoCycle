using Microsoft.Extensions.Configuration;
using System;
using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;
using System.IO;

namespace Back.Services;

public interface IEmailService
{
    Task<bool> EnviarCredencialesClienteAsync(string email, string nombre, string password, string linkAcceso);
    Task<bool> EnviarBienvenidaAsync(string email, string nombre, string password, string linkAcceso);
    Task<bool> EnviarCorreoConAdjuntoAsync(string email, string nombre, string asunto, string mensaje, string rutaAdjunto);
    Task<bool> EnviarRespuestaComentarioAsync(string email, string nombre, string mensajeOriginal, string respuestaAdmin);
     Task<bool> EnviarRespuestaReporteAsync(string email, string nombre, string mensajeOriginal, string respuestaAdmin);

}

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    private readonly IWebHostEnvironment _hostEnvironment;

    public EmailService(IConfiguration configuration, IWebHostEnvironment hostEnvironment)
    {
        _configuration = configuration;
        _hostEnvironment = hostEnvironment;
    }


 public async Task<bool>EnviarRespuestaReporteAsync(string email, string nombre, string mensajeOriginal, string respuestaAdmin)
    {
        var asunto = "Actualización de tu Comentario - EcoCycle";

        var mensajeHtml = $@"
        <p>Tu comentario enviado a nuestro buzón ha sido revisado por el equipo administrativo.</p>
        
        <div style='background: #f9f9f9; padding: 15px; border-left: 4px solid #ced4da; margin: 20px 0; border-radius: 0 8px 8px 0;'>
            <strong style='color: #555; font-size: 13px;'>Tu mensaje original:</strong><br/>
            <span style='font-style: italic; color: #666;'>""{mensajeOriginal}""</span>
        </div>

        <div style='background: #e8f5e9; padding: 15px; border-left: 4px solid #0D631B; margin: 20px 0; border-radius: 0 8px 8px 0;'>
            <strong style='color: #0D631B; font-size: 13px;'>Respuesta del Administrador:</strong><br/>
            <span style='color: #2e7d32; font-weight: bold;'>""{respuestaAdmin}""</span>
        </div>

        <p style='margin-top: 25px;'>Si tienes más dudas o comentarios, recuerda que puedes escribirnos nuevamente a través de la plataforma.</p>
    ";

        return await EnviarCorreoConAdjuntoAsync(email, nombre, asunto, mensajeHtml, rutaAdjunto: null!);
    }
    public async Task<bool> EnviarRespuestaComentarioAsync(string email, string nombre, string mensajeOriginal, string respuestaAdmin)
    {
        var asunto = "Actualización de tu Comentario - EcoCycle";

        var mensajeHtml = $@"
        <p>Tu comentario enviado a nuestro buzón ha sido revisado por el equipo administrativo.</p>
        
        <div style='background: #f9f9f9; padding: 15px; border-left: 4px solid #ced4da; margin: 20px 0; border-radius: 0 8px 8px 0;'>
            <strong style='color: #555; font-size: 13px;'>Tu mensaje original:</strong><br/>
            <span style='font-style: italic; color: #666;'>""{mensajeOriginal}""</span>
        </div>

        <div style='background: #e8f5e9; padding: 15px; border-left: 4px solid #0D631B; margin: 20px 0; border-radius: 0 8px 8px 0;'>
            <strong style='color: #0D631B; font-size: 13px;'>Respuesta del Administrador:</strong><br/>
            <span style='color: #2e7d32; font-weight: bold;'>""{respuestaAdmin}""</span>
        </div>

        <p style='margin-top: 25px;'>Si tienes más dudas o comentarios, recuerda que puedes escribirnos nuevamente a través de la plataforma.</p>
    ";

        return await EnviarCorreoConAdjuntoAsync(email, nombre, asunto, mensajeHtml, rutaAdjunto: null!);
    }


    public async Task<bool> EnviarCorreoConAdjuntoAsync(string email, string nombre, string asunto, string mensaje, string rutaAdjunto)
    {
        try
        {
            var smtpHost = _configuration["Email:SmtpHost"] ?? "smtp.gmail.com";
            var smtpPort = int.Parse(_configuration["Email:SmtpPort"] ?? "587");
            var smtpUser = _configuration["Email:SmtpUser"];
            // La contraseña viene de variable de entorno (SMTP_PASSWORD o Email__SmtpPassword),
            // nunca del appsettings.json versionado.
            var smtpPass = _configuration["Email:SmtpPassword"];
            if (string.IsNullOrEmpty(smtpPass))
            {
                smtpPass = _configuration["SMTP_PASSWORD"];
            }
            var fromEmail = _configuration["Email:FromEmail"] ?? smtpUser;

            if (string.IsNullOrEmpty(smtpUser) || string.IsNullOrEmpty(smtpPass))
            {
                Console.WriteLine("❌ Faltan credenciales de correo");
                return false;
            }

            if (string.IsNullOrEmpty(email))
            {
                Console.WriteLine("❌ Email destinatario vacío");
                return false;
            }

            using var client = new SmtpClient(smtpHost, smtpPort)
            {
                EnableSsl = true,
                Credentials = new NetworkCredential(smtpUser, smtpPass),
                DeliveryMethod = SmtpDeliveryMethod.Network,
                UseDefaultCredentials = false,
                Timeout = 30000
            };

            using var mailMessage = new MailMessage
            {
                From = new MailAddress(fromEmail ?? smtpUser, "EcoCycle"),
                Subject = asunto,
                IsBodyHtml = true,
                Body = $@"
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {{ font-family: Arial, sans-serif; background: #f4f7f6; }}
                        .container {{ max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }}
                        .header {{ background: #0D631B; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }}
                        .content {{ padding: 20px; }}
                        .btn {{ background: #0D631B; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; }}
                    </style>
                </head>
                <body>
                    <div class='container'>
                        <div class='header'>
                            <h1>🌱 EcoCycle</h1>
                        </div>
                        <div class='content'>
                            <p>Hola <strong>{nombre}</strong>,</p>
                            <p>{mensaje}</p>
                            <p style='margin-top: 20px; font-size: 12px; color: #666;'>
                                📎 Este correo incluye un archivo adjunto con información importante.
                            </p>
                            <p>El equipo de EcoCycle 🌱</p>
                        </div>
                    </div>
                </body>
                </html>"
            };

            mailMessage.To.Add(new MailAddress(email, nombre));

            // 🔥 ADJUNTAR EL ARCHIVO PDF
            if (!string.IsNullOrEmpty(rutaAdjunto) && File.Exists(rutaAdjunto))
            {
                var attachment = new Attachment(rutaAdjunto);
                mailMessage.Attachments.Add(attachment);
                Console.WriteLine($"✅ Archivo adjunto: {Path.GetFileName(rutaAdjunto)}");
            }
            else
            {
                Console.WriteLine($"⚠️ Archivo no encontrado: {rutaAdjunto}");
            }

            await client.SendMailAsync(mailMessage);
            Console.WriteLine($"✅ Correo con adjunto enviado a {email}");
            return true;
        }
        catch (SmtpException smtpEx)
        {
            Console.WriteLine($"❌ Error SMTP: {smtpEx.Message}");
            Console.WriteLine($"   StatusCode: {smtpEx.StatusCode}");
            return false;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Error: {ex.Message}");
            return false;
        }
    }

    // Métodos existentes...
    public async Task<bool> EnviarCredencialesClienteAsync(string email, string nombre, string password, string linkAcceso)
    {
        var mensaje = $@"
            Tu cuenta ha sido creada exitosamente.
            <div class='credentials'>
                <p><strong>📧 Correo:</strong> {email}</p>
                <p><strong>🔑 Contraseña:</strong> <code style='background: #e9ecef; padding: 4px 8px; border-radius: 4px;'>{password}</code></p>
            </div>
            <p style='margin-top: 20px;'>
                <a href='{linkAcceso}' class='btn'>🔗 Iniciar Sesión</a>
            </p>
        ";

        var rutaPdf = Path.Combine(_hostEnvironment.WebRootPath ?? _hostEnvironment.ContentRootPath, "Assets", "manual_usuario.pdf");
        
        return await EnviarCorreoConAdjuntoAsync(
            email, 
            nombre, 
            "🌱 ¡Bienvenido a EcoCycle! Tus credenciales de acceso",
            mensaje,
            rutaPdf
        );
    }

    public async Task<bool> EnviarBienvenidaAsync(string email, string nombre, string password, string linkAcceso)
    {
        // Nunca se incluye la contraseña en el correo de bienvenida:
        // el usuario ya la eligió al registrarse y enviarla en texto plano es inseguro.
        var mensaje = $@"
            Bienvenido a EcoCycle. Tu cuenta fue creada exitosamente.
            <div class='credentials'>
                <p><strong>📧 Correo:</strong> {email}</p>
            </div>
            <p style='margin-top: 20px;'>
                <a href='{linkAcceso}' class='btn'>🔗 Iniciar Sesión</a>
            </p>
        ";

        var rutaPdf = Path.Combine(_hostEnvironment.WebRootPath ?? _hostEnvironment.ContentRootPath, "Assets", "manual_usuario.pdf");
        
        return await EnviarCorreoConAdjuntoAsync(
            email, 
            nombre, 
            "🌱 ¡Bienvenido a EcoCycle! Tus credenciales de acceso",
            mensaje,
            rutaPdf
        );
    }

    // Método privado original (se mantiene pero ahora usa el nuevo método)
    private async Task<bool> EnviarCorreoAsync(string email, string nombre, string password, string linkAcceso, string asunto)
    {
        var mensaje = $@"
            Hola <strong>{nombre}</strong>,
            <p>Tu cuenta ha sido creada exitosamente.</p>
            <div class='credentials'>
                <p><strong>📧 Correo:</strong> {email}</p>
                <p><strong>🔑 Contraseña:</strong> <code style='background: #e9ecef; padding: 4px 8px; border-radius: 4px;'>{password}</code></p>
            </div>
            <p style='margin-top: 20px;'>
                <a href='{linkAcceso}' class='btn'>🔗 Iniciar Sesión</a>
            </p>
            <p style='margin-top: 20px; font-size: 12px; color: #666;'>
                ⚠️ Te recomendamos cambiar tu contraseña después del primer inicio de sesión.
            </p>
        ";

        var rutaPdf = Path.Combine(_hostEnvironment.WebRootPath ?? _hostEnvironment.ContentRootPath, "Assets", "manual_usuario.pdf");
        
        return await EnviarCorreoConAdjuntoAsync(email, nombre, asunto, mensaje, rutaPdf);
    }
}
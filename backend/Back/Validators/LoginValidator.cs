using Back.Models.DTOs.Request;
using FluentValidation;

namespace Back.Validators;

public class LoginRequestValidator : AbstractValidator<LoginRequest>
{
    public LoginRequestValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("El email es obligatorio")
            .EmailAddress().WithMessage("Formato de email no válido");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("La contraseña es obligatoria");
    }
}
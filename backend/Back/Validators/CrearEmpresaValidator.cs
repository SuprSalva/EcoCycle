using FluentValidation;
using Back.DTOs.Request;

namespace Back.Validators;

public class CrearEmpresaValidator : AbstractValidator<CrearEmpresaRequest>
{
    public CrearEmpresaValidator()
    {
        RuleFor(x => x.Nombre).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Rfc).NotEmpty().Length(12, 13);
    }
}
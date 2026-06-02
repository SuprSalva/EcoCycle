namespace Back.Helpers;

public static class NivelHelper
{
    public static (string Nivel, int Meta, int Faltantes) CalcularNivel(int totalBotellas)
    {
        if (totalBotellas < 20) return ("Bronce", 20, 20 - totalBotellas);
        if (totalBotellas < 50) return ("Plata", 50, 50 - totalBotellas);
        return ("Oro", 100, 100 > totalBotellas ? 100 - totalBotellas : 0);
    }
}

namespace Back.Wrappers;

public class ApiResponse<T>
{
    public bool   Suceso  { get; set; }
    public string Message { get; set; } = string.Empty;
    public T?     Data    { get; set; }
    public object? Errors { get; set; }

    public static ApiResponse<T> Ok(T data, string message = "Operación realizada correctamente")
        => new() { Suceso = true, Message = message, Data = data };

    public static ApiResponse<T> Fail(string message, object? errors = null)
        => new() { Suceso = false, Message = message, Errors = errors };
}
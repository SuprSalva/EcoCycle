namespace Back.Models.DTOs.Response;

public class ApiResponse<T>
{
    public bool Suceso { get; set; }
    public string Message { get; set; } = string.Empty;
    public T? Data { get; set; }
    public List<string>? Errors { get; set; }

    public static ApiResponse<T> Success(T data, string message = "Operación exitosa")
    {
        return new ApiResponse<T>
        {
            Suceso = true,
            Message = message,
            Data = data
        };
    }

    public static ApiResponse<T> Fail(string message, List<string>? errors = null)
    {
        return new ApiResponse<T>
        {
            Suceso = false,
            Message = message,
            Errors = errors
        };
    }
}
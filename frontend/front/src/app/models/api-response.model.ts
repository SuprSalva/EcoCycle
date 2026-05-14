export interface ApiResponse<T> {
  suceso: boolean;
  message: string;
  data: T | null;
  errors: any | null;
}

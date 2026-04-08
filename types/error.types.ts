export interface ApiError {
  message: string;
  statusCode?: number;
  error?: string;
}

export class ApiError extends Error {
  statusCode?: number;
  
  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
  }
}
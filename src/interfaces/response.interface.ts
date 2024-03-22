export interface ResponseInterface<T = any> {
    code: number;
    message: string;
    success: boolean;
    data: T;
  }
  
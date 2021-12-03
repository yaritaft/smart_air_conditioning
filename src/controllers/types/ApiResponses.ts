export type ApiResponse<T> = ApiMessageResponse | ApiDataResponse<T> | ApiErrorResponse;

export interface ApiErrorResponse {
  result: "error";
  message?: string;
  data?: any;
  error?: Error;
}

export interface ApiMessageResponse {
  result: "success";
  message: string;
}

export interface ApiDataResponse<T> {
  result: "success";
  data: T;
}

export interface ApiDataResponsePaginated<T> extends ApiDataResponse<T[]> {
  size: number;
  totalCount: number;
  offset: number;
  nextUrl?: string;
}

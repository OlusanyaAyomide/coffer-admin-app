import type { AxiosError } from "axios";

export type ApiErrorResponse = {
  message: Array<string>;
  error: string;
  statusCode: number;
};

export type QueryError = AxiosError<ApiErrorResponse>;

export type PaginationType = {
  total: number;
  page: number;
  limit: number;
  total_page: number;
  total_pages?: number;
  totalPages?: number;
  has_next_page: boolean;
  has_previous_page: boolean;
};

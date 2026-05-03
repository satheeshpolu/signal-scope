import type { HttpError } from '@/lib/http/types';
import axios from 'axios';

export class HttpErrorHandler {
  static normalize(err: unknown): HttpError {
    if (axios.isAxiosError(err)) {
      if (err.response) {
        return {
          status: err.response.status,
          error: err.response.statusText ?? 'HttpError',
          message: (err.response.data as { msg?: string })?.msg ?? err.message,
          details: err.response.data,
        };
      }
      // Network error or timeout — no response
      return {
        status: 0,
        error: 'NetworkError',
        message: err.message ?? 'Network request failed',
      };
    }

    if (err instanceof Error) {
      return { status: 0, error: err.name, message: err.message };
    }

    return { status: 0, error: 'UnknownError', message: String(err) };
  }
}

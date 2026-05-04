import { describe, it, expect } from 'vitest';
import axios from 'axios';
import { HttpErrorHandler } from './HttpErrorHandler';

describe('HttpErrorHandler.normalize', () => {
  it('handles 4xx response', () => {
    const err = new axios.AxiosError('Not Found', '404', undefined, undefined, {
      status: 404,
      statusText: 'Not Found',
      data: { msg: 'Symbol not found' },
      headers: {},
      config: {} as never,
    });
    const result = HttpErrorHandler.normalize(err);
    expect(result.status).toBe(404);
    expect(result.message).toBe('Symbol not found');
  });

  it('handles 5xx response', () => {
    const err = new axios.AxiosError('Server Error', '500', undefined, undefined, {
      status: 500,
      statusText: 'Internal Server Error',
      data: {},
      headers: {},
      config: {} as never,
    });
    const result = HttpErrorHandler.normalize(err);
    expect(result.status).toBe(500);
    expect(result.error).toBe('Internal Server Error');
  });

  it('handles network error (no response)', () => {
    const err = new axios.AxiosError('Network Error');
    const result = HttpErrorHandler.normalize(err);
    expect(result.status).toBe(0);
    expect(result.error).toBe('NetworkError');
  });

  it('handles plain Error', () => {
    const result = HttpErrorHandler.normalize(new Error('Something failed'));
    expect(result.status).toBe(0);
    expect(result.message).toBe('Something failed');
  });

  it('handles unknown thrown value', () => {
    const result = HttpErrorHandler.normalize('oops');
    expect(result.error).toBe('UnknownError');
    expect(result.message).toBe('oops');
  });
});

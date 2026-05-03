import axios from "axios";
import type { AxiosInstance } from "axios";
import { HttpErrorHandler } from "@/lib/http/HttpErrorHandler";
import type { HttpError } from "@/lib/http/types";

export type { HttpError };

export class HttpClient {
  private static instance: HttpClient;
  private readonly ax: AxiosInstance;

  private constructor(baseURL: string) {
    this.ax = axios.create({ baseURL });
  }

  static getInstance(): HttpClient {
    if (!HttpClient.instance) {
      HttpClient.instance = new HttpClient("https://api.binance.com");
    }
    return HttpClient.instance;
  }

  async get<T>(path: string, params?: Record<string, unknown>): Promise<T> {
    try {
      const res = await this.ax.get<T>(path, { params });
      return res.data;
    } catch (err) {
      throw HttpErrorHandler.normalize(err);
    }
  }
}

export const httpClient = HttpClient.getInstance();

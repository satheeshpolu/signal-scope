export interface HttpError {
  status: number; // 0 = network/offline
  error: string;
  message: string;
  details?: unknown;
}

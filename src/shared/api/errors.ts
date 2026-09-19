import type { ErrorEnvelope } from '../types';

export class ApiError extends Error {
  readonly status: number;
  readonly envelope: ErrorEnvelope;

  constructor(envelope: ErrorEnvelope, status: number) {
    super(envelope.error.message);
    this.name = 'ApiError';
    this.status = status;
    this.envelope = envelope;
  }

  get code() {
    return this.envelope.error.code;
  }

  get retryable() {
    return this.envelope.error.retryable;
  }
}

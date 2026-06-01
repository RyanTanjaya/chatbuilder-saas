// Pulls per-field error arrays out of an axios error, mapping the zod
// flatten() shape the server returns. Falls back to a flat top-level message.
import { AxiosError } from 'axios';

export type FieldErrors = Record<string, string[]>;

export interface NormalisedError {
  message: string | null; // top-level message (login failures, network errors, etc.)
  fields: FieldErrors; // per-input messages for inline rendering
}

export function normaliseError(err: unknown): NormalisedError {
  if (err instanceof AxiosError) {
    const data = err.response?.data;
    if (data && typeof data === 'object' && 'error' in data) {
      const e = (data as { error: unknown }).error;
      if (typeof e === 'string') return { message: e, fields: {} };
      if (e && typeof e === 'object') return { message: null, fields: e as FieldErrors };
    }
    return { message: err.message, fields: {} };
  }
  return { message: 'Something went wrong. Please try again.', fields: {} };
}

export function firstFieldError(fields: FieldErrors, key: string): string | undefined {
  return fields[key]?.[0];
}

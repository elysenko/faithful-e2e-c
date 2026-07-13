import { HttpErrorResponse } from '@angular/common/http';

export interface ParsedFormError {
  /** Human-readable summary suitable for a form-level banner. */
  message: string | null;
  /** Per-field messages keyed by control name (e.g. { title: 'Required' }). */
  fields: Record<string, string> | null;
}

/**
 * Translate a backend validation error into a user-facing message plus a map of
 * field → message. Handles the API's central-error-handler shape
 * `{ error, fields }` as well as NestJS-style `{ message: string | string[] }`
 * as a fallback, so callers can render inline field errors instead of silently
 * swallowing the response.
 */
export function parseFormError(err: unknown): ParsedFormError {
  const body = (err as HttpErrorResponse | null)?.error;
  if (!body || typeof body !== 'object') {
    return { message: 'Something went wrong. Please try again.', fields: null };
  }

  const rec = body as Record<string, unknown>;

  let fields: Record<string, string> | null = null;
  const fieldsRaw = rec['fields'];
  if (fieldsRaw && typeof fieldsRaw === 'object') {
    fields = {};
    for (const [key, val] of Object.entries(fieldsRaw as Record<string, unknown>)) {
      fields[key] = Array.isArray(val) ? String(val[0]) : String(val);
    }
  }

  const rawMessage = rec['error'] ?? rec['message'];
  const message = Array.isArray(rawMessage)
    ? rawMessage.join(', ')
    : typeof rawMessage === 'string'
      ? rawMessage
      : 'Please correct the highlighted fields.';

  return { message, fields };
}

import { describe, expect, it } from 'vitest';
import { formStatusClass } from './FormResponse';

describe('formStatusClass', () => {
  it('returns init for idle state with no errors', () => {
    expect(formStatusClass('idle', false)).toBe('init');
    expect(formStatusClass('idle')).toBe('init');
  });

  it('returns invalid for idle state with errors', () => {
    expect(formStatusClass('idle', true)).toBe('invalid');
  });

  it('returns submitting when submitting regardless of errors', () => {
    expect(formStatusClass('submitting', false)).toBe('submitting');
    expect(formStatusClass('submitting', true)).toBe('submitting');
  });

  it('returns sent for demo-success regardless of errors', () => {
    expect(formStatusClass('demo-success', false)).toBe('sent');
    expect(formStatusClass('demo-success', true)).toBe('sent');
  });

  it('returns failed for demo-error regardless of errors', () => {
    expect(formStatusClass('demo-error', false)).toBe('failed');
    expect(formStatusClass('demo-error', true)).toBe('failed');
  });

  it('falls back to init or invalid for unknown statuses', () => {
    expect(formStatusClass('unknown', false)).toBe('init');
    expect(formStatusClass('unknown', true)).toBe('invalid');
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';

const { signInWithPasswordMock, redirectMock } = vi.hoisted(() => ({
  signInWithPasswordMock: vi.fn(),
  redirectMock: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  }),
}));

vi.mock('@/lib/supabase/server', () => ({
  createSupabaseServerClient: vi.fn(async () => ({
    auth: { signInWithPassword: signInWithPasswordMock },
  })),
}));

vi.mock('next/navigation', () => ({ redirect: redirectMock }));

import { vendorReviewSignIn } from '../src/app/vendor/login/review/actions';

function formData(fields: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(fields)) fd.set(key, value);
  return fd;
}

describe('vendorReviewSignIn', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.APP_REVIEW_VENDOR_EMAIL = 'reviewer@vintagefindr.de';
  });

  it('rejects an email that does not match the allowlisted reviewer address without calling Supabase', async () => {
    const result = await vendorReviewSignIn(
      {},
      formData({ email: 'someone-else@example.com', password: 'whatever' })
    );

    expect(result).toEqual({ error: 'E-Mail oder Passwort ist falsch' });
    expect(signInWithPasswordMock).not.toHaveBeenCalled();
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it('rejects a correct email with a wrong password without redirecting', async () => {
    signInWithPasswordMock.mockResolvedValue({ data: { user: null }, error: { message: 'Invalid login' } });

    const result = await vendorReviewSignIn(
      {},
      formData({ email: 'reviewer@vintagefindr.de', password: 'wrong-password' })
    );

    expect(result).toEqual({ error: 'E-Mail oder Passwort ist falsch' });
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it('redirects to the vendor dashboard on correct email and password', async () => {
    signInWithPasswordMock.mockResolvedValue({ data: { user: { id: 'user-id' } }, error: null });

    await expect(
      vendorReviewSignIn({}, formData({ email: 'reviewer@vintagefindr.de', password: 'correct-password' }))
    ).rejects.toThrow('NEXT_REDIRECT:/vendor/dashboard');

    expect(redirectMock).toHaveBeenCalledWith('/vendor/dashboard');
  });

  it('rejects when APP_REVIEW_VENDOR_EMAIL is not configured at all', async () => {
    delete process.env.APP_REVIEW_VENDOR_EMAIL;

    const result = await vendorReviewSignIn(
      {},
      formData({ email: 'reviewer@vintagefindr.de', password: 'whatever' })
    );

    expect(result).toEqual({ error: 'E-Mail oder Passwort ist falsch' });
    expect(signInWithPasswordMock).not.toHaveBeenCalled();
  });
});

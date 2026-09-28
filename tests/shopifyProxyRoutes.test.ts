import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const { requireVendorAuthMock } = vi.hoisted(() => ({
  requireVendorAuthMock: vi.fn(),
}));

vi.mock('@/lib/auth/session', () => ({
  requireVendorAuth: requireVendorAuthMock,
}));

import { POST as resyncPOST } from '../src/app/api/shopify-resync/route';
import { POST as disconnectPOST } from '../src/app/api/shopify-disconnect/route';

const originalFetch = global.fetch;
const originalEnv = process.env.SHOPIFY_APP_URL;

describe.each([
  { name: 'shopify-resync', handler: resyncPOST, upstreamPath: 'resync', errorMessage: 'Synchronisierung fehlgeschlagen' },
  { name: 'shopify-disconnect', handler: disconnectPOST, upstreamPath: 'disconnect', errorMessage: 'Trennen der Verbindung fehlgeschlagen' },
])('$name route', ({ handler, upstreamPath, errorMessage }) => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireVendorAuthMock.mockResolvedValue({ vendor: { id: 'vendor-123' } });
    process.env.SHOPIFY_APP_URL = 'https://connect.vintagefindr.de';
  });

  afterEach(() => {
    global.fetch = originalFetch;
    if (originalEnv === undefined) delete process.env.SHOPIFY_APP_URL;
    else process.env.SHOPIFY_APP_URL = originalEnv;
  });

  it('returns 500 and never calls fetch when SHOPIFY_APP_URL is missing', async () => {
    delete process.env.SHOPIFY_APP_URL;
    global.fetch = vi.fn();

    const response = await handler();
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe('SHOPIFY_APP_URL ist nicht konfiguriert');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('proxies an upstream error response with its status and message intact', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: 'Shopify not connected' }),
    }) as unknown as typeof fetch;

    const response = await handler();
    const body = await response.json();

    expect(global.fetch).toHaveBeenCalledWith(
      `https://connect.vintagefindr.de/api/${upstreamPath}/vendor-123`,
      { method: 'POST' }
    );
    expect(response.status).toBe(400);
    expect(body.error).toBe('Shopify not connected');
  });

  it('returns 502 with a translated error when the upstream request throws (network failure)', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('fetch failed')) as unknown as typeof fetch;

    const response = await handler();
    const body = await response.json();

    expect(response.status).toBe(502);
    expect(body.error).toBe('Verbindung zur Shopify-App fehlgeschlagen');
  });

  it('returns 502 with the translated error even when upstream returns a non-JSON body (e.g. an HTML error page)', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => {
        throw new SyntaxError('Unexpected token < in JSON');
      },
    }) as unknown as typeof fetch;

    const response = await handler();
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.error).toBe(errorMessage);
  });
});

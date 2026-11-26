import { describe, it, expect } from 'vitest';
import { withUtm } from '../src/lib/utm';

describe('withUtm', () => {
  it('adds UTM parameters to a plain shop URL', () => {
    const out = new URL(withUtm('https://shop.example.com/products/carhartt-jacke'));
    expect(out.searchParams.get('utm_source')).toBe('vintagefindr');
    expect(out.searchParams.get('utm_medium')).toBe('referral');
    expect(out.searchParams.get('utm_campaign')).toBe('product_click');
    expect(out.pathname).toBe('/products/carhartt-jacke');
  });

  it('keeps existing query params and vendor-set UTM values', () => {
    const out = new URL(withUtm('https://shop.example.com/p?variant=42&utm_source=mine'));
    expect(out.searchParams.get('variant')).toBe('42');
    expect(out.searchParams.get('utm_source')).toBe('mine');
    expect(out.searchParams.get('utm_medium')).toBe('referral');
  });

  it('leaves Awin deeplinks untouched', () => {
    const awin = 'https://www.awin1.com/pclick.php?p=1&a=2&m=3';
    expect(withUtm(awin)).toBe(awin);
  });

  it('passes through unparseable or non-http URLs', () => {
    expect(withUtm('not a url')).toBe('not a url');
    expect(withUtm('mailto:a@b.de')).toBe('mailto:a@b.de');
  });
});

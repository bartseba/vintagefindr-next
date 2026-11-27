import { describe, it, expect } from 'vitest';
import { formatPrice } from '../src/lib/formatPrice';

const nbsp = (s: string) => s.replace(/ /g, ' ');

describe('formatPrice', () => {
  it('always shows two decimals with the euro sign after the amount', () => {
    expect(nbsp(formatPrice(70.9))).toBe('70,90 €');
    expect(nbsp(formatPrice(55))).toBe('55,00 €');
    expect(nbsp(formatPrice(1250.5))).toBe('1.250,50 €');
  });
  it('handles missing values and unknown currencies', () => {
    expect(nbsp(formatPrice(undefined))).toBe('0,00 €');
    expect(nbsp(formatPrice(4.9, 'XYZ1'))).toBe('4,90 XYZ1');
  });
});

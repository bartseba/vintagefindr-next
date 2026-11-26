import { describe, it, expect } from 'vitest';
import {
  fromUiState,
  isSavable,
  parseSavedSearchInput,
  pickNewHits,
  savedSearchKey,
  toAlgoliaParams,
} from '../src/lib/savedSearch';

describe('fromUiState / toAlgoliaParams', () => {
  it('turns query, refinements and price range into Algolia params', () => {
    const saved = fromUiState(
      {
        query: '  carhartt jacke ',
        refinementList: { size: ['L', 'M'], brand: ['Carhartt'], color: ['blau'] },
        range: { price: ':80' },
      },
      { resultPath: '/vintage?q=carhartt%20jacke' }
    );

    expect(saved.query).toBe('carhartt jacke');
    expect(saved.refinements).toEqual({ size: ['L', 'M'], brand: ['Carhartt'] }); // unknown attrs dropped
    expect(saved.price_min).toBeNull();
    expect(saved.price_max).toBe(80);
    expect(saved.label).toBe('carhartt jacke · Carhartt · L/M · bis 80 €');

    expect(toAlgoliaParams(saved)).toEqual({
      query: 'carhartt jacke',
      facetFilters: [['brand:Carhartt'], ['size:L', 'size:M']],
      numericFilters: ['price<=80'],
    });
  });

  it('keeps the page scope of hub and brand pages', () => {
    const saved = fromUiState(
      {},
      {
        resultPath: '/vintage/jacken',
        baseFilters: 'category:"jacken"',
        baseFacetFilters: [['brand:Carhartt']],
        pageLabel: 'Vintage Jacken',
      }
    );
    expect(saved.label).toBe('Vintage Jacken');
    expect(toAlgoliaParams(saved)).toEqual({
      query: '',
      facetFilters: [['brand:Carhartt']],
      filters: 'category:"jacken"',
    });
  });
});

describe('isSavable', () => {
  it('needs a query, a refinement, a price or a page scope', () => {
    expect(isSavable({})).toBe(false);
    expect(isSavable({ query: '   ' })).toBe(false);
    expect(isSavable({ query: 'levis' })).toBe(true);
    expect(isSavable({ refinementList: { size: ['L'] } })).toBe(true);
    expect(isSavable({}, { baseFilters: 'category:"jacken"' })).toBe(true);
  });
});

describe('parseSavedSearchInput', () => {
  it('rejects external result links', () => {
    expect(parseSavedSearchInput({ result_path: 'https://evil.example' })).toBeNull();
    expect(parseSavedSearchInput({ result_path: '//evil.example' })).toBeNull();
  });

  it('sanitises refinements and keeps only known attributes', () => {
    const parsed = parseSavedSearchInput({
      label: 'x',
      query: 'levis',
      refinements: { size: ['W32', 5, ''], evil: ['x'] },
      price_max: 'abc',
      result_path: '/vintage?q=levis',
    });
    expect(parsed).toMatchObject({ query: 'levis', refinements: { size: ['W32'] }, price_max: null });
  });
});

describe('savedSearchKey', () => {
  it('treats the same search with different order/case as a duplicate', () => {
    const base = { price_min: null, price_max: null, base_filters: null, base_facet_filters: [] };
    const a = savedSearchKey({ ...base, query: 'Carhartt', refinements: { size: ['M', 'L'] } });
    const b = savedSearchKey({ ...base, query: 'carhartt ', refinements: { size: ['L', 'M'] } });
    expect(a).toBe(b);
  });
});

describe('pickNewHits', () => {
  const since = '2026-11-26T06:00:00Z';
  const hit = (id: string, created_at: string, is_active = true) => ({ objectID: id, created_at, is_active });

  it('keeps only active items listed after the last notification, newest first', () => {
    const result = pickNewHits(
      [
        hit('old', '2026-11-25T10:00:00Z'),
        hit('new1', '2026-11-26T07:00:00Z'),
        hit('sold', '2026-11-26T08:00:00Z', false),
        hit('new2', '2026-11-26T09:00:00Z'),
      ],
      since
    );
    expect(result.map((h) => h.objectID)).toEqual(['new2', 'new1']);
  });

  it('caps the number of items per search', () => {
    const many = Array.from({ length: 10 }, (_, i) => hit(`n${i}`, `2026-11-26T1${i}:00:00Z`));
    expect(pickNewHits(many, since, 6)).toHaveLength(6);
  });
});

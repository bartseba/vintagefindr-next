import { describe, it, expect, vi } from 'vitest';

vi.mock('server-only', () => ({}));

import { runSearchAlerts, type SearchAlertDeps } from '../src/lib/searchAlerts';
import { buildSearchAlertEmail } from '../src/lib/email/searchAlertEmail';
import type { SavedSearchRow } from '../src/lib/savedSearch';

const NOW = new Date('2026-11-27T06:00:00Z');

function search(id: string, user_id: string, query: string): SavedSearchRow {
  return {
    id,
    user_id,
    label: query,
    query,
    refinements: {},
    price_min: null,
    price_max: null,
    base_filters: null,
    base_facet_filters: [],
    result_path: `/vintage?q=${encodeURIComponent(query)}`,
    is_active: true,
    unsubscribe_token: `00000000-0000-4000-8000-00000000000${id}`,
    last_notified_at: '2026-11-26T06:00:00Z',
    created_at: '2026-11-20T06:00:00Z',
  };
}

function makeDeps(overrides: Partial<SearchAlertDeps> = {}) {
  const sent: { to: string; subject: string }[] = [];
  const marked: string[][] = [];
  const deps: SearchAlertDeps = {
    siteUrl: 'https://vintagefindr.de',
    now: () => NOW,
    loadActiveSearches: async () => [search('1', 'u1', 'carhartt'), search('2', 'u1', 'levis'), search('3', 'u2', 'barbour')],
    getUserEmail: async (id) => `${id}@example.com`,
    searchNewest: async ({ query }) =>
      query === 'barbour'
        ? [{ objectID: 'old', title: 'Alt', created_at: '2026-11-20T00:00:00Z', is_active: true }]
        : [{ objectID: `${query}-new`, title: `${query} Jacke`, created_at: '2026-11-26T20:00:00Z', is_active: true, price: 59 }],
    sendEmail: async (mail) => {
      sent.push({ to: mail.to, subject: mail.subject });
    },
    markNotified: async (ids) => {
      marked.push(ids);
    },
    ...overrides,
  };
  return { deps, sent, marked };
}

describe('runSearchAlerts', () => {
  it('sends one digest per user and only for searches with new items', async () => {
    const { deps, sent, marked } = makeDeps();
    const result = await runSearchAlerts(deps);

    expect(sent).toEqual([{ to: 'u1@example.com', subject: '2 neue Vintage-Teile für deine Such-Alerts' }]);
    expect(marked).toEqual([['1', '2']]);
    expect(result).toMatchObject({ searches: 3, searchesWithNewHits: 2, usersEmailed: 1, failures: [] });
  });

  it('does not advance last_notified_at when sending fails', async () => {
    const { deps, marked } = makeDeps({
      sendEmail: async () => {
        throw new Error('Resend 500');
      },
    });
    const result = await runSearchAlerts(deps);
    expect(marked).toEqual([]);
    expect(result.failures).toEqual([{ userId: 'u1', reason: 'Resend 500' }]);
  });

  it('skips a search whose Algolia query fails instead of aborting the run', async () => {
    const { deps, sent } = makeDeps({
      searchNewest: async ({ query }) => {
        if (query === 'carhartt') throw new Error('algolia down');
        return [{ objectID: 'x', title: 'Levis', created_at: '2026-11-26T20:00:00Z', is_active: true }];
      },
    });
    const result = await runSearchAlerts(deps);
    expect(result.searchesWithNewHits).toBe(2); // levis (u1) + barbour (u2)
    expect(sent.map((s) => s.to).sort()).toEqual(['u1@example.com', 'u2@example.com']);
  });

  it('dry run sends nothing and updates nothing', async () => {
    const { deps, sent, marked } = makeDeps();
    const result = await runSearchAlerts(deps, { dryRun: true });
    expect(sent).toEqual([]);
    expect(marked).toEqual([]);
    expect(result.preview).toHaveLength(1);
    expect(result.preview[0].searches.map((s) => s.label)).toEqual(['carhartt', 'levis']);
  });
});

describe('buildSearchAlertEmail', () => {
  it('escapes item titles and links each item through /go and the unsubscribe link', () => {
    const email = buildSearchAlertEmail(
      [
        {
          label: '<script>x</script>',
          resultUrl: 'https://vintagefindr.de/vintage?q=a',
          unsubscribeUrl: 'https://vintagefindr.de/api/saved-searches/unsubscribe?token=t',
          hits: [{ objectID: 'p1', id: 'p1', title: 'Jacke "<b>"', price: 59, currency: 'EUR', size: 'L' }],
        },
      ],
      'https://vintagefindr.de'
    );
    expect(email.html).not.toContain('<script>x</script>');
    expect(email.html).toContain('&lt;script&gt;');
    expect(email.html).toContain('Jacke &quot;&lt;b&gt;&quot;');
    expect(email.html).toContain('https://vintagefindr.de/go/p1');
    expect(email.html).toContain('/api/saved-searches/unsubscribe?token=t');
    expect(email.subject).toBe('Neu für „<script>x</script>“: 1 Teil');
  });
});

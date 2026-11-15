import {describe, expect, it} from 'vitest';
import {sitemapXML} from '@/lib/sitemap';

describe('public sitemap URLs', () => {
  it('uses the published origin and deduplicates paths without invented dates', () => {
    const xml = sitemapXML('https://synergylabs.lovable.app', [{path:'/'}, {path:'/planner'}, {path:'/planner'}]);
    expect(xml.match(/<loc>/g)).toHaveLength(2);
    expect(xml).toContain('<loc>https://synergylabs.lovable.app/planner</loc>');
    expect(xml).not.toContain('<lastmod>');
  });
  it('rejects external and query-bearing paths', () => {
    expect(() => sitemapXML('https://synergylabs.lovable.app', [{path:'//other.example'}])).toThrow('Invalid sitemap path');
    expect(() => sitemapXML('https://synergylabs.lovable.app', [{path:'/planner?private=1'}])).toThrow('Invalid sitemap path');
  });
});
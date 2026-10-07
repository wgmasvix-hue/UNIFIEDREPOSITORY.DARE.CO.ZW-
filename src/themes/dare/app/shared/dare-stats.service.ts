import {
  inject,
  Injectable,
} from '@angular/core';
import {
  forkJoin,
  Observable,
  of,
} from 'rxjs';
import {
  catchError,
  map,
  switchMap,
} from 'rxjs/operators';
import { environment } from 'src/environments/environment';

import { DspaceRestService } from '../../../../app/core/dspace-rest/dspace-rest.service';

/**
 * Repository metrics for the DARE statistics band.
 *
 * Every field is `number | null`. `null` means "the API did not answer", which
 * the template renders as an em dash rather than a fabricated figure. Nothing
 * in this model is ever a hardcoded fallback count.
 */
export interface DareStats {
  items: number | null;
  communities: number | null;
  collections: number | null;
  fullText: number | null;
}

/** A minimal, render-safe projection of a DSpace item. */
export interface DareItemSummary {
  uuid: string;
  handle: string;
  title: string;
  authors: string[];
  date: string;
  type: string;
  abstract: string;
  /** First image bitstream thumbnail, when the item has one. */
  thumbnail?: string;
}

/** A minimal, render-safe projection of a community (an institution/area). */
export interface DareCommunitySummary {
  uuid: string;
  name: string;
  handle: string;
  description: string;
  /**
   * Number of items deposited in the community, or `null` when DSpace did not
   * report one. Never substituted with `0`: "no items" and "count unavailable"
   * are different statements and the UI must not conflate them.
   */
  itemCount: number | null;
}

@Injectable({ providedIn: 'root' })
export class DareStatsService {

  protected rest = inject(DspaceRestService);

  /**
   * Absolute base URL of the DSpace REST API, e.g. https://host/server/api.
   *
   * `environment.rest.baseUrl` resolves to the *server* root
   * (https://unifiedrepository.dare.co.zw/server), not the HAL root. The HAL
   * root that every discovery/core endpoint hangs off is that path plus
   * `/api`, so it must be appended explicitly — omitting it yields a 404.
   */
  protected get base(): string {
    return `${environment.rest.baseUrl.replace(/\/$/, '')}/api`;
  }

  /**
   * Fetch the four institutional metrics.
   *
   * Endpoints verified against DSpace 9.3 on this installation:
   *   - discover/search/objects?dsoType=ITEM      -> total published items
   *   - core/communities                           -> top-level communities
   *   - core/collections                           -> collections
   *   - ...f.has_content_in_original_bundle=true  -> items that carry files
   *
   * Each request degrades independently: one failing endpoint yields `null`
   * for its own metric rather than blanking the whole band.
   */
  getStats(): Observable<DareStats> {
    return forkJoin({
      items: this.count(this.discover('objects', { dsoType: 'ITEM', size: '1' }), true),
      communities: this.count(this.hal('core/communities', { size: '1' }), false),
      collections: this.count(this.hal('core/collections', { size: '1' }), false),
      fullText: this.count(
        this.discover('objects', {
          configuration: 'default',
          scope: '',
          'f.has_content_in_original_bundle': 'true,equals',
          size: '1',
        }),
        true,
      ),
    });
  }

  /**
   * Most recently issued items, newest first.
   *
   * @param limit maximum number of items
   * @param query optional free-text query; empty means the whole repository
   * @param order sort field. Defaults to issue date descending, which is what
   *              the homepage "latest" feeds want.
   */
  getRecentItems(
    limit = 5,
    query = '',
    order = 'dc.date.issued,DESC',
  ): Observable<DareItemSummary[]> {
    return this.rest
      .get(this.discover('objects', {
        configuration: 'default',
        scope: '',
        query,
        sort: order,
        size: String(limit),
      }))
      .pipe(
        map((res) => this.mapObjects(res)),
        catchError(() => of([] as DareItemSummary[])),
      );
  }

  /**
   * Top-level communities, ordered by the repository's own listing.
   * These are the "institutions and research areas" shown in the editorial grid.
   *
   * Each community is requested individually so its item count can be reported.
   * A per-community failure costs only that row's count, never the whole list.
   */
  getCommunities(limit = 12): Observable<DareCommunitySummary[]> {
    return this.rest
      .get(this.hal('core/communities', { size: String(limit) }))
      .pipe(
        switchMap((res) => {
          const list = res.payload?._embedded?.communities ?? [];
          if (!Array.isArray(list) || list.length === 0) {
            return of([] as DareCommunitySummary[]);
          }
          return forkJoin(list.map((c: any) => this.mapCommunity(c)));
        }),
        catchError(() => of([] as DareCommunitySummary[])),
      );
  }

  /**
   * Number of published items inside a community.
   *
   * DSpace's HAL community objects carry `archivedItemsCount`, but this
   * installation has the counter disabled and the API reports `-1` for it,
   * which means "unknown", not "none". `-1` is therefore discarded and the
   * count is read from the search index scoped to the community instead. That
   * query is authoritative because it counts what a visitor can actually find.
   */
  protected getCommunityItemCount(community: any): Observable<number | null> {
    const stored = community?.archivedItemsCount;
    if (typeof stored === 'number' && Number.isInteger(stored) && stored >= 0) {
      return of(stored);
    }
    const uuid = community?.uuid;
    if (typeof uuid !== 'string' || uuid.length === 0) {
      return of(null);
    }
    return this.rest
      .get(this.discover('objects', {
        dsoType: 'ITEM',
        scope: uuid,
        configuration: 'default',
        size: '1',
      }))
      .pipe(
        map((res) => {
          const total = res.payload?._embedded?.searchResult?.page?.totalElements;
          return typeof total === 'number' ? total : null;
        }),
        catchError(() => of(null)),
      );
  }

  /** Map one HAL community object to the render-safe projection. */
  protected mapCommunity(c: any): Observable<DareCommunitySummary> {
    return this.getCommunityItemCount(c).pipe(
      map((itemCount) => ({
        uuid: c.uuid,
        handle: c.handle,
        name: c.name ?? 'Untitled community',
        description: this.first(c, 'dc.description.abstract') ?? '',
        itemCount,
      })),
    );
  }

  /**
   * Most frequent author names across the whole index.
   *
   * NOTE: DSpace's REST API exposes no total distinct-author count (the author
   * facet is capped at 101 values per request and reports no page total), so
   * DARE surfaces leading contributors rather than inventing a total. See
   * /opt/dare-dspace-theme/COMPONENTS.md ("Statistics band") for the rationale.
   */
  getTopAuthors(limit = 8): Observable<{ label: string; count: number }[]> {
    return this.rest
      .get(`${this.base}/discover/facets/author?configuration=default&scope=&size=${limit}`)
      .pipe(
        map((res) => {
          const values = res.payload?._embedded?.values ?? [];
          return values.map((v: any) => ({
            label: v.label ?? 'Unknown',
            count: v.count ?? 0,
          }));
        }),
        catchError(() => of([] as { label: string; count: number }[])),
      );
  }

  // --- internals ---------------------------------------------------------

  protected discover(path: string, params: Record<string, string>): string {
    return `${this.base}/discover/search/${path}?${this.qs(params)}`;
  }

  protected hal(path: string, params: Record<string, string>): string {
    return `${this.base}/${path}?${this.qs(params)}`;
  }

  protected qs(params: Record<string, string>): string {
    return Object.entries(params)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&');
  }

  /**
   * Read a total from either a HAL page envelope (`payload.page.totalElements`)
   * or a discover envelope (`payload._embedded.searchResult.page.totalElements`).
   */
  protected count(url: string, isDiscover: boolean): Observable<number | null> {
    return this.rest.get(url).pipe(
      map((res) => {
        const page = isDiscover
          ? res.payload?._embedded?.searchResult?.page
          : res.payload?.page;
        const total = page?.totalElements;
        return typeof total === 'number' ? total : null;
      }),
      catchError(() => of(null)),
    );
  }

  protected mapObjects(res: any): DareItemSummary[] {
    const objects = res.payload?._embedded?.searchResult?._embedded?.objects ?? [];
    return objects
      .map((o: any) => o?._embedded?.indexableObject)
      .filter((io: any) => !!io)
      .map((io: any) => ({
        uuid: io.uuid,
        handle: io.handle,
        title: this.first(io, 'dc.title') ?? 'Untitled',
        authors: this.authors(io),
        date: this.first(io, 'dc.date.issued') ?? this.first(io, 'dc.date') ?? '',
        type: this.first(io, 'dc.type') ?? '',
        abstract: this.abstract(io),
      }));
  }

  /**
   * Author names for an item.
   *
   * DARE's index is heterogeneous: some deposits carry `dc.contributor.author`
   * (the DSpace default for `publication`) while others carry only `dc.creator`
   * (typical of records harvested from Zenodo, DataCite and similar). Reading a
   * single field silently reports "Author not recorded" for a large share of the
   * repository, so both are read, de-duplicated, and ordered with the DSpace
   * default field first.
   */
  protected authors(io: any): string[] {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const key of ['dc.contributor.author', 'dc.creator']) {
      for (const name of this.all(io, key)) {
        const clean = this.stripMarkup(name);
        if (clean.length === 0 || seen.has(clean.toLowerCase())) {
          continue;
        }
        seen.add(clean.toLowerCase());
        out.push(clean);
      }
    }
    return out;
  }

  /**
   * Abstract text for an item.
   *
   * Deposits use `dc.description.abstract` where the submitter followed the
   * DSpace form, and a bare `dc.description` otherwise. Some harvested values
   * arrive as HTML, which must not reach the page as markup.
   */
  protected abstract(io: any): string {
    for (const key of ['dc.description.abstract', 'dc.description']) {
      const value = this.first(io, key);
      const clean = value === null ? '' : this.stripMarkup(value);
      if (clean.length > 0) {
        return clean;
      }
    }
    return '';
  }

  /**
   * Flatten an HTML-bearing metadata value to readable plain text.
   *
   * Harvested records put markup in `dc.description` and `dc.contributor`
   * values. Rendering that unescaped would inject foreign markup into the page,
   * so tags are removed and the handful of entities that actually carry meaning
   * in an abstract are decoded.
   */
  protected stripMarkup(value: string): string {
    return value
      .replace(/<br\s*\/?>/gi, ' ')
      .replace(/<\/p>/gi, ' ')
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ')
      .trim();
  }

  /** First value of a Dublin Core field, or null. */
  protected first(io: any, key: string): string | null {
    const entry = io?.metadata?.[key];
    if (!entry || entry.length === 0) {
      return null;
    }
    const value = entry[0]?.value;
    return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
  }

  /** Every value of a Dublin Core field. */
  protected all(io: any, key: string): string[] {
    const entry = io?.metadata?.[key];
    if (!Array.isArray(entry)) {
      return [];
    }
    return entry
      .map((e: any) => (typeof e?.value === 'string' ? e.value.trim() : ''))
      .filter((v: string) => v.length > 0);
  }
}

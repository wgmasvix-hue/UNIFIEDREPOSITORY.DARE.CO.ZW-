import {
  Injectable,
  inject,
} from '@angular/core';
import {
  Observable,
  forkJoin,
  of,
} from 'rxjs';
import {
  catchError,
  map,
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
   */
  getCommunities(limit = 12): Observable<DareCommunitySummary[]> {
    return this.rest
      .get(this.hal('core/communities', { size: String(limit) }))
      .pipe(
        map((res) => {
          const list = res.payload?._embedded?.communities ?? [];
          return list.map((c: any) => ({
            uuid: c.uuid,
            handle: c.handle,
            name: c.name ?? 'Untitled community',
            description: this.first(c, 'dc.description.abstract') ?? '',
          }));
        }),
        catchError(() => of([] as DareCommunitySummary[])),
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
        authors: this.all(io, 'dc.contributor.author'),
        date: this.first(io, 'dc.date.issued') ?? '',
        type: this.first(io, 'dc.type') ?? '',
        abstract: this.first(io, 'dc.description.abstract') ?? '',
      }));
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
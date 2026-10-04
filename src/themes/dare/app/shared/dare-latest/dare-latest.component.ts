import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  inject,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import {
  DareItemSummary,
  DareStatsService,
} from '../dare-stats.service';

/**
 * A live list of recently issued repository items.
 *
 * Reused in two places on the homepage:
 *   - "Latest research"        (default query: most recent overall)
 *   - "African knowledge"      (query: Africa / African)
 *
 * Ordering comes from Solr via `sort=dc.date.issued,DESC`; nothing is
 * hardcoded and no item is ever promoted without a date in the index.
 */
@Component({
  selector: 'dare-latest',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, RouterLink],
  templateUrl: './dare-latest.component.html',
  styleUrls: ['./dare-latest.component.scss'],
})
export class DareLatestComponent implements OnInit {

  /** Free-text query. Empty string means "everything". */
  @Input() query = '';

  /** Maximum number of items to render. */
  @Input() limit = 5;

  /** Accessible name for the list, and optional visible heading. */
  @Input() heading = '';

  protected items: DareItemSummary[] = [];

  protected loading = true;

  private statsService = inject(DareStatsService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.statsService.getRecentItems(this.limit, this.query).subscribe((items) => {
      this.items = items;
      this.loading = false;
      this.cdr.markForCheck();
    });
  }

  protected itemLink(item: DareItemSummary): string[] {
    return ['/handle', item.handle];
  }

  /** Render at most two authors, then indicate the remainder. */
  protected authorLine(item: DareItemSummary): string {
    if (!item.authors || item.authors.length === 0) {
      return 'Author not recorded';
    }
    if (item.authors.length <= 2) {
      return item.authors.join(', ');
    }
    return `${item.authors[0]}, ${item.authors[1]} +${item.authors.length - 2}`;
  }

  protected excerpt(value: string, max = 170): string {
    if (!value) {
      return '';
    }
    const clean = value.replace(/\s+/g, ' ').trim();
    return clean.length > max ? `${clean.slice(0, max).trimEnd()}…` : clean;
  }

  protected trackByUuid(_: number, item: DareItemSummary): string {
    return item.uuid;
  }
}
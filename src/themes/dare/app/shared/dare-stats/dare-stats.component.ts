import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  inject,
} from '@angular/core';

import {
  DareStats,
  DareStatsService,
} from '../dare-stats.service';

/**
 * Institutional statistics band.
 *
 * Values come live from the DSpace REST API. While loading — or if a request
 * fails — the figure renders as an em dash rather than a placeholder number,
 * so the page can never show an invented statistic.
 */
@Component({
  selector: 'dare-stats',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dare-stats.component.html',
  styleUrls: ['./dare-stats.component.scss'],
})
export class DareStatsComponent implements OnInit {

  protected stats: DareStats | null = null;

  protected loading = true;

  private statsService = inject(DareStatsService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.statsService.getStats().subscribe((stats) => {
      this.stats = stats;
      this.loading = false;
      this.cdr.markForCheck();
    });
  }

  /** Format 350042 -> "350,042". Null/undefined renders as an em dash. */
  protected format(value: number | null | undefined): string {
    return typeof value === 'number' ? value.toLocaleString('en-GB') : '—';
  }

  protected trackByKey(_: number, item: { key: string }): string {
    return item.key;
  }

  protected get tiles(): { key: keyof DareStats; label: string; note: string }[] {
    return [
      { key: 'items', label: 'Research items', note: 'indexed records' },
      { key: 'communities', label: 'Communities', note: 'subject areas' },
      { key: 'collections', label: 'Collections', note: 'curated groupings' },
      { key: 'fullText', label: 'Full text', note: 'items with files' },
    ];
  }
}
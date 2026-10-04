import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import {
  DareCommunitySummary,
  DareStatsService,
} from '../dare-stats.service';

/**
 * "OUR COMMUNITIES" — institutions and subject areas, read live from
 * `/core/communities`. Each entry links to its DSpace community page.
 */
@Component({
  selector: 'dare-communities',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './dare-communities.component.html',
  styleUrls: ['./dare-communities.component.scss'],
})
export class DareCommunitiesComponent implements OnInit {

  protected communities: DareCommunitySummary[] = [];

  protected loading = true;

  private statsService = inject(DareStatsService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.statsService.getCommunities(12).subscribe((list) => {
      this.communities = list;
      this.loading = false;
      this.cdr.markForCheck();
    });
  }

  /** Trim a long abstract to a single editorial line. */
  protected excerpt(value: string, max = 140): string {
    if (!value) {
      return '';
    }
    const clean = value.replace(/\s+/g, ' ').trim();
    return clean.length > max ? `${clean.slice(0, max).trimEnd()}…` : clean;
  }

  protected trackByUuid(_: number, c: DareCommunitySummary): string {
    return c.uuid;
  }
}
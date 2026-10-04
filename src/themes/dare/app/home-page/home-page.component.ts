import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { HomePageComponent as BaseComponent } from '../../../../app/home-page/home-page.component';
import { ThemedSearchFormComponent } from '../../../../app/shared/search-form/themed-search-form.component';
import { SuggestionsPopupComponent } from '../../../../app/notifications/suggestions/popup/suggestions-popup.component';

import { DareStatsComponent } from '../shared/dare-stats/dare-stats.component';
import { DareExploreComponent } from '../shared/dare-explore/dare-explore.component';
import { DareCommunitiesComponent } from '../shared/dare-communities/dare-communities.component';
import { DareSourcesComponent } from '../shared/dare-sources/dare-sources.component';
import { DareLatestComponent } from '../shared/dare-latest/dare-latest.component';

/**
 * DARE editorial homepage.
 *
 * Structure (in document order, which is also the reading order):
 *   1. Hero — the primary message and the one search box that matters
 *   2. Featured research + supporting columns
 *   3. Explore the repository (seven research areas)
 *   4. Live repository statistics
 *   5. African knowledge (inverse band)
 *   6. Communities / institutions
 *   7. Open knowledge sources (provenance statement)
 *
 * Every figure, item and community is fetched from the DSpace REST API at
 * render time. Nothing on this page is a hardcoded statistic, and the DSpace
 * suggestions popup is preserved so that feature keeps working.
 */
@Component({
  selector: 'ds-themed-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss'],
  // Angular strips whitespace-only text nodes by default, which would collapse
  // the three hero <span> lines into the single accessible name
  // "DiscoverAfricanKnowledge". Preserving whitespace restores the correct
  // name (and correct copy/paste) without changing the visual line breaks,
  // which come from `display: block` on .dare-hero__line.
  preserveWhitespaces: true,
  imports: [
    DareCommunitiesComponent,
    DareExploreComponent,
    DareLatestComponent,
    DareSourcesComponent,
    DareStatsComponent,
    RouterLink,
    SuggestionsPopupComponent,
    ThemedSearchFormComponent,
    TranslateModule,
  ],
})
export class HomePageComponent extends BaseComponent {

  /** Secondary content lanes in the featured band. */
  protected readonly lanes = [
    {
      id: 'theses',
      label: 'Theses & Dissertations',
      query: 'thesis dissertation',
    },
    {
      id: 'datasets',
      label: 'New datasets',
      query: 'dataset',
    },
    {
      id: 'books',
      label: 'New books',
      query: 'book',
    },
  ];
}
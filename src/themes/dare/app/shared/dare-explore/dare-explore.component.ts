import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';
import { RouterLink } from '@angular/router';

interface DareExploreEntry {
  slug: string;
  title: string;
  blurb: string;
  /** Free-text query against the DSpace discovery index. */
  query: string;
}

/**
 * "EXPLORE THE REPOSITORY" — large typographic navigation into the seven
 * research areas DARE curates.
 *
 * WHY FREE-TEXT QUERIES: this DSpace 9.3 installation exposes only six
 * discovery facets (author, subject, dateIssued, entityType, access_status,
 * has_content_in_original_bundle). `dc.type` is NOT an indexed facet, so a
 * type-based filter returns HTTP 422. Each entry therefore uses a curated
 * free-text query, verified to return non-zero results against the live index.
 * If DARE later registers a document-type facet, replace `query` with
 * `filter: { 'f.dc.type': 'equals,<value>' }` — the template already supports
 * emitting a filter when one is present.
 */
@Component({
  selector: 'dare-explore',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './dare-explore.component.html',
  styleUrls: ['./dare-explore.component.scss'],
})
export class DareExploreComponent {

  protected readonly entries: DareExploreEntry[] = [
    {
      slug: 'research',
      title: 'Research',
      blurb: 'Peer-reviewed articles, preprints and working papers.',
      query: '',
    },
    {
      slug: 'theses',
      title: 'Theses & Dissertations',
      blurb: 'Graduate and undergraduate research from African institutions.',
      query: 'thesis dissertation',
    },
    {
      slug: 'books',
      title: 'Books',
      blurb: 'Monographs, edited volumes and scholarly books.',
      query: 'book monograph',
    },
    {
      slug: 'oer',
      title: 'Open Education',
      blurb: 'Open textbooks, teaching materials and course resources.',
      query: 'textbook education teaching',
    },
    {
      slug: 'datasets',
      title: 'Datasets',
      blurb: 'Research data, statistical series and open data resources.',
      query: 'dataset data',
    },
    {
      slug: 'african-knowledge',
      title: 'African Knowledge',
      blurb: 'Scholarship documenting Africa\'s knowledge, innovation and experience.',
      query: 'Africa African',
    },
    {
      slug: 'ai',
      title: 'AI & Machine Learning',
      blurb: 'Models, methods and African-language computing resources.',
      query: 'machine learning artificial intelligence',
    },
  ];
}
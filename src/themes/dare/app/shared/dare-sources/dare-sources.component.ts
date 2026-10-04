import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';

interface DareSource {
  name: string;
  /** What DARE draws from this network. */
  offers: string;
  /** Canonical project site — always external. */
  url: string;
}

/**
 * "OPEN KNOWLEDGE SOURCES" — the discovery networks DARE connects to.
 *
 * PROVENANCE / ATTRIBUTION POLICY (enforced by copy, not just intent):
 *   - These are third-party services. DARE does NOT host their content.
 *   - Each entry links to the provider's own site, never to a DARE-hosted copy.
 *   - Records harvested from these networks are stored as metadata plus a link
 *     back to the original, and retain the provider's licence and attribution.
 *   - This component therefore deliberately shows no DARE item counts for these
 *     sources; implying ownership would misrepresent the record.
 */
@Component({
  selector: 'dare-sources',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dare-sources.component.html',
  styleUrls: ['./dare-sources.component.scss'],
})
export class DareSourcesComponent {

  protected readonly sources: DareSource[] = [
    { name: 'Hugging Face', offers: 'Datasets, models and notebooks', url: 'https://huggingface.co' },
    { name: 'OpenAlex', offers: 'Scholarly metadata and concepts', url: 'https://openalex.org' },
    { name: 'Project Gutenberg', offers: 'Public-domain open books', url: 'https://www.gutenberg.org' },
    { name: 'arXiv', offers: 'Preprints in physics, maths and computing', url: 'https://arxiv.org' },
    { name: 'Zenodo', offers: 'Research outputs across all disciplines', url: 'https://zenodo.org' },
    { name: 'DOAJ', offers: 'Open-access journal articles', url: 'https://doaj.org' },
    { name: 'CORE', offers: 'Aggregated open-access repository content', url: 'https://core.ac.uk' },
    { name: 'OAPEN Library', offers: 'Open-access scholarly books', url: 'https://library.oapen.org' },
  ];
}
import {
  AsyncPipe,
  KeyValuePipe,
} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { MetadataMap } from '../../../../../app/core/shared/metadata.models';
import { ThemedItemAlertsComponent } from '../../../../../app/item-page/alerts/themed-item-alerts.component';
import { CollectionsComponent } from '../../../../../app/item-page/field-components/collections/collections.component';
import { ThemedFullFileSectionComponent } from '../../../../../app/item-page/full/field-components/file-section/themed-full-file-section.component';
import { FullItemPageComponent as BaseComponent } from '../../../../../app/item-page/full/full-item-page.component';
import { ThemedItemPageTitleFieldComponent } from '../../../../../app/item-page/simple/field-components/specific-field/title/themed-item-page-field.component';
import { ItemVersionsComponent } from '../../../../../app/item-page/versions/item-versions.component';
import { ItemVersionsNoticeComponent } from '../../../../../app/item-page/versions/notice/item-versions-notice.component';
import { fadeInOut } from '../../../../../app/shared/animations/fade';
import { DsoEditMenuComponent } from '../../../../../app/shared/dso-page/dso-edit-menu/dso-edit-menu.component';
import { ErrorComponent } from '../../../../../app/shared/error/error.component';
import { ThemedLoadingComponent } from '../../../../../app/shared/loading/themed-loading.component';
import { VarDirective } from '../../../../../app/shared/utils/var.directive';

/** One labelled field of the publication record. */
export interface DareItemField {
  label: string;
  values: string[];
}

/** Everything the scholarly item page renders, resolved once per item. */
export interface DareItemView {
  /** Human-readable document type, e.g. "Article" or "Dataset". */
  documentType: string | null;
  title: string;
  authors: string[];
  institution: string | null;
  /** Year of publication, extracted from the issue date when possible. */
  date: string | null;
  /** Handle and any external identifier (DOI, ISBN, ...). */
  identifiers: DareItemField[];
  abstract: string | null;
  subjects: string[];
  citation: string;
  rights: string[];
  source: string | null;
  publisherNote: string | null;
}

/**
 * EU-repo and DataCite type URIs mapped to the plain-English label a reader
 * expects. Anything unrecognised is shown as the final URI segment, which is
 * still more useful than hiding the type altogether.
 */
const TYPE_LABELS: Record<string, string> = {
  'info:eu-repo/semantics/article': 'Article',
  'info:eu-repo/semantics/book': 'Book',
  'info:eu-repo/semantics/chapter': 'Book chapter',
  'info:eu-repo/semantics/dataset': 'Dataset',
  'info:eu-repo/semantics/other': 'Research output',
  'info:eu-repo/semantics/lecture': 'Lecture',
  'info:eu-repo/semantics/preprint': 'Preprint',
  'info:eu-repo/semantics/report': 'Report',
  'info:eu-repo/semantics/conferencepaper': 'Conference paper',
  'info:eu-repo/semantics/workingpaper': 'Working paper',
  'info:eu-repo/semantics/thesis': 'Thesis',
  'info:eu-repo/semantics/image': 'Image',
  'info:eu-repo/semantics/technicaldocument': 'Technical document',
  'info:eu-repo/semantics/software': 'Software',
  'info:eu-repo/semantics/educationalresource': 'Educational resource',
  'info:eu-repo/semantics/award': 'Award',
  'info:eu-repo/semantics/chemical': 'Chemical',
  'info:eu-repo/semantics/collection': 'Collection',
  'info:eu-repo/semantics/patent': 'Patent',
};

/**
 * DARE scholarly item page.
 *
 * Replaces DSpace's default "metadata table" view with a publication-style
 * record: document type, title, authorship, provenance, identifiers, abstract,
 * subjects, files, a ready-to-paste citation, rights and source.
 *
 * Every field is derived from the item's own Dublin Core metadata. Nothing is
 * invented: a field with no value is omitted entirely rather than filled with a
 * placeholder, so the page never implies information the record does not carry.
 *
 * All DSpace capability is preserved - the edit menu, version history,
 * withdrawal alerts, the file section (so PDF and bitstream downloads keep
 * working) and the collection list are the inherited components, untouched.
 */
@Component({
  selector: 'ds-themed-full-item-page',
  templateUrl: './dare-full-item-page.component.html',
  styleUrls: ['./dare-full-item-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [fadeInOut],
  imports: [
    AsyncPipe,
    CollectionsComponent,
    DsoEditMenuComponent,
    ErrorComponent,
    ItemVersionsComponent,
    ItemVersionsNoticeComponent,
    KeyValuePipe,
    RouterLink,
    ThemedFullFileSectionComponent,
    ThemedItemAlertsComponent,
    ThemedItemPageTitleFieldComponent,
    ThemedLoadingComponent,
    TranslateModule,
    VarDirective,
  ],
})
export class FullItemPageComponent extends BaseComponent implements OnInit {

  /**
   * The publication record, or null while the item is loading or missing.
   *
   * Built in {@link ngOnInit}, not in a field initializer: the base class
   * assigns `metadata$` inside its own `ngOnInit`, and field initializers run
   * during construction, before that. Initialising here would call `.pipe()` on
   * `undefined` and the component would never render.
   */
  view$: Observable<DareItemView | null> | null = null;

  ngOnInit(): void {
    // The base `ngOnInit` is what populates `metadata$` and `itemRD$`.
    super.ngOnInit();

    this.view$ = this.metadata$.pipe(
      map((metadata: MetadataMap) => metadata ? this.buildView(metadata) : null),
    );
  }

  /**
   * Turn a raw Dublin Core map into the ordered publication record.
   *
   * @param metadata the item's metadata, as delivered by the REST API
   */
  protected buildView(metadata: MetadataMap): DareItemView {
    const rawType = this.one(metadata, 'dc.type');
    const authors = this.unique([
      ...this.many(metadata, 'dc.contributor.author'),
      ...this.many(metadata, 'dc.creator'),
    ]);
    const issued = this.one(metadata, 'dc.date.issued') ?? this.one(metadata, 'dc.date');
    const title = this.one(metadata, 'dc.title') ?? 'Untitled';

    return {
      documentType: this.humanType(rawType),
      title,
      authors,
      institution: this.one(metadata, 'dc.publisher'),
      date: issued,
      identifiers: this.identifiers(metadata),
      abstract: this.abstract(metadata),
      subjects: this.unique(this.many(metadata, 'dc.subject')),
      citation: this.buildCitation(title, authors, issued),
      rights: this.unique(this.many(metadata, 'dc.rights')),
      source: this.one(metadata, 'dc.source'),
      publisherNote: this.one(metadata, 'dc.description.notes'),
    };
  }

  /**
   * Handles and external identifiers, kept separate from the metadata list so
   * the most useful identifier leads.
   */
  protected identifiers(metadata: MetadataMap): DareItemField[] {
    const fields: DareItemField[] = [];

    const uri = this.many(metadata, 'dc.identifier.uri');
    if (uri.length > 0) {
      fields.push({ label: 'Persistent URL', values: uri });
    }

    const others = this.many(metadata, 'dc.identifier')
      .concat(this.many(metadata, 'dc.identifier.doi'))
      .filter((v) => !uri.includes(v));
    if (others.length > 0) {
      fields.push({ label: 'Identifier', values: this.unique(others) });
    }

    return fields;
  }

  /**
   * Plain-text abstract.
   *
   * DARE's index carries abstracts in `dc.description.abstract` when the
   * DSpace deposit form was used, and in `dc.description` for harvested
   * records. Harvested values frequently contain HTML, which must not be
   * injected into the page as markup.
   */
  protected abstract(metadata: MetadataMap): string | null {
    const candidates = [
      this.one(metadata, 'dc.description.abstract'),
      this.one(metadata, 'dc.description'),
    ];
    for (const candidate of candidates) {
      const clean = candidate === null ? '' : this.stripMarkup(candidate);
      if (clean.length > 0) {
        return clean;
      }
    }
    return null;
  }

  /**
   * A ready-to-paste citation, assembled from the fields a reader needs and
   * shaped after common bibliographic styles (APA-like author/date/title).
   *
   * Only present fields contribute, so the string never contains "n/a" noise,
   * and it is offered as selectable text rather than a download so it can be
   * copied straight into a paper.
   */
  protected buildCitation(title: string, authors: string[], issued: string | null): string {
    const parts: string[] = [];
    if (authors.length > 0) {
      parts.push(authors.length === 1 ? authors[0] : `${authors.slice(0, -1).join(', ')} & ${authors[authors.length - 1]}`);
    }
    const year = issued ? this.year(issued) : null;
    parts.push(year ? `(${year})` : '(n.d.)');
    parts.push(`${title}.`);
    return parts.join(' ');
  }

  /** Four-digit year from an ISO or free-text date, or null. */
  protected year(value: string): string | null {
    const match = value.match(/\b(1[0-9]{3}|2[0-9]{3})\b/);
    return match ? match[1] : null;
  }

  /** Map a stored type value to a reader-facing label. */
  protected humanType(value: string | null): string | null {
    if (value === null) {
      return null;
    }
    const direct = TYPE_LABELS[value.toLowerCase()];
    if (direct) {
      return direct;
    }
    // "Text(Article)" style values carry the readable form after the bracket.
    const bracketed = value.match(/\(([^)]+)\)/);
    if (bracketed) {
      return bracketed[1];
    }
    const tail = value.split(/[\/#:]/).pop();
    return tail && tail.length > 0 ? tail : value;
  }

  /** Flatten HTML-bearing metadata values to readable text. */
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

  /** Every non-empty value of a metadata field, as plain text. */
  protected many(metadata: MetadataMap, key: string): string[] {
    const entry = metadata?.[key];
    if (!Array.isArray(entry)) {
      return [];
    }
    return entry
      .map((v: any) => (typeof v?.value === 'string' ? this.stripMarkup(v.value) : ''))
      .filter((v: string) => v.length > 0);
  }

  /** First non-empty value of a metadata field, or null. */
  protected one(metadata: MetadataMap, key: string): string | null {
    const values = this.many(metadata, key);
    return values.length > 0 ? values[0] : null;
  }

  /** De-duplicate while preserving first-seen order. */
  protected unique(values: string[]): string[] {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const value of values) {
      const key = value.toLowerCase();
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);
      out.push(value);
    }
    return out;
  }
}

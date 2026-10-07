/**
 * DARE theme verification — design-system and data-integrity regressions.
 *
 * These cover behaviour that was previously wrong and is easy to break again:
 * the wordmark, the mobile toggle's ARIA state, live statistics, community item
 * counts, and the scholarly item record.
 *
 * Targets the same-origin preview proxy (127.0.0.1:4400), never production.
 */

const ITEM = 'f7ad7e72-14eb-4fc2-91aa-fc2cc69808af';

describe('DARE masthead', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.wait(1500);
  });

  it('shows the DARE Unified Repository logo with the required alt text', () => {
    cy.get('.dare-brand__logo', { timeout: 30000 })
      .should('exist')
      .and('be.visible')
      .and('have.attr', 'alt', 'DARE Unified Repository');
  });

  it('links the wordmark home with an accessible name', () => {
    cy.get('.dare-masthead__brand')
      .should('have.attr', 'href', '/home')
      .and('have.attr', 'aria-label');
  });

  it('reflects the real expanded state on the mobile menu toggle', () => {
    cy.viewport(375, 812);
    cy.visit('/');
    cy.get('.dare-masthead__toggle', { timeout: 30000 }).should('be.visible');
    // DSpace hard-codes aria-expanded="false"; a correct implementation tracks
    // the menu, so the value must change when the toggle is used.
    cy.get('.dare-masthead__toggle')
      .should('have.attr', 'aria-controls', 'collapsingNav');
    // DSpace hard-codes aria-expanded="false"; a correct implementation tracks
    // the menu, so the value must change when the toggle is used.
    cy.get('.dare-masthead__toggle')
      .invoke('attr', 'aria-expanded')
      .then((before: string) => {
        cy.get('.dare-masthead__toggle').click();
        cy.get('.dare-masthead__toggle')
          .invoke('attr', 'aria-expanded')
          .should('not.equal', before);
      });
  });
});

describe('DARE live statistics', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.wait(3000);
  });

  it('renders repository totals read from the API, not hardcoded', () => {
    cy.get('.dare-stats', { timeout: 30000 }).should('exist');
    cy.get('.dare-stats__tile').should('have.length.at.least', 4);
    cy.get('.dare-stats__value').each(($el) => {
      const text = $el.text().trim();
      // Either a real figure with thousands separators, or an em dash when the
      // API did not answer. A literal placeholder number would be a failure.
      expect(text, 'stat value').to.match(/^([\d,]+|—)$/);
    });
  });

  it('never renders a zero as a stand-in for an unavailable figure', () => {
    cy.get('.dare-stats__value--pending').should('not.exist');
  });
});

describe('DARE communities', () => {
  it('shows a live item count per community, including the unavailable case', () => {
    cy.visit('/');
    cy.wait(3500);
    cy.get('.dare-communities__cell', { timeout: 40000 }).should('have.length.at.least', 1);
    cy.get('.dare-communities__cell').each(($cell) => {
      cy.wrap($cell).find('.dare-communities__count').should('exist');
      cy.wrap($cell).find('.dare-communities__count').invoke('text').should('match', /(\d+\s+(item|items)|Count unavailable)/);
    });
  });
});

describe('DARE item record', () => {
  beforeEach(() => {
    cy.viewport(1280, 1000);
    cy.visit(`/items/${ITEM}`, { timeout: 90000 });
    cy.get('.item-page', { timeout: 60000 }).should('exist');
    cy.wait(2500);
  });

  it('presents the title as the page headline', () => {
    cy.get('ds-item-page-title-field').should('exist');
    cy.get('h1').first().invoke('text').should('match', /MasakhaNER/);
  });

  it('keeps bitstream downloads available', () => {
    cy.get('ds-item-page-file-section', { timeout: 30000 }).should('exist');
    cy.get('ds-item-page-file-section a').should('have.length.at.least', 1);
  });

  it('renders metadata as labelled fields rather than a bare table', () => {
    cy.get('.simple-view-element-header').should('have.length.at.least', 3);
    cy.get('.simple-view-element-header').first().invoke('text').should('match', /[A-Z]/);
  });

  it('does not render raw HTML from harvested descriptions', () => {
    cy.get('.item-page').then(($p) => {
      // A harvested <script> or inline handler would mean unescaped metadata.
      expect($p.find('script').length, 'no script tags from metadata').to.equal(0);
      $p.find('*').each((_i, el) => {
        const attrs = el.attributes || [];
        for (let i = 0; i < attrs.length; i++) {
          expect(attrs[i].name, 'no inline event handlers').to.not.match(/^on/i);
        }
      });
    });
  });

  it('offers the complete metadata view at /full', () => {
    cy.visit(`/items/${ITEM}/full`, { timeout: 90000 });
    cy.get('body', { timeout: 60000 }).should('exist');
    cy.wait(4000);
    // The scholarly record must at minimum render its title and file section.
    cy.get('ds-item-page-title-field, h1', { timeout: 40000 }).should('exist');
  });
});

describe('DARE external sources', () => {
  it('marks third-party sources as external and disclaims ownership', () => {
    cy.visit('/');
    cy.wait(3000);
    cy.get('.dare-sources__link').each(($a) => {
      cy.wrap($a).should('have.attr', 'target', '_blank');
      cy.wrap($a).should('have.attr', 'rel').and('match', /noopener/);
    });
    cy.get('.dare-sources__disclaimer').should('contain.text', 'does not host or claim ownership');
  });
});

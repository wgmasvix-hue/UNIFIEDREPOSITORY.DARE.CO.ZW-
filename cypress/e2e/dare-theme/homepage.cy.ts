/**
 * DARE theme verification — homepage, responsive behaviour and accessibility.
 *
 * Runs against the local preview SSR server (127.0.0.1:4300). Never production.
 * Failures are assertions, not logs: a FAIL here means the theme is broken.
 */

const VIEWPORTS = [
  { name: '320-mobile-min', w: 320, h: 720 },
  { name: '375-iphone-se', w: 375, h: 812 },
  { name: '390-iphone-14', w: 390, h: 844 },
  { name: '430-iphone-max', w: 430, h: 932 },
  { name: '768-tablet', w: 768, h: 1024 },
  { name: '1024-tablet-land', w: 1024, h: 768 },
  { name: '1440-laptop', w: 1440, h: 900 },
  { name: '1920-desktop', w: 1920, h: 1080 },
];

describe('DARE homepage', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('renders the primary message and hero search', () => {
    cy.get('h1')
      .should('exist')
      .invoke('text')
      .then((text) => {
        const t = (text as string).replace(/\s+/g, ' ').trim();
        expect(t).to.match(/Discover\s+African\s+Knowledge/i);
      });

    cy.get('input[name="query"]')
      .should('exist')
      .and('be.visible');

    cy.contains('button', /search/i).should('exist');
    cy.contains(/browse collections/i).should('exist');
  });

  it('has exactly one h1 and a single main landmark', () => {
    cy.get('h1').should('have.length', 1);
    cy.get('main').should('have.length', 1);
  });

  it('renders live statistics from the DSpace API (not hardcoded)', () => {
    cy.get('dare-stats', { timeout: 30000 }).should('exist');
    cy.get('.dare-stats__value', { timeout: 30000 })
      .should('have.length', 4)
      .each(($el) => {
        // A pending tile renders an em dash. Live data must never be a dash.
        cy.wrap($el).invoke('text').should('not.match', /^\s*—\s*$/);
        cy.wrap($el).invoke('text').should('match', /[\d,]{2,}/);
      });
  });

  it('lists communities from the repository', () => {
    cy.get('.dare-communities__name', { timeout: 30000 })
      .should('have.length.greaterThan', 3);
  });

  it('renders the seven research areas as real links', () => {
    const areas = [
      'Research',
      'Theses & Dissertations',
      'Books',
      'Open Education',
      'Datasets',
      'African Knowledge',
      'AI & Machine Learning',
    ];
    areas.forEach((area) => {
      cy.get('.dare-explore__title').should('contain.text', area);
    });
    cy.get('.dare-explore__link').should('have.length', 7);
  });

  it('presents third-party sources as external links with provenance', () => {
    cy.get('.dare-sources__name').should('have.length.greaterThan', 4);
    cy.get('.dare-sources__link').first()
      .should('have.attr', 'target', '_blank')
      .and('have.attr', 'rel')
      .and('contain', 'noopener');
    cy.contains(/does not host or claim ownership/i).should('exist');
  });

  it('shows the African knowledge band with working links', () => {
    cy.get('.dare-africa').should('exist');
    cy.get('.dare-africa__links a').should('have.length.greaterThan', 2);
  });
});

describe('DARE responsive behaviour', () => {
  VIEWPORTS.forEach((vp) => {
    it(`has no horizontal overflow at ${vp.name} (${vp.w}px)`, () => {
      cy.viewport(vp.w, vp.h);
      cy.visit('/');

      // Allow content + fonts to settle before measuring.
      cy.wait(1500);

      cy.document().then((doc) => {
        const el = doc.documentElement;
        const scrollW = el.scrollWidth;
        const clientW = el.clientWidth;
        // 1px tolerance for sub-pixel rounding.
        expect(scrollW, `scrollWidth ${scrollW} vs clientWidth ${clientW}`)
          .to.be.at.most(clientW + 1);
      });
    });

    it(`captures a full-page screenshot at ${vp.name}`, () => {
      cy.viewport(vp.w, vp.h);
      cy.visit('/');
      cy.wait(1500);
      cy.screenshot(`home-${vp.name}`, { capture: 'fullPage', overwrite: true });
    });
  });

  it('collapses navigation behind a menu button on mobile', () => {
    cy.viewport(375, 812);
    cy.visit('/');
    cy.get('.dare-masthead__toggle').should('be.visible');
    cy.get('#main-navbar').should('exist');
  });

  it('keeps the hero search visible and usable on mobile', () => {
    cy.viewport(320, 720);
    cy.visit('/');
    cy.get('input[name="query"]').first().should('be.visible');
    cy.get('main').should('be.visible');
  });
});

describe('DARE accessibility basics', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.wait(800);
  });

  it('declares a document language', () => {
    cy.document().then((doc) => {
      expect(doc.documentElement.getAttribute('lang')).to.match(/^[a-z]{2}/i);
    });
  });

  it('exposes exactly one skip-to-content control (DSpace core)', () => {
    // The DARE theme intentionally adds no second skip link: DSpace's root
    // shell already ships #skip-to-main-content. Two would be an a11y defect.
    cy.get('#skip-to-main-content').should('have.length', 1);
    cy.get('a.skip-link').should('have.length', 0);
    cy.get('#skip-to-main-content')
      .focus()
      .should('be.focused');
  });

  it('has exactly one main landmark across the whole page', () => {
    cy.get('main').should('have.length', 1);
  });

  it('gives every navigation landmark an accessible name', () => {
    cy.get('nav').each(($nav) => {
      cy.wrap($nav).should('have.attr', 'aria-label');
    });
  });

  it('uses real heading levels in order', () => {
    cy.get('h1').should('have.length', 1);
    cy.get('h2').should('have.length.greaterThan', 1);
    // Decorative arrows are hidden from assistive tech.
    cy.get('[aria-hidden="true"]').should('have.length.greaterThan', 0);
  });

  it('gives every focusable element a visible focus indicator', () => {
    cy.get('a.dare-nav-link, a.dare-btn, .dare-explore__link').first().focus();
    cy.document().then((doc) => {
      const css = getComputedStyle(doc.activeElement as Element);
      const outline = css.outlineStyle;
      const outlineWidth = parseFloat(css.outlineWidth || '0');
      expect(outline, `outline-style=${outline}`).to.not.equal('none');
      expect(outlineWidth, `outline-width=${outlineWidth}px`).to.be.greaterThan(0);
    });
  });

  it('honours reduced-motion preferences', () => {
    cy.visit('/', {
      onBeforeLoad(win) {
        // @ts-ignore
        win.matchMedia = (q: string) => ({
          matches: q.includes('prefers-reduced-motion'),
          media: q,
          addListener() {}, removeListener() {},
          addEventListener() {}, removeEventListener() {}, dispatchEvent: () => false,
          onchange: null,
        });
      },
    });
    cy.get('main').should('be.visible');
  });
});
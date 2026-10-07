/**
 * DARE Unified Repository branding — logo integration test.
 *
 * Verifies the new `dare-unified-logo.png` lockup in the masthead:
 * existence, accessible name, home link, visibility (desktop + mobile) and
 * that the brand never pushes the page into horizontal overflow on a phone.
 *
 * Runs against the local preview server, never production.
 */

describe('DARE Unified Repository branding', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('renders the logo image in the masthead', () => {
    cy.get('.dare-masthead__brand .dare-brand__logo', { timeout: 30000 })
      .should('exist')
      .and('be.visible')
      .and('have.attr', 'src')
      .and('match', /dare-unified-logo\.png/);
  });

  it('gives the logo the required alt text', () => {
    cy.get('.dare-brand__logo')
      .should('have.attr', 'alt', 'DARE Unified Repository');
  });

  it('links the logo to the repository homepage with an accessible name', () => {
    cy.get('.dare-masthead__brand')
      .should('have.attr', 'href', '/home')
      .and('have.attr', 'aria-label')
      .and('match', /DARE Unified Repository/i);
  });

  it('keeps the brand compact on desktop (54–64px visual height)', () => {
    cy.viewport(1440, 900);
    cy.visit('/');
    cy.get('.dare-brand__plate', { timeout: 30000 }).should('be.visible')
      .then(($el) => {
        const h = ($el[0] as HTMLElement).getBoundingClientRect().height;
        expect(h, 'logo plate height').to.be.within(54, 64);
      });
  });

  it('shows a visible focus state when the brand link is keyboard-focused', () => {
    cy.get('.dare-masthead__brand').focus();
    cy.get('.dare-masthead__brand').should(($el) => {
      const outline = window.getComputedStyle($el[0]).outlineWidth;
      expect(outline, 'focus outline width').to.not.equal('0px');
    });
  });

  [320, 375, 430].forEach((w) => {
    it(`stays visible and overflow-free on a ${w}px viewport`, () => {
      cy.viewport(w, 800);
      cy.visit('/');
      cy.get('.dare-brand__logo', { timeout: 30000 }).should('be.visible');
      cy.get('.dare-brand__plate').then(($el) => {
        const rect = ($el[0] as HTMLElement).getBoundingClientRect();
        // Responsive band: ~42–50px visual height on phones.
        expect(rect.height, 'mobile logo height').to.be.within(42, 50);
        // Never overflows the viewport.
        expect(rect.right, 'logo right edge').to.be.at.most(w + 1);
        expect(rect.left, 'logo left edge').to.be.at.least(-1);
      });
      cy.document().then((doc) => {
        const el = doc.documentElement;
        expect(el.scrollWidth, 'document scrollWidth').to.be.at.most(el.clientWidth + 1);
      });
    });
  });
});

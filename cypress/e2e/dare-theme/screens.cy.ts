/** Element-scoped captures: these cannot stitch, so they show ground truth. */
describe('DARE element captures', () => {
  it('masthead + nav', () => {
    cy.viewport(1440, 900);
    cy.visit('/', { timeout: 60000 });
    cy.wait(3000);
    cy.get('.dare-masthead').screenshot('e-01-masthead', { overwrite: true });
    cy.get('.dare-nav').screenshot('e-02-nav', { overwrite: true });
  });

  it('hero', () => {
    cy.viewport(1440, 900);
    cy.visit('/', { timeout: 60000 });
    cy.wait(3000);
    cy.get('.dare-hero').screenshot('e-03-hero', { overwrite: true });
  });

  it('stats band', () => {
    cy.viewport(1440, 900);
    cy.visit('/', { timeout: 60000 });
    cy.wait(3500);
    cy.get('dare-stats').screenshot('e-04-stats', { overwrite: true });
  });

  it('explore grid', () => {
    cy.viewport(1440, 900);
    cy.visit('/', { timeout: 60000 });
    cy.wait(3000);
    cy.get('.dare-explore__list').screenshot('e-05-explore', { overwrite: true });
  });

  it('footer', () => {
    cy.viewport(1440, 900);
    cy.visit('/', { timeout: 60000 });
    cy.wait(3000);
    cy.get('.dare-footer__inner').screenshot('e-06-footer', { overwrite: true });
  });

  it('mobile hero', () => {
    cy.viewport(390, 844);
    cy.visit('/', { timeout: 60000 });
    cy.wait(3000);
    cy.get('.dare-hero').screenshot('e-07-hero-mobile', { overwrite: true });
    cy.get('.dare-masthead').screenshot('e-08-masthead-mobile', { overwrite: true });
  });
});

const ROUTE = Cypress.env('dareRoute') || '/';
const TAG = Cypress.env('dareTag') || 'home';
const W = Number(Cypress.env('dareW') || 1280);
const H = Number(Cypress.env('dareH') || 900);

describe(`frames ${TAG}`, () => {
  it('captures viewport frames', () => {
    cy.viewport(W, H);
    cy.visit(ROUTE, { timeout: 90000, failOnStatusCode: false });
    cy.wait(11000);
    cy.screenshot(`/${TAG}-00-top`, { capture: 'viewport', overwrite: true });
    cy.window().then((win) => {
      const total = win.document.documentElement.scrollHeight;
      const steps = Math.min(5, Math.max(1, Math.ceil(total / H) - 1));
      for (let i = 1; i <= steps; i++) {
        cy.window().then((w) => w.scrollTo(0, i * (H - 60)));
        cy.wait(1200);
        cy.screenshot(`/${TAG}-${String(i).padStart(2, '0')}`, { capture: 'viewport', overwrite: true });
      }
    });
  });
});

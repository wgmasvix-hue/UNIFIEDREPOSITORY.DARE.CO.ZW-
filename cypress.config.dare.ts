import { defineConfig } from 'cypress';

/**
 * DARE theme verification config.
 * Isolated from the upstream DSpace e2e config on purpose: this suite only
 * exercises the public DARE theme against the local preview SSR server and
 * must never run against production.
 */
export default defineConfig({
  video: false,
  screenshotsFolder: '/opt/dare-dspace-theme/verification/screenshots',
  fixturesFolder: '/opt/dare-dspace-angular/cypress/fixtures',
  retries: 0,
  viewportWidth: 1440,
  viewportHeight: 900,
  e2e: {
    baseUrl: 'http://127.0.0.1:4400',
    supportFile: false,
    specPattern: 'cypress/e2e/dare-theme/*.cy.ts',
    setupNodeEvents(on) {
      on('task', {
        log(message) { console.log(message); return null; },
      });
    },
  },
});

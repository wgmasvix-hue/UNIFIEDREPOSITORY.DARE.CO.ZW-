/**
 * Horizontal-overflow regression test.
 *
 * A horizontal scrollbar on a phone is a hard failure for a mobile-first
 * repository. DSpace core renders long metadata values (author lists, DOIs,
 * URIs) and a horizontal breadcrumb trail that previously pushed item pages
 * from a 375px viewport to 453px of scrollWidth.
 *
 * This measures the real document on every route and writes a report to
 * verification/overflow-report.txt so regressions are visible, not just
 * inferred from a pass/fail line.
 */

const ITEM = 'f7ad7e72-14eb-4fc2-91aa-fc2cc69808af';
const ROUTES: { name: string; path: string; timeout?: number }[] = [
  { name: 'home', path: '/' },
  { name: 'item', path: `/items/${ITEM}`, timeout: 60000 },
  { name: 'community-list', path: '/community-list', timeout: 60000 },
  { name: 'search', path: '/search?query=agriculture', timeout: 60000 },
];

const VIEWPORTS = [
  { w: 320, h: 720 },
  { w: 375, h: 812 },
  { w: 390, h: 844 },
  { w: 430, h: 932 },
  { w: 768, h: 1024 },
];

const REPORT = '/opt/dare-dspace-theme/verification/overflow-report.txt';

interface Row { route: string; w: number; scrollW: number; clientW: number; offenders: string; }

describe('horizontal overflow', () => {
  const rows: Row[] = [];

  ROUTES.forEach((route) => {
    VIEWPORTS.forEach((vp) => {
      it(`${route.name} @ ${vp.w}px does not scroll horizontally`, () => {
        cy.viewport(vp.w, vp.h);
        cy.visit(route.path, { timeout: route.timeout ?? 30000, failOnStatusCode: false });
        // Give SSR + hydration + any late layout shifts time to settle.
        cy.wait(3000);

        cy.document().then((doc) => {
          const el = doc.documentElement;
          const clientW = el.clientWidth;
          const scrollW = el.scrollWidth;

          const offenders: string[] = [];
          doc.querySelectorAll<HTMLElement>('*').forEach((node) => {
            const rect = node.getBoundingClientRect();
            if (rect.width > 0 && (rect.right > clientW + 1 || rect.left < -1)) {
              const cls = (node.className || '').toString().trim().split(/\s+/).slice(0, 3).join('.');
              offenders.push(`${node.tagName.toLowerCase()}${cls ? '.' + cls : ''}` +
                `(w=${Math.round(rect.width)},R=${Math.round(rect.right)})`);
            }
          });

          rows.push({
            route: route.name,
            w: vp.w,
            scrollW,
            clientW,
            offenders: offenders.slice(0, 6).join(' | '),
          });

          expect(scrollW, `${route.name}@${vp.w}px scrollWidth=${scrollW} clientWidth=${clientW} :: ${offenders.slice(0, 6).join(' | ')}`)
            .to.be.at.most(clientW + 1);
        });
      });
    });
  });

  after(() => {
    if (rows.length === 0) {
      return;
    }
    const header = 'route\tviewport\tscrollW\tclientW\toverflow\tscrollW<=clientW+1\toffenders';
    const body = rows.map((r) =>
      `${r.route}\t${r.w}\t${r.scrollW}\t${r.clientW}\t${r.scrollW - r.clientW}\t${r.scrollW <= r.clientW + 1 ? 'PASS' : 'FAIL'}\t${r.offenders}`,
    ).join('\n');
    cy.writeFile(REPORT, `${header}\n${body}\n`);
  });
});
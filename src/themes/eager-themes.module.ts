import { NgModule } from '@angular/core';

import { EagerThemeModule as DSpaceEagerThemeModule } from './dspace/eager-theme.module';
import { EagerThemeModule as DareEagerThemeModule } from './dare/eager-theme.module';

/**
 * This module bundles the eager theme modules for all available themes.
 * Eager modules contain components that are present on every page (to speed up initial loading)
 * and entry components (to ensure their decorators get picked up).
 *
 * Themes that aren't in use should not be imported here so they don't take up unnecessary space in the main bundle.
 *
 * DARE: only ONE theme beyond the DSpace base may be registered here, because
 * both `custom` and `dare` declare the same `ds-themed-*` selectors. The active
 * theme is selected separately in `src/config/default-app-config.ts`.
 *
 * To roll back to the previous DARE theme, replace `DareEagerThemeModule` with
 * `CustomEagerThemeModule` (from './custom/eager-theme.module'), revert the
 * `themes` entry in default-app-config.ts to `{ name: 'custom' }`, and restore
 * the `custom-theme` style bundle in angular.json. See ROLLBACK.md.
 */
@NgModule({
  imports: [
    DSpaceEagerThemeModule,
    DareEagerThemeModule,
  ],
})
export class EagerThemesModule {
}

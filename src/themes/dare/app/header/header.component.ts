import { AsyncPipe } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ThemedLangSwitchComponent } from 'src/app/shared/lang-switch/themed-lang-switch.component';

import { HeaderComponent as BaseComponent } from '../../../../app/header/header.component';
import { ThemedSearchNavbarComponent } from '../../../../app/search-navbar/themed-search-navbar.component';
import { ThemedAuthNavMenuComponent } from '../../../../app/shared/auth-nav-menu/themed-auth-nav-menu.component';
import { HostWindowService } from '../../../../app/shared/host-window.service';
import { ImpersonateNavbarComponent } from '../../../../app/shared/impersonate-navbar/impersonate-navbar.component';
import { MenuService } from '../../../../app/shared/menu/menu.service';
import { MenuID } from '../../../../app/shared/menu/menu-id.model';

/**
 * DARE institutional masthead.
 *
 * The brand lockup renders the supplied `dare-unified-logo.png` asset
 * (`src/assets`, already in the Angular build assets) inside a cropped logo
 * plate: the source file carries large black letterbox bars, so the plate
 * crops to the ~1433x542 content box with `object-fit: cover` instead of
 * showing them. Sizing is token-driven (`--dare-brand-logo-height`, 60px
 * desktop / 46px md / 44px sm) so the Unified theme inherits this header via
 * `extends` and re-skins the branding without forking the component.
 *
 * Utility controls (search, language, sign-in) stay on the right on desktop
 * and collapse behind the toggle on mobile, where the three essentials are
 * the brand mark, search and menu.
 */
@Component({
  selector: 'ds-themed-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  imports: [
    AsyncPipe,
    ImpersonateNavbarComponent,
    RouterLink,
    ThemedAuthNavMenuComponent,
    ThemedLangSwitchComponent,
    ThemedSearchNavbarComponent,
    TranslateModule,
  ],
})
export class HeaderComponent extends BaseComponent {

  /**
   * True while the collapsible navigation is expanded.
   *
   * The toggle button in the masthead controls `#collapsingNav`, so
   * `aria-expanded` has to track the real menu state. Hard-coding it (as DSpace
   * does) tells assistive technology the menu is permanently closed, which is
   * both false and useless.
   */
  protected navbarExpanded$: Observable<boolean>;

  constructor(
    menuService: MenuService,
    windowService: HostWindowService,
  ) {
    super(menuService, windowService);
    this.navbarExpanded$ = menuService.isMenuCollapsed(MenuID.PUBLIC).pipe(
      // `isMenuCollapsed` emits `undefined` before the menu state is hydrated;
      // treat an unknown state as collapsed so the button never claims to
      // control an open region that has not been rendered yet.
      map((collapsed: boolean | undefined) => collapsed === false),
    );
  }
}

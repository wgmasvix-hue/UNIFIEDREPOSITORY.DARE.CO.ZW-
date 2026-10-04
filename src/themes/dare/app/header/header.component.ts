import { AsyncPipe } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ThemedLangSwitchComponent } from 'src/app/shared/lang-switch/themed-lang-switch.component';

import { HeaderComponent as BaseComponent } from '../../../../app/header/header.component';
import { ThemedSearchNavbarComponent } from '../../../../app/search-navbar/themed-search-navbar.component';
import { ThemedAuthNavMenuComponent } from '../../../../app/shared/auth-nav-menu/themed-auth-nav-menu.component';
import { ImpersonateNavbarComponent } from '../../../../app/shared/impersonate-navbar/impersonate-navbar.component';

/**
 * DARE institutional masthead.
 *
 * The wordmark is set typographically rather than shipped as an image:
 * the inherited DARE logo asset is ~988 KB, which is a material share of the
 * homepage payload for a page that already renders server-side. Rendering
 * "DARE" as type removes that request entirely and stays crisp at any DPR.
 *
 * Utility controls (search, language, sign-in) stay on the right on desktop
 * and collapse behind the toggle on mobile, where the three essentials are
 * the wordmark, search and menu.
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
}
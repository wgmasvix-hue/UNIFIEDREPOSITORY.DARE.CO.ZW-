import {
  AsyncPipe,
  NgClass,
  NgComponentOutlet,
} from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { ThemedUserMenuComponent } from 'src/app/shared/auth-nav-menu/user-menu/themed-user-menu.component';
import { ThemedAuthNavMenuComponent } from 'src/app/shared/auth-nav-menu/themed-auth-nav-menu.component';

import { NavbarComponent as BaseComponent } from '../../../../app/navbar/navbar.component';
import { slideMobileNav } from '../../../../app/shared/animations/slide';

interface DareNavDestination {
  id: string;
  label: string;
  query: string;
}

/**
 * DARE primary navigation.
 *
 * Two layers, in order of importance:
 *   1. Large typographic destinations (RESEARCH / EDUCATION / DATA /
 *      COMMUNITIES / ABOUT). These are the orientation layer; they are real
 *      links with real targets, not decoration.
 *   2. The DSpace-managed menu sections (browse, context links, admin) which
 *      the backend populates. Kept intact so no repository capability is lost.
 *
 * The DARE destinations are curated free-text queries because this DSpace 9.3
 * index exposes only six discovery facets and `dc.type` is not one of them —
 * a type filter returns HTTP 422. See COMPONENTS.md.
 */
@Component({
  selector: 'ds-themed-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  animations: [slideMobileNav],
  imports: [
    AsyncPipe,
    NgClass,
    NgComponentOutlet,
    NgbDropdownModule,
    RouterLink,
    ThemedAuthNavMenuComponent,
    ThemedUserMenuComponent,
    TranslateModule,
  ],
})
export class NavbarComponent extends BaseComponent {

  protected readonly destinations: DareNavDestination[] = [
    { id: 'research', label: 'Research', query: '' },
    { id: 'education', label: 'Education', query: 'textbook education teaching' },
    { id: 'data', label: 'Data', query: 'dataset data' },
    { id: 'communities', label: 'Communities', query: '' },
  ];
}
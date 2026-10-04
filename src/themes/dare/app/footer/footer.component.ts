import { AsyncPipe } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { FooterComponent as BaseComponent } from '../../../../app/footer/footer.component';

/**
 * DARE institutional footer.
 *
 * Retains every affordance the DSpace base footer exposes and that DARE is
 * obliged to keep — cookie settings (Orejime consent), privacy policy, end-user
 * agreement, accessibility statement, feedback, and the DSpace/LYRASIS software
 * attribution — while presenting them inside a large editorial layout.
 */
@Component({
  selector: 'ds-themed-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  imports: [
    AsyncPipe,
    RouterLink,
    TranslateModule,
  ],
})
export class FooterComponent extends BaseComponent {

  protected readonly year = new Date().getFullYear();
}
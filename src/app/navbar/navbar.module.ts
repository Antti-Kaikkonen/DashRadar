import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatTabsModule, MatToolbarModule } from '@angular/material';
import { RouterModule } from '@angular/router';

import { NavbarComponent } from './navbar.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule, MatTabsModule
  ],
  declarations: [NavbarComponent],
  exports: [NavbarComponent]
})
export class NavbarModule { }

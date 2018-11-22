import { OverlayModule } from '@angular/cdk/overlay';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule, MatCardModule, MatIconModule, MatTabsModule, MatToolbarModule } from '@angular/material';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TransferHttpCacheModule } from '@nguniversal/common';

import { AddressService } from './addresses/address.service';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BlockService } from './blocks/block.service';
import { DashboardComponent } from './dashboard/dashboard.component';
import { NavbarModule } from './navbar/navbar.module';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { TransactionService } from './transactions/transaction.service';

@NgModule({
  declarations: [
    AppComponent,
    PageNotFoundComponent,
    DashboardComponent
  ],
  imports: [
    MatCardModule,
    NavbarModule,
    FlexLayoutModule,
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    HttpClientModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    MatButtonModule,MatIconModule,MatToolbarModule,MatTabsModule,OverlayModule,
    TransferHttpCacheModule
  ],
  exports: [
  ],
  providers: [BlockService, 
    TransactionService, 
    AddressService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

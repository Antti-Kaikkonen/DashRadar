import 'hammerjs';
import 'rxjs/add/observable/from';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/observable/interval';
import 'rxjs/add/observable/merge';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/onErrorResumeNext';
import 'rxjs/add/observable/range';
import 'rxjs/add/observable/throw';
import 'rxjs/add/observable/timer';
import 'rxjs/add/operator/concat';
import 'rxjs/add/operator/concatMap';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/distinct';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/finally';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/merge';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/onErrorResumeNext';
import 'rxjs/add/operator/publishReplay';
import 'rxjs/add/operator/retryWhen';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/takeLast';
import 'rxjs/add/operator/toArray';
import 'rxjs/add/operator/zip';

import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { HttpModule } from '@angular/http';
import { MatButtonModule, MatIconModule, MatTabsModule, MatToolbarModule } from '@angular/material';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AddressService } from './addresses/address.service';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BlockService } from './blocks/block.service';
import { NavbarModule } from './navbar/navbar.module';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { TransactionService } from './transactions/transaction.service';

@NgModule({
  declarations: [
    AppComponent,
    PageNotFoundComponent
  ],
  imports: [
    NavbarModule,
    FlexLayoutModule,
    BrowserModule,
    HttpModule,HttpClientModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    MatButtonModule,MatIconModule,MatToolbarModule,MatTabsModule
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

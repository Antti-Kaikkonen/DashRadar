import 'chartjs-plugin-downsample';

import { PortalModule } from '@angular/cdk/portal';
import { CommonModule, DatePipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';


import { MatButtonModule } from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatIconModule} from '@angular/material/icon';
import {MatTabsModule} from '@angular/material/tabs';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatTableModule} from '@angular/material/table';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatInputModule} from '@angular/material/input';
import {MatDividerModule} from '@angular/material/divider';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatDialogModule} from '@angular/material/dialog';
import {MatSortModule} from '@angular/material/sort';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatMenuModule} from '@angular/material/menu';
import {MatChipsModule} from '@angular/material/chips';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatListModule} from '@angular/material/list';


import { RouterModule } from '@angular/router';
import { ChartsModule as ChartJSModule } from 'ng2-charts/ng2-charts';

import { AddressBalanceChartComponent } from '../addresses/address/address-balance-chart/address-balance-chart.component';
import { AddressComponent } from '../addresses/address/address.component';
import { BlockComponent } from '../blocks/block/block.component';
import { BlocksTable2Component } from '../blocks/blocks-table2/blocks-table2.component';
import { CypherService } from '../charts/cypher.service';
import { NavbarModule } from '../navbar/navbar.module';
import { DurationPipe } from '../pipes/duration.pipe';
import { RelativeTimePipe } from '../pipes/relative-time.pipe';
import { SharedModule } from '../shared/shared.module';
import {
  PrivatesendAnalysisAddressClustersComponent,
} from '../transactions/privatesend-analysis-address-clusters/privatesend-analysis-address-clusters.component';
import {
  PrivatesendAnalysisCreateDenominationsComponent,
} from '../transactions/privatesend-analysis-create-denominations/privatesend-analysis-create-denominations.component';
import { TransactionSummaryComponent } from '../transactions/transaction/transaction-summary/transaction-summary.component';
import { TransactionComponent } from '../transactions/transaction/transaction.component';
import { TransactionsTableComponent } from '../transactions/transactions-table/transactions-table.component';
import { WalletService } from '../wallets/wallet.service';
import { WalletComponent } from '../wallets/wallet/wallet.component';
import {
  TransactionInputOutputTableComponent,
} from './../transactions/transaction/transaction-input-output-table/transaction-input-output-table.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ExplorerRoutingModule } from './explorer-routing.module';
import { ExplorerComponent } from './explorer.component';


@NgModule({
  imports: [
    CommonModule,
    ExplorerRoutingModule,
    MatButtonModule, 
    MatSlideToggleModule, 
    MatDialogModule, 
    MatProgressSpinnerModule, 
    MatInputModule, MatTableModule, 
    MatIconModule, 
    MatSortModule, 
    MatCheckboxModule, 
    MatSnackBarModule, MatMenuModule, MatTabsModule, MatChipsModule, MatExpansionModule, MatCardModule, MatPaginatorModule, MatTooltipModule, MatDividerModule, MatListModule,
    RouterModule,
    FlexLayoutModule,
    ChartJSModule,
    SharedModule,
    NavbarModule,
    ReactiveFormsModule,
    PortalModule
  ],
  declarations: [
    BlocksTable2Component,
  	BlockComponent,
    TransactionComponent,
    TransactionInputOutputTableComponent,
    AddressComponent,
    WalletComponent,
    TransactionsTableComponent,
    TransactionSummaryComponent,
    AddressBalanceChartComponent,
    PrivatesendAnalysisCreateDenominationsComponent,
    PrivatesendAnalysisAddressClustersComponent,
    DurationPipe,
    RelativeTimePipe,
    ExplorerComponent,
    DashboardComponent
  ],
  providers: [
    DatePipe,
    CypherService,
    WalletService
  ]
})
export class ExplorerModule { }

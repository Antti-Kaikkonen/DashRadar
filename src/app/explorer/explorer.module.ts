import 'chartjs-plugin-downsample';

import { PortalModule } from '@angular/cdk/portal';
import { CommonModule, DatePipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import {
  MatButtonModule,
  MatCardModule,
  MatCheckboxModule,
  MatChipsModule,
  MatDialogModule,
  MatDividerModule,
  MatExpansionModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatMenuModule,
  MatPaginatorModule,
  MatProgressSpinnerModule,
  MatSlideToggleModule,
  MatSnackBarModule,
  MatSortModule,
  MatTableModule,
  MatTabsModule,
  MatTooltipModule,
} from '@angular/material';
import { RouterModule } from '@angular/router';
import { ChartsModule as ChartJSModule } from 'ng2-charts/ng2-charts';
import { DragulaModule } from 'ng2-dragula/ng2-dragula';

import { AddressBalanceChartComponent } from '../addresses/address/address-balance-chart/address-balance-chart.component';
import { AddressComponent } from '../addresses/address/address.component';
import { BlockPropertiesDialogComponent } from '../blocks/block-properties-dialog/block-properties-dialog.component';
import { BlockComponent } from '../blocks/block/block.component';
import { BlocksTableComponent } from '../blocks/blocks-table/blocks-table.component';
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
    DragulaModule,
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
  	BlocksTableComponent,
    BlocksTable2Component,
  	BlockComponent,
    TransactionComponent,
    TransactionInputOutputTableComponent,
    AddressComponent,
    WalletComponent,
    BlockPropertiesDialogComponent,
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

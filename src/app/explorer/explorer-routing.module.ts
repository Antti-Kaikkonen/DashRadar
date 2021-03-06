import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import {
  PrivatesendAnalysisAddressClustersComponent,
} from '../transactions/privatesend-analysis-address-clusters/privatesend-analysis-address-clusters.component';
import {
  PrivatesendAnalysisCreateDenominationsComponent,
} from '../transactions/privatesend-analysis-create-denominations/privatesend-analysis-create-denominations.component';
import { WalletComponent } from '../wallets/wallet/wallet.component';
import { AddressComponent } from './../addresses/address/address.component';
import { BlockComponent } from './../blocks/block/block.component';
import { BlocksTable2Component } from './../blocks/blocks-table2/blocks-table2.component';
import { TransactionComponent } from './../transactions/transaction/transaction.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ExplorerComponent } from './explorer.component';

const routes: Routes = [
	{ path: '', component: ExplorerComponent, children: [
    { path: '', component: DashboardComponent },
    //{ path: '', component: BlocksTable2Component },
    { path: 'blocks', component: BlocksTable2Component },
    { path: 'blocks/:hash',   component: BlockComponent },
    { path: 'tx/:txid', component: TransactionComponent},
    { path: 'privatesend/:txid', component: PrivatesendAnalysisAddressClustersComponent},
    { path: 'privatesend-old/:txid', component: PrivatesendAnalysisCreateDenominationsComponent},
    { path: 'address/:addr', component: AddressComponent},
    { path: 'wallet/:addr', component: WalletComponent}
  ] },
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ExplorerRoutingModule { }

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PrivatesendAnalysisComponent } from '../transactions/privatesend-analysis/privatesend-analysis.component';
import { PrivatesendAnalysis2Component } from '../transactions/privatesend-analysis2/privatesend-analysis2.component';
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
    { path: 'privatesend/:txid', component: PrivatesendAnalysisComponent},
    { path: 'privatesend2/:txid', component: PrivatesendAnalysis2Component},
    { path: 'address/:addr', component: AddressComponent},
    { path: 'wallet/:addr', component: WalletComponent}
  ] },
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ExplorerRoutingModule { }

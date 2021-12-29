import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule } from '@angular/forms';



import { MatButtonModule } from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatTabsModule} from '@angular/material/tabs';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatTableModule} from '@angular/material/table';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatDialogModule} from '@angular/material/dialog';
import {MatSortModule} from '@angular/material/sort';
import {MatSnackBarModule} from '@angular/material/snack-bar';



import { NavbarModule } from '../navbar/navbar.module';
import { AddressDialogComponent } from './../vivagraph-container/address-dialog/address-dialog.component';
import { ExportDialog, ImportExportComponent } from './../vivagraph-container/import-export/import-export.component';
import { TransactionDialogComponent } from './../vivagraph-container/transaction-dialog/transaction-dialog.component';
import {
  VivagraphAddressListComponent,
} from './../vivagraph-container/vivagraph-address-list/vivagraph-address-list.component';
import { VivagraphContainerComponent } from './../vivagraph-container/vivagraph-container.component';
import { VivagraphGuideComponent } from './../vivagraph-container/vivagraph-guide/vivagraph-guide.component';
import { VivagraphSettingsComponent } from './../vivagraph-container/vivagraph-settings/vivagraph-settings.component';
import {
  VivagraphTransactionListComponent,
} from './../vivagraph-container/vivagraph-transaction-list/vivagraph-transaction-list.component';
import { VivagraphSvgComponent } from './../vivagraph-svg/vivagraph-svg.component';
import { GraphRoutingModule } from './graph-routing.module';
import { GraphComponent } from './graph.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    GraphRoutingModule,
    MatButtonModule, MatDialogModule, MatSlideToggleModule, MatProgressSpinnerModule, MatInputModule, MatTableModule, MatCheckboxModule, 
    MatIconModule, MatSortModule, MatSnackBarModule, MatTabsModule, MatSelectModule,
		FlexLayoutModule,
		NavbarModule
  ],
  declarations: [
  	VivagraphContainerComponent,
  	VivagraphGuideComponent,
  	ImportExportComponent,
  	VivagraphSettingsComponent,
  	VivagraphSvgComponent,
  	VivagraphAddressListComponent,
  	VivagraphTransactionListComponent,
  	AddressDialogComponent,
  	TransactionDialogComponent,
    GraphComponent,
    ExportDialog
  ],
  entryComponents: [ExportDialog]
})
export class GraphModule { }

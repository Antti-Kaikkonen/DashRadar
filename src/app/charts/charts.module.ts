import 'chartjs-plugin-zoom';

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MatButtonModule,
  MatButtonToggleModule,
  MatCardModule,
  MatCheckboxModule,
  MatDatepickerModule,
  MatIconModule,
  MatInputModule,
  MatProgressSpinnerModule,
  MatSelectModule,
  MatTableModule,
  MatTabsModule,
  MatToolbarModule,
} from '@angular/material';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { ChartsModule as ChartJSModule } from 'ng2-charts/ng2-charts';

import { NavbarModule } from '../navbar/navbar.module';
import { SharedModule } from '../shared/shared.module';
import { ChartsDashboardComponent } from './charts-dashboard/charts-dashboard.component';
import { ChartsRoutingModule } from './charts-routing.module';
import { ChartsComponent } from './charts.component';
import { CypherService } from './cypher.service';
import { CypherComponent } from './cypher/cypher.component';

@NgModule({
  imports: [
    CommonModule, 
    FormsModule,
    ReactiveFormsModule,
    ChartsRoutingModule,
    MatButtonModule, MatProgressSpinnerModule, MatTableModule, MatCheckboxModule, MatInputModule, MatTabsModule, MatIconModule, MatDatepickerModule, MatButtonToggleModule, MatToolbarModule, MatSelectModule, MatCardModule,
    MatMomentDateModule,
    ChartJSModule,
    FlexLayoutModule,
    SharedModule,
    NavbarModule
  ],
  declarations: [CypherComponent, 
    ChartsDashboardComponent, ChartsComponent
  ],
  providers: [CypherService]
})
export class ChartsModule { }

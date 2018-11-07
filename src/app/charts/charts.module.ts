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
  MatDividerModule,
  MatIconModule,
  MatInputModule,
  MatProgressSpinnerModule,
  MatSelectModule,
  MatTableModule,
  MatTabsModule,
  MatToolbarModule,
} from '@angular/material';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';
import { ChartsModule as ChartJSModule } from 'ng2-charts/ng2-charts';

import { NavbarModule } from '../navbar/navbar.module';
import { SharedModule } from '../shared/shared.module';
import { ChartDataService } from './chart-data.service';
import { ChartComponent } from './chart/chart.component';
import { ChartsDashboardComponent } from './charts-dashboard/charts-dashboard.component';
import { ChartsDashboardComponent2 } from './charts-dashboard/charts-dashboard2.component';
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
    MatButtonModule, MatProgressSpinnerModule, MatTableModule, MatCheckboxModule, MatInputModule, MatTabsModule, MatIconModule, MatDatepickerModule, MatButtonToggleModule, MatToolbarModule, MatSelectModule, MatCardModule, MatDividerModule,
    MatMomentDateModule,
    ChartJSModule,
    FlexLayoutModule,
    SharedModule,
    NavbarModule,
    CodemirrorModule
  ],
  declarations: [CypherComponent, 
    ChartsDashboardComponent, ChartsDashboardComponent2, ChartsComponent, ChartComponent
  ],
  providers: [CypherService, ChartDataService]
})
export class ChartsModule { }

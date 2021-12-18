import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ChartsModule as ChartJSModule } from 'ng2-charts/ng2-charts';

import { TimeSeriesChartComponent } from '../charts/time-series-chart/time-series-chart.component';

@NgModule({
  imports: [
    CommonModule,
    MatIconModule, MatButtonModule,
    ChartJSModule
  ],
  declarations: [TimeSeriesChartComponent],
  exports: [TimeSeriesChartComponent]
})
export class SharedModule { }

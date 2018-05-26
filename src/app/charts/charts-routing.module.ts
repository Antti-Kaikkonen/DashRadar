import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ChartComponent } from './chart/chart.component';
import { ChartsDashboardComponent } from './charts-dashboard/charts-dashboard.component';
import { ChartsDashboardComponent2 } from './charts-dashboard/charts-dashboard2.component';
import { ChartsComponent } from './charts.component';
import { CypherComponent } from './cypher/cypher.component';

const routes: Routes = [
  { path: '', component: ChartsComponent, children: 
    [
      { path: 'editor', component: CypherComponent },
      { path: '', component: ChartsDashboardComponent2 },
      { path: 'old', component: ChartsDashboardComponent },
      { path: ':chartName', component: ChartComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ChartsRoutingModule {}
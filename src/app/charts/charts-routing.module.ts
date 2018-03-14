import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ChartsDashboardComponent } from './charts-dashboard/charts-dashboard.component';
import { ChartsComponent } from './charts.component';
import { CypherComponent } from './cypher/cypher.component';

const routes: Routes = [
  { path: '', component: ChartsComponent, children: 
    [
      { path: 'editor', component: CypherComponent },
      { path: '', component: ChartsDashboardComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ChartsRoutingModule {}
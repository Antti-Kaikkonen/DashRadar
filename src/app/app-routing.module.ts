import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DashboardComponent } from './dashboard/dashboard.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';

export const routes: Routes = [
  { path: 'graph', loadChildren: './graph/graph.module#GraphModule', data: { title: 'Graph' } },
  { path: 'charts', loadChildren: './charts/charts.module#ChartsModule', data: { title: 'Charts' } },
  { path: 'explorer', loadChildren: './explorer/explorer.module#ExplorerModule', data: { title: 'Explorer' } },
  { path: 'nodes', loadChildren: './nodes/nodes.module#NodesModule', data: { title: 'Nodes' } },
  { path: 'cypher', redirectTo: '/charts/editor?query=:query', pathMatch: 'prefix'},
  { path: '', component: DashboardComponent, data: { title: 'DashRadar' } },
  { path: '**', component: PageNotFoundComponent }
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
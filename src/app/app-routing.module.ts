import { NgModule } from '@angular/core';
import { RouterModule, Routes, LoadChildren } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';

export const routes: Routes = [
  { path: 'graph', loadChildren: () => import('./graph/graph.module').then(m => m.GraphModule), data: { title: 'Graph' } },
  { path: 'charts', loadChildren: () => import('./charts/charts.module').then(m => m.ChartsModule), data: { title: 'Charts' } },
  { path: 'explorer', loadChildren: () => import('./explorer/explorer.module').then(m => m.ExplorerModule), data: { title: 'Explorer' } },
  //{ path: 'nodes', loadChildren: './nodes/nodes.module#NodesModule', data: { title: 'Nodes' } },
  { path: 'cypher', redirectTo: '/charts/editor?query=:query', pathMatch: 'prefix'},
  { path: '', component: DashboardComponent, data: { title: 'DashRadar' } },
  { path: '**', component: PageNotFoundComponent }
];
@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
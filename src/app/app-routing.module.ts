import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PageNotFoundComponent } from './page-not-found/page-not-found.component';

export const routes: Routes = [
  { path: 'charts', loadChildren: 'app/charts/charts.module#ChartsModule' },
  { path: 'explorer', loadChildren: 'app/explorer/explorer.module#ExplorerModule' },
  { path: 'cypher', redirectTo: '/charts/editor?query=:query', pathMatch: 'prefix'},
  { path: '', loadChildren: 'app/graph/graph.module#GraphModule' },
  { path: '**', component: PageNotFoundComponent }
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { NodesDashboardComponent } from './nodes-dashboard/nodes-dashboard.component';

const routes: Routes = [
    { path: '', component: NodesDashboardComponent} 
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NodesRoutingModule { }

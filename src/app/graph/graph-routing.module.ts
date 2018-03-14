import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VivagraphContainerComponent }  from './../vivagraph-container/vivagraph-container.component';
import { GraphComponent } from 'app/graph/graph.component';

const routes: Routes = [
  { path: '', component: GraphComponent, children: 
    [
      { path: '', component: VivagraphContainerComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GraphRoutingModule { }

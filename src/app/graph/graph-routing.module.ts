import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { GraphComponent } from '../graph/graph.component';
import { VivagraphContainerComponent } from './../vivagraph-container/vivagraph-container.component';

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

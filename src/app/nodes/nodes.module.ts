import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';


import { MatButtonModule } from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatIconModule} from '@angular/material/icon';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatTabsModule} from '@angular/material/tabs';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatTableModule} from '@angular/material/table';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatSortModule} from '@angular/material/sort';
import {MatMenuModule} from '@angular/material/menu';
import {MatPaginatorModule} from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';


import { NavbarModule } from '../navbar/navbar.module';
import { NodesDashboardComponent } from './nodes-dashboard/nodes-dashboard.component';
import { NodesRoutingModule } from './nodes-routing.module';

@NgModule({
  imports: [
    CommonModule,
    NodesRoutingModule,
    NavbarModule,
    MatTabsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatButtonToggleModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatButtonModule,
    MatToolbarModule,
    MatCardModule
  ],
  declarations: [
    NodesDashboardComponent
  ]
})
export class NodesModule { }

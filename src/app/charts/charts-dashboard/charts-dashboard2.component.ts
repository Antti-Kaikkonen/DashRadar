import { Component, OnInit } from '@angular/core';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { Meta, Title } from '@angular/platform-browser';

import { CypherService } from '../../charts/cypher.service';
import { ChartDataService } from '../chart-data.service';

@Component({
  selector: 'app-charts-dashboard',
  templateUrl: './charts-dashboard2.component.html',
  styleUrls: ['./charts-dashboard2.component.scss'],
  providers: [{ provide: MAT_DATE_LOCALE, useValue: 'fi-FI' }]
})
export class ChartsDashboardComponent2 implements OnInit {

  categories: {name: string, charts: string[], bgcolor?: string}[] = [
    {
      name: "Transactions",
      charts: ["transactions-per-day", "median-transaction-fee", "average-transaction-fee", "median-transaction-fee-per-byte"]
    },
    {
      name: "Private Send",
      charts: ["privatesend-transactions-per-day", "mixing-transactions-per-day", "total-unspent-mixed-dash", "mixing-transactions-per-day-by-denomination"],
      bgcolor: "#f2f2f2"
    },
    {
      name: "Miscellaneous",
      charts: ["number-of-unspent-transaction-outputs", "average-block-size", "total-output-volume", "block-rewards-per-day"]
    }
  ];


  constructor(public cypherService: CypherService,
    private metaService: Meta,
    private titleService: Title,
    public chartData: ChartDataService) {
  }

  ngOnDestroy() {
    this.metaService.removeTag('name="description"');
  }

  ngOnInit() {
    this.titleService.setTitle("Dash Charts | DashRadar");

    this.metaService.removeTag('name="description"');
    this.metaService.addTag({
      name: "description", 
      content: "Transactions per day, fees per day, average fee per byte, privatesend transactions per day, mixing transactions per day, ..."
    });

  }



}

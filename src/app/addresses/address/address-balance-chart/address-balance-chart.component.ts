import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { ChartPoint, ChartSeries } from '../../../charts/chartjs-types';
import { CypherService } from '../../../charts/cypher.service';
import * as chart_utils from '../../../utils/chart-utils';

@Component({
  selector: 'app-address-balance-chart',
  templateUrl: './address-balance-chart.component.html',
  styleUrls: ['./address-balance-chart.component.scss']
})
export class AddressBalanceChartComponent implements OnInit {

  constructor(private cypherService: CypherService) { }

  data: ChartSeries[];

  sub: Subscription;

  ngOnDestroy() {
    if (this.sub !== undefined) this.sub.unsubscribe();
  }

  @Input()
  set address(address: string) {
    this.data = undefined;
    
    let newQuery = "MATCH (:Address {address:$address})<-[:INCLUDED_IN]-(be:BalanceEvent)<-[:CREATES]-(:Transaction)-[:INCLUDED_IN]->(b:Block) RETURN b.time, be.balanceChangeSat ORDER BY b.time;"

    if (this.sub !== undefined) this.sub.unsubscribe();
    this.sub = this.cypherService.executeQuery(newQuery, {"address":address}).subscribe(e => {

      let chartPoints: ChartPoint[] = [];

      let total = 0;

      let running_total = chart_utils.valuesToRunningTotal(e.data.map(e => e[1])).splice(1);
      running_total = chart_utils.valuesToRunningTotal(running_total).splice(1);
      e.data.forEach((row, index) => {
        let time = row[0];
        let delta = row[1]/100000000.0;
        let current = total + delta;
        total += delta;
        chartPoints.push({x:time*1000, y: running_total[index]/100000000.0});

      });

      this.data = [{
        label: "Balance (Dash)", 
        fill: false, 
        data: chartPoints,
        borderWidth: 1,
        pointRadius: 0,
        pointHitRadius: 0,
        steppedLine: true,
        showLine: true
      }];
    });  

  }

  ngOnInit() {
  }

}

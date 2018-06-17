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

  enabled: boolean = true;;

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

      let sameTimeRemoved: any[] = [];
      let previousTime: number
      let sum: number;
      for (let i = 0; i < e.data.length; i++) {
        let row = e.data[i];
        let time = e.data[i][0];
        let value = e.data[i][1];
        if (i === 0) {
          //sameTimeRemoved.push(row);
          previousTime = time;
          sum = value;
        } else if (time > previousTime) {
          sameTimeRemoved.push([previousTime, sum]);
          previousTime = time;
          sum = value;
        } else {
          sum += value;
        }
      }
      if (sum !== undefined) sameTimeRemoved.push([previousTime, sum]);
      this.enabled = sameTimeRemoved.length >= 2;
      if (!this.enabled) return;
      let running_total = chart_utils.valuesToRunningTotal(sameTimeRemoved.map(e => e[1])).splice(1);//Deltas to values
      running_total = chart_utils.valuesToRunningTotal(running_total).splice(1);//Values to running total
      sameTimeRemoved.forEach((row, index) => {
        let time = row[0];
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

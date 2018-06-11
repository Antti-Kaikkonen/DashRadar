import { Component, Input, OnInit } from '@angular/core';

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


  @Input()
  set address(address: string) {
    this.data = undefined;
    
    let queryOutputTimes = 
    "MATCH" + "\n" +
	  "(a:Address {address:$address})<-[:ADDRESS]-(output:TransactionOutput)<-[:OUTPUT]-(:Transaction)-[:INCLUDED_IN]-(receivedBlock:Block)" + "\n" +
    "WITH" + "\n" +
	  "output, receivedBlock.time as receivedTime" + "\n" +
    "OPTIONAL MATCH" + "\n" +
	  "(output)-[:SPENT_IN]->(:TransactionInput)-[:INPUT]->(:Transaction)-[:INCLUDED_IN]->(spentBlock:Block)" + "\n" +
    "RETURN" + "\n" +
    "output.valueSat, receivedTime, spentBlock.time as spentTime;";

    this.cypherService.executeQuery(queryOutputTimes, {"address":address}).subscribe(e => {

      //TODO: messy. refactor
      let chartPoints: ChartPoint[] = [];

      let timeValueMap: Map<number, number> = new Map();
      e.data.forEach(row => {
        let outputValue = row[0];
        let outputReceivedTime = row[1];
        let outputSpentTime = row[2];
        let receivedTimeOldValue = timeValueMap.get(outputReceivedTime);
        if (receivedTimeOldValue !== undefined) {
          timeValueMap.set(outputReceivedTime, receivedTimeOldValue+outputValue);
        } else {
          timeValueMap.set(outputReceivedTime, outputValue);
        }

        if (outputSpentTime !== null && outputSpentTime !== undefined) {
          let spentTimeOldValue = timeValueMap.get(outputSpentTime);
          if (spentTimeOldValue !== undefined) {
            timeValueMap.set(outputSpentTime, spentTimeOldValue-outputValue);
          } else {
            timeValueMap.set(outputSpentTime, -outputValue);
          }
        } 

      });
      let arr: Array<[number, number]> = Array.from(timeValueMap);
      arr.sort(
        (a, b) => a[0]-b[0]
      );
      let xmin = arr[0][0];
      let xmax = arr[arr.length-1][0];
      let percentX = (xmax-xmin)/100;
      let lastIndex: number = 0;
      let balance = chart_utils.valuesToRunningTotal(arr.map(row => row[1])).splice(1);
      let ymin = undefined;
      let ymax = undefined;
      balance.forEach((e, index) => {
        if (ymin === undefined || e < ymin) ymin = e;
        if (ymax === undefined || e > ymax) ymax = e;
        arr[index][1] = e;
      });
      let ypercent = (ymax-ymin)/100;
      arr = arr.filter((value: [number, number], index: number, array: [number, number][]) =>{
        let first: boolean = index === 0;
        let last: boolean = index === array.length-1;
        let xDistanceToPrevious = Math.abs(array[index][0]-array[lastIndex][0]);
        let yDistanceToPrevious = Math.abs(array[index][1]-array[lastIndex][1]);
        let min: boolean = value[1] === ymin;
        let max: boolean = value[1] === ymax;
        if (arr.length > 5000 && !first && !last && !min && !max && xDistanceToPrevious < percentX/4 && yDistanceToPrevious < ypercent/2) {
          return false;
        } else {
          lastIndex = index;
          return true;
        }
      });
      let running_total = chart_utils.valuesToRunningTotal(arr.map(e => e[1])).splice(1);
      running_total.forEach((value: number, index: number) => {
        chartPoints.push({x: new Date(arr[index][0]*1000), y:value/100000000});
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

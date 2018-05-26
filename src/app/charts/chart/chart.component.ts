import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Params } from '@angular/router';
import * as moment from 'moment';

import { ChartDataService } from '../chart-data.service';
import { ChartSeries } from '../chartjs-types';
import { CypherResponse } from '../cypher-response';
import { CypherService } from '../cypher.service';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss']
})
export class ChartComponent implements OnInit {

  description: string;
  query: string;
  title: string;
  chartName: string;
  chartSeries: ChartSeries[];

  end_date = new FormControl(moment.utc().startOf('day'));

  start_date = new FormControl(moment(this.end_date.value).subtract(1, "year"));

  selectedPeriod: "year" | "month" | "week" | "all" = "year";

  sma: number = 1;


  from: moment.Moment = moment.utc(0);
  to: moment.Moment = moment.utc().startOf('day');

  constructor(private route: ActivatedRoute, 
    private chartData: ChartDataService,
    private cypherService: CypherService
  ) { }
  

  ngOnInit() {
    this.route.params
    .filter(params => params.chartName)
    .subscribe((params: Params) => {
      this.chartName = params.chartName;
      let data = this.chartData.charts[this.chartName];
      this.description = data.description;
      this.query = data.query;
      this.title = data.title;

      this.cypherService.executeQuery(this.query, {}).subscribe((cypherResponse: CypherResponse) => {
        this.chartSeries = data.cypherReader(cypherResponse);
        console.log("chartseries", this.chartSeries);
      });
      console.log("CHART DATA", data);
    })
  }

  selectedPeriodChanged(event) {
    let newEnd: moment.Moment = moment.utc().startOf('day');
    if (!(this.end_date.value as moment.Moment).isSame(newEnd)) {
      this.end_date.setValue(newEnd);
    }
    let newStart: moment.Moment;
    if (event === "year") {
      newStart = moment.utc().subtract(1, 'year').startOf('day');
    } else if (event === "month") {
      newStart = moment.utc().subtract(1, 'month').startOf('day');
    } else if (event === "week") {
      newStart = moment.utc().subtract(1, 'week').startOf('day');
    } else if (event === "all") {
      newStart = moment.utc(0);
    }
    if (!(this.start_date.value as moment.Moment).isSame(newStart)) {
      this.start_date.setValue(newStart);
    }
  }

}

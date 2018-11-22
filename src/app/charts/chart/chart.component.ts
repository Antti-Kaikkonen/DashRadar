import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Params } from '@angular/router';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

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

  query: string;
  title: string;

  chartLoading: boolean = true;
  error: string;

  chartSeries: ChartSeries[];

  end_date = new FormControl(moment.utc().startOf('day'));

  start_date = new FormControl(moment(this.end_date.value).subtract(1, "year"));

  selectedPeriod: "year" | "month" | "week" | "all" = "year";

  sma: number = 1;

  chartSubscription: Subscription;

  from: moment.Moment = moment.utc(0);
  to: moment.Moment = moment.utc().startOf('day');

  constructor(private route: ActivatedRoute, 
    private chartData: ChartDataService,
    private cypherService: CypherService
  ) { }
  

  ngOnDestroy() {
    if (this.chartSubscription !== undefined) {
      this.chartSubscription.unsubscribe();
    }
  }

  ngOnInit() {
    this.route.params
    .pipe(
      filter(params => params.chartName)
    )
    .subscribe((params: Params) => {
      let data = this.chartData.charts[params.chartName];

      this.query = data.query;
      this.title = data.title;
      this.chartLoading = true;
      this.error = undefined;
      this.chartSubscription = this.cypherService.executeQuery(data.query, {}).subscribe((cypherResponse: CypherResponse) => {
        this.chartSeries = data.cypherReader(cypherResponse);
        this.chartLoading = false;
      }, error => {
        this.error = "Error loading chart ("+error+")";
        this.chartLoading = false;
    
      });
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

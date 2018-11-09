import { isPlatformBrowser } from '@angular/common';
import { Component, ElementRef, Inject, Input, OnInit, PLATFORM_ID, SimpleChanges, ViewChild } from '@angular/core';
import * as moment from 'moment';
import { BaseChartDirective } from 'ng2-charts/ng2-charts';
import * as screenfull from 'screenfull';

import * as chart_utils from '../../utils/chart-utils';
import { ChartPoint, ChartSeries } from '../chartjs-types';


@Component({
  selector: 'app-time-series-chart',
  templateUrl: './time-series-chart.component.html',
  styleUrls: ['./time-series-chart.component.scss']
})
export class TimeSeriesChartComponent implements OnInit {

  _data: ChartSeries[];

  _sma: number[];

  @Input() sma: number | number[];

  @Input() data: ChartSeries[];

  @Input() from: moment.Moment;

  @Input() to: moment.Moment;

  @Input() title: string;

  @ViewChild(BaseChartDirective)
  myChart: BaseChartDirective;

  dynamicHeight: string = "100%";//"400px";

  isfullscreen: boolean = false;

  legend: boolean = false;

  chartColors: any[] = [
    {
      backgroundColor: 'hsl(240, 100%, 55%)',
      borderColor: 'hsl(240, 100%, 55%)'
    },
    {
      backgroundColor: 'hsl(0, 100%, 30%)',
      borderColor: 'hsl(0, 100%, 30%)'
    },
    {
      backgroundColor: 'hsl(120, 100%, 50%)',
      borderColor: 'hsl(120, 100%, 50%)'
    },
    {
      backgroundColor: 'hsl(300, 100%, 50%)',//purple
      borderColor: 'hsl(300, 100%, 50%)'
    },
    {
      backgroundColor: 'hsl(60, 100%, 45%)',//yellow
      borderColor: 'hsl(60, 100%, 45%)'
    },
    {
      backgroundColor: 'hsl(180, 100%, 55%)',//cyan
      borderColor: 'hsl(180, 100%, 55%)'
    }
  ];

  lineChartOptions:any = {
    title: {
      display: false,
      position: "top",
      text: "test"
    },

    responsive: true,
    maintainAspectRatio: false,
    elements: {
        line: {
            tension: 0
        }
    },
    scales: {
      xAxes: [{
        time: {
        },
        type: 'time',
        distribution: 'linear',
        scaleLabel: {
          display: false,
          labelString: 'asd'
        }
      }],
      yAxes: [{
        ticks: {
          bounds: 'ticks'
        },
        scaleLabel: {
          display: false,
          labelString: 'asd'
        }
      }]
    },
    tooltips: {
      mode: 'index',
      intersect: false
    },
    hover: {
      mode: 'index',
      intersect: false
    },
    pan: {
      enabled: false,
      mode: 'x',
    },
    
    zoom: {
      enabled: false,
      drag: false,
      mode: 'x',
      sensitivity: 3 
    },

    downsample: {
        enabled: true,
        threshold: 2000 // change this
    }
  };

  isBrowser: boolean;

  constructor(private hostElement: ElementRef,
    @Inject(PLATFORM_ID) platformId: string) { 
      this.isBrowser = isPlatformBrowser(platformId);
    }

  toggleFullScreen() {
    screenfull.toggle(this.hostElement.nativeElement);
  }

  ngOnInit() {
    if (this.isBrowser) {
      screenfull.onchange((event)=>{
        this.dynamicHeight = "100%";
        this.isfullscreen = screenfull.isFullscreen;
      });
    }
  }

  cc(e) {
    console.log("chartclick", this.myChart.chart);
  }


  ngOnChanges(changes: SimpleChanges) {

    if (changes.sma && (changes.sma.currentValue !== changes.sma.previousValue)) {
      if (changes.sma.currentValue === undefined || changes.sma.currentValue === null) {
        this._sma = [1];
      } else if (Array.isArray(changes.sma.currentValue)) {
        this._sma = changes.sma.currentValue;
      } else {
        this._sma = [changes.sma.currentValue];
      }
    }

    if (changes.title && (changes.title.currentValue !== changes.sma.previousValue)) {
      let newOptions = {... this.lineChartOptions};
      newOptions.title.text = this.title;
      if (this.title === undefined) {
        newOptions.title.display = false;
      } else {
        newOptions.title.display = true;
      }
      this.lineChartOptions = newOptions;
    }

    if (this.data !== undefined) {
      let allSeries: ChartSeries[] = this.data;
      let allSeriesNew: ChartSeries[] = [];
      this._sma.forEach((sma: number) => {
        let currentSeries = allSeries.map((singleSeries: ChartSeries) => {
          let runningTotalValues: number[] = singleSeries.data.map((chartPoint: ChartPoint) => chartPoint.y);
          runningTotalValues.unshift(0);
          let values = chart_utils.runningTotalToValues(runningTotalValues, sma).slice(0);
          let labels = singleSeries.data.slice(sma-1).map((chartPoint: ChartPoint) => chartPoint.x);
          let newData: ChartPoint[] = [];
          for (let i = 0; i < values.length; i++) {
            newData.push({x: labels[i], y: values[i]});
          }
          let converted: ChartSeries = {... singleSeries};
          converted.data = newData;
          return converted;
        });
        allSeriesNew = allSeriesNew.concat(currentSeries);
      });
      this.legend = (allSeries.length > 1);
      this._data = allSeriesNew;
      
    }

    if (this.from && this._data) {
      this._data.forEach((chartSeries: ChartSeries) => 
        chartSeries.data = chartSeries.data.filter((chartPoint: ChartPoint) => 
          (chartPoint.x as Date).getTime() >= this.from.utc().startOf('day').valueOf()
        )
      );
    }

    if (this.to && this._data) {
      this._data.forEach((chartSeries: ChartSeries) => 
        chartSeries.data = chartSeries.data.filter((chartPoint: ChartPoint) => 
          (chartPoint.x as Date).getTime() <= this.to.utc().startOf('day').valueOf()
        )
      );
    }

  }

}

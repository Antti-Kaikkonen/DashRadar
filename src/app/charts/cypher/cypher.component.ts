import 'cypher-codemirror';

import { DataSource } from '@angular/cdk/collections';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import * as CodeMirror from 'codemirror';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

import { environment } from '../../../environments/environment';
import { CypherService } from '../../charts/cypher.service';
import { CypherResponse } from '../cypher-response';

@Component({
  selector: 'app-cypher',
  templateUrl: './cypher.component.html',
  styleUrls: ['./cypher.component.scss']
})


export class CypherComponent implements OnInit {

  imageUrlPrefix = environment.chartJsImageURL;

  dataSource: ExampleDataSource;
  exampleDatabase = new ExampleDatabase();

  selectedTabIndex: number;

  query: string = "";

  cypherQueryURL: string;

  cypherLoading: boolean = false;

  result: CypherResponse;

  cypherError: {message?: string, fullname?: string, exception?: string, errors?: [any]};

  codeMirror: CodeMirror.Editor;

  title: string = "";
  title_enabled: boolean = false;

  x_axis_enabled: boolean = true;
  x_axis_title: string;
  x_axis_title_enabled: boolean = true;

  y_axis_enabled: boolean = true;
  y_axis_title: string;
  y_axis_title_enabled: boolean = true;


  legend_enabled: boolean = true;

  lineChartEnabled: boolean = true;

  point_styles: string[] = ['circle', 'triangle', 'rect', 'cross', 'star', 'crossRot'];


  barChartOptions: any = {
    
      title: {
        display: true,
        position: "top",
        text: "test"
      },

      responsive: true,
      maintainAspectRatio: false,
      scales: {
          xAxes: [{
              type: 'time',
              distribution: 'linear',
              scaleLabel: {
                display: true,
                labelString: 'asd'
              }
          }],
          yAxes: [{
            scaleLabel: {
              display: true,
              labelString: 'asd'
            }
          }]
      },

      pan: {
        enabled: true,
        mode: 'x',
      },
      
      zoom: {
        enabled: true,
        drag: false,
        mode: 'x',
        sensitivity: 3 
      }
  };
  lineChartOptions:any = {

      title: {
        display: true,
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
              display: true,
              type: 'time',
              distribution: 'linear',
              scaleLabel: {
                display: true,
                labelString: 'asd'
              }
          }],
          yAxes: [{
            display: true,
            scaleLabel: {
              display: true,
              labelString: 'asd'
            }
          }]
      },

      pan: {
        enabled: true,
        mode: 'x',
      },
      
      zoom: {
        enabled: true,
        drag: false,
        mode: 'x',
        sensitivity: 3 
      }
  };

  pieChartOptions:any = {
      title: {
        display: true,
        position: "top",
        text: "test"
      },
      responsive: true,
      maintainAspectRatio: false
  };

  chartData: any[];
  categoricalData: any[];

  categories: string[];

  settingsForm: FormGroup;

  chartURLQuery: string;
  pieChartURLQuery: string;

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

  customW: number = 250;
  customH: number = 200;

  constructor(private route: ActivatedRoute, 
    public cypherService: CypherService,
    private metaService: Meta,
    private titleService: Title) { 

  }

  ngOnDestroy() {
    this.metaService.removeTag('name="description"');
  }

  ngOnInit() {
    this.titleService.setTitle("Dash Data Explorer | DashRadar");
    this.metaService.removeTag('name="description"');
    this.metaService.addTag({
      name: "description", 
      content: "Search the blockchain using the Neo4j cypher query language."
    });
    //let defaultQuery = "MATCH (b:Block)<-[:INCLUDED_IN]-(tx:Transaction) with b.time/86400 as epoc_date, count(tx) as tx_count return epoc_date*86400 as date, tx_count ORDER BY date;"
    //let defaultQuery = decodeURIComponent("MATCH %0A%09(b:Block)<-[:INCLUDED_IN]-(tx:Transaction {pstype: 2})-[:OUTPUT]->(txout:TransactionOutput)%2F%2Fonly include transactions with pstype%3D2 (privatesend) %0AWITH %2F%2FTo aggregate results for each day%0A%09b.time%2F86400 as days_since_epoch, %2F%2Fconvert unix timestamp to days since jan 1 1970%0A%09count(tx) as ps_count, %2F%2Fcount number privatesend transactions per day%0A%09sum(txout.valueSat)%2F100000000.0 as total_dash %2F%2Fcount dash volume in privatesend transactions per day%0ARETURN %0A%09days_since_epoch*86400 as date, %2F%2Fdate as unix timestamp%0A%09total_dash%2Fps_count as `average ps transaction amount (dash)`;%2F%2Faverage privatesend transaction amount");
    let defaultQuery = decodeURIComponent("MATCH%20%0A%09(d%3ADay)-%5B%3ALAST_BLOCK%5D-%3E(b%3ABlockChainTotals)%0AWITH%0A%09d.day%20as%20date%2C%0A%09b%0AORDER%20BY%20%0A%09date%0AWITH%20%0A%09collect(date)%20as%20dates%2C%0A%090%2Bcollect(b.total_fees_sat)%20as%20fees%0AUNWIND%20%0A%09range(1%2C%20length(fees)-1)%20as%20i%0ARETURN%0A%09dates%5Bi-1%5D*24*60*60%20as%20date%2C%0A%09(fees%5Bi%5D-fees%5Bi-1%5D)%2F100000000.0%20as%20%60Fees%20(Dash)%60%3B");
    this.query = defaultQuery;
    this.route
      .queryParams
      .subscribe(params => {
        if (params['query']) {
          this.query = params['query'];
          this.metaService.removeTag('name="description"');
          this.metaService.addTag({
            name: "description", 
            content: this.query
          });
        } else {
          this.query = defaultQuery;
        }
    });

    this.dataSource = new ExampleDataSource(this.exampleDatabase);
  }

  ngAfterViewInit() {
    let textarea = <HTMLTextAreaElement> document.getElementById("codemirror-area");
    this.codeMirror = CodeMirror.fromTextArea(textarea, {
      value: "MATCH (t:Transaction) RETURN t LIMIT 5;\n",
      lineNumbers: true,
      viewportMargin: Infinity,
      mode:  "application/x-cypher-query",
      theme: "cypher",

    });
    this.codeMirror.getWrapperElement().setAttribute("style", "height:auto;");
    this.codeMirror.setValue(this.query);
  }  

  executeQuery() {
    this.result = undefined;
    this.chartData = undefined;
    this.cypherError = undefined;
    this.exampleDatabase.clear();
  	//console.log("executing query");
    let query = this.codeMirror.getValue();
    this.cypherLoading = true;
  	this.cypherService.executeQuery(query, {})
    .finally(() => {
      this.cypherLoading = false;
    })
    .subscribe((response: CypherResponse) => {

      this.x_axis_title = response.columns[0];
      this.y_axis_title = response.columns[1];

      this.settingsForm = new FormGroup ({
        legend_enabled:  new FormControl(true),
        title_enabled:   new FormControl(this.title_enabled),
        title:           new FormControl({value: this.title, disabled: !this.title_enabled}),
        x_axis_enabled: new FormControl(this.x_axis_enabled),
        x_title_enabled: new FormControl(this.x_axis_title_enabled),
        x_title:         new FormControl({value: this.x_axis_title, disabled: !this.x_axis_title_enabled}),
        y_axis_enabled: new FormControl(this.y_axis_enabled),
        y_title_enabled: new FormControl(this.y_axis_title_enabled),
        y_title:         new FormControl({value: this.y_axis_title, disabled: !this.y_axis_title_enabled})
      });

      this.settingsForm.get("title_enabled").valueChanges.subscribe((value) => value ? this.settingsForm.get("title").enable() : this.settingsForm.get("title").disable());
      this.settingsForm.get("x_title_enabled").valueChanges.subscribe((value) => value ? this.settingsForm.get("x_title").enable() : this.settingsForm.get("x_title").disable());
      this.settingsForm.get("y_title_enabled").valueChanges.subscribe((value) => value ? this.settingsForm.get("y_title").enable() : this.settingsForm.get("y_title").disable());

      this.settingsForm.valueChanges
      .debounceTime(500) // wait .5 sec after the last event before emitting last event
      .distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)) 
      .subscribe((value) => {
        this.legend_enabled = value.legend_enabled;
        this.title = value.title;
        this.title_enabled = value.title_enabled;
        this.x_axis_title = value.x_title;
        this.x_axis_title_enabled = value.x_title_enabled;
        this.y_axis_title = value.y_title;
        this.y_axis_title_enabled = value.y_title_enabled;
        this.x_axis_enabled = value.x_axis_enabled;
        this.y_axis_enabled = value.y_axis_enabled;
        this.updateChart();
        this.updateChartImageURLs();
      });


      this.result = response;
      response.data.forEach(row => this.exampleDatabase.addRow(row));
      let allNumbers = response.data.every(row => typeof row[0] === "number");
      let convertToDate = allNumbers && (response.columns[0].toLowerCase() === "date" || response.columns[0].toLowerCase() === "time");
      this.chartData = this.cypherResponseToChartJSChart(response, convertToDate, allNumbers);
      if (convertToDate) {
        this.lineChartEnabled = true;
        this.lineChartOptions.scales.xAxes[0].type = "time";
        this.barChartOptions.scales.xAxes[0].type = "time";
      } else {
        this.categoricalBarChartData = JSON.parse(JSON.stringify(this.chartData));
        this.categoricalBarChartData.forEach(series => series.data = series.data.map(chartpoint => chartpoint.y));
        this.barChartOptions.scales.xAxes[0].type = "category";
        if (allNumbers) {
          this.lineChartEnabled = true;
          this.lineChartOptions.scales.xAxes[0].type = "linear";
        } else {
          this.lineChartEnabled = false;
          this.lineChartOptions.scales.xAxes[0].type = "category";
        }
      }
      this.categoricalData = [{
        data: response.data.map(row => row[1]),
        borderWidth: 0,
        borderColor: "black"//not working atm
      }];

      this.categories = response.data.map(row => convertToDate ? new Date(row[0]*1000).toDateString() : row[0]);

      this.updateChartImageURLs();
      this.updateChart();
    },
    (error: any) => this.cypherError = JSON.parse(error._body));
  }

  categoricalBarChartData: any;

  ngDoCheck() {
    if (this.codeMirror !== undefined) {
      this.query = this.codeMirror.getValue();
      this.cypherQueryURL = encodeURIComponent(this.query);
    }
  }


  private rowsToDataArray(rows: Array<any>, convertToDate?: boolean, sortRows?: boolean) {
      let data;
      if (convertToDate || sortRows) {
        data = rows.sort((rowA, rowB) => rowA[0]-rowB[0]);
      } else {
        data = rows;
      }
      return rows.map(row => {
        return {x: convertToDate ? new Date(row[0]*1000) : row[0], y: row[1]};
      });
  }

  cypherResponseToChartJSChart(response: CypherResponse, convertToDate?: boolean, sortRows?: boolean) {
    response.columns.map((columnName: string) => columnName);
    let result: Array<any> = [];
    if (response.columns.length === 3) {

      let groupedBySeries = response.data.reduce((map, row) => {
        if (map[row[2]] === undefined) {
          map[row[2]] = [row];
        } else {
          map[row[2]].push(row);
        }
        return map;
      }, {});
      Object.keys(groupedBySeries).forEach((seriesName: string, index: number) => {
        result.push({
          label: seriesName,
          fill: false,
          borderWidth: 1,
          pointRadius: 1,
          pointHitRadius: 5, 
          //pointStyle: this.point_styles[index%this.point_styles.length],
          data: this.rowsToDataArray(groupedBySeries[seriesName], convertToDate, sortRows)
        });
      });
      return result;
    } else if (response.columns.length === 2) {

      result.push(
        {
          label: "Data",
          //lineTension: 0,
          fill: false,
          borderWidth: 1,
          pointRadius: 1,
          pointHitRadius: 5,
          //pointStyle: this.point_styles[0],
          data: this.rowsToDataArray(response.data, convertToDate, sortRows)
        }
      );
      return result;
    }

  }

  encodeQueryData(data) {
     let ret = [];
     for (let d in data)
       ret.push(encodeURIComponent(d) + '=' + encodeURIComponent(data[d]));
     return ret.join('&');
  }

  cleanQuery(query: string): string {
    return query.replace(/\s+/g, ' ').replace('\n', ' ').trim();
  }

  updateChartImageURLs() {
    let chartURLData: any = {
      query: this.cleanQuery(this.query)
    };
    if (this.legend_enabled) {
      chartURLData.legend = true
    }
    if (this.title_enabled) {
      chartURLData.title = this.title;
    }
    if (!this.x_axis_enabled) {
      chartURLData.x_axis = false;
    }
    if (!this.y_axis_enabled) {
      chartURLData.y_axis = false;
    }
    if (this.x_axis_title_enabled) {
      chartURLData.x_title = this.x_axis_title;
    }
    if (this.y_axis_title_enabled) {
      chartURLData.y_title = this.y_axis_title;
    }

    let pieURLData: any = {
      query: this.cleanQuery(this.query)
    };
    if (this.legend_enabled) {
      pieURLData.legend = true
    }
    if (this.title_enabled) {
      pieURLData.title = this.title;
    }
    this.chartURLQuery = this.encodeQueryData(chartURLData);
    this.pieChartURLQuery = this.encodeQueryData(pieURLData);
  }

  updateChart() {
    this.lineChartOptions.title.text = this.title;
    this.lineChartOptions.title.display = this.title_enabled;
    this.lineChartOptions.scales.xAxes[0].scaleLabel.labelString = this.x_axis_title;
    this.lineChartOptions.scales.xAxes[0].scaleLabel.display = this.x_axis_title_enabled;
    this.lineChartOptions.scales.yAxes[0].scaleLabel.labelString = this.y_axis_title;
    this.lineChartOptions.scales.yAxes[0].scaleLabel.display = this.y_axis_title_enabled;
    this.lineChartOptions.scales.xAxes[0].display = this.x_axis_enabled;
    this.lineChartOptions.scales.yAxes[0].display = this.y_axis_enabled;
    this.lineChartOptions = {... this.lineChartOptions};


    this.barChartOptions.title.text = this.title;
    this.barChartOptions.title.display = this.title_enabled;
    this.barChartOptions.scales.xAxes[0].scaleLabel.labelString = this.x_axis_title;
    this.barChartOptions.scales.xAxes[0].scaleLabel.display = this.x_axis_title_enabled;
    this.barChartOptions.scales.yAxes[0].scaleLabel.labelString = this.y_axis_title;
    this.barChartOptions.scales.yAxes[0].scaleLabel.display = this.y_axis_title_enabled;
    this.barChartOptions.scales.xAxes[0].display = this.x_axis_enabled;
    this.barChartOptions.scales.yAxes[0].display = this.y_axis_enabled;
    this.barChartOptions = {... this.barChartOptions};

    this.pieChartOptions.title.text = this.title;
    this.pieChartOptions.title.display = this.title_enabled;
    this.pieChartOptions = {... this.pieChartOptions};
  }

}


export class ExampleDatabase {
  /** Stream that emits whenever the data has been modified. */
  dataChange: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  get data(): any[] { return this.dataChange.value; }

  constructor() {
  }

  /** Adds a new user to the database. */
  addRow(row: any) {
    const copiedData = this.data.slice();
    copiedData.push(row);
    this.dataChange.next(copiedData);
  }


  clear() {
    this.dataChange.next([]);
  }

}


export class ExampleDataSource extends DataSource<any> {
  _filterChange = new BehaviorSubject('');
  get filter(): string { return this._filterChange.value; }
  set filter(filter: string) { this._filterChange.next(filter); }

  constructor(private _exampleDatabase: ExampleDatabase) {
    super();
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<any[]> {
    const displayDataChanges = [
      this._exampleDatabase.dataChange
    ];

    return Observable.merge(...displayDataChanges).map(() => {
      let filteredData = this._exampleDatabase.data.slice();

      return filteredData;
    });
  }

  disconnect() {}
}  

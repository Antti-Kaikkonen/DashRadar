import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { Meta, Title } from '@angular/platform-browser';
import * as moment from 'moment';

import { CypherService } from '../../charts/cypher.service';
import { ChartPoint, ChartSeries } from '../chartjs-types';
import { CypherResponse } from '../cypher-response';

@Component({
  selector: 'app-charts-dashboard',
  templateUrl: './charts-dashboard.component.html',
  styleUrls: ['./charts-dashboard.component.scss'],
  providers: [{ provide: MAT_DATE_LOCALE, useValue: 'fi-FI' }]
})
export class ChartsDashboardComponent implements OnInit {

  all_data_query = "MATCH%0A%09(d%3ADay)-%5B%3ALAST_BLOCK%5D-%3E(n%3ABlockChainTotals)%0ARETURN%0A%09d.day*60*60*24%20as%20date%2C%0A%09n.total_fees_sat%2C%0A%09n.privatesend_mixing_0_01_count%2C%0A%09n.tx_count%2C%0A%09n.total_transaction_size%2C%0A%09n.privatesend_mixing_10_0_count%2C%0A%09n.privatesend_tx_count%2C%0A%09n.total_block_size%2C%0A%09n.privatesend_mixing_100_0_count%2C%0A%09n.output_count%2C%0A%09n.input_count%2C%0A%09n.total_block_rewards_sat%2C%0A%09n.privatesend_mixing_1_0_count%2C%0A%09n.total_output_volume_sat%2C%0A%09n.privatesend_mixing_0_1_count%2C%0A%09n.height%0AORDER%20BY%20date%3B";

  end_date = new FormControl(moment.utc().startOf('day'));

  start_date = new FormControl(moment(this.end_date.value).subtract(1, "year"));

  selectedPeriod: "year" | "month" | "week" | "all" = "year";

  charts: {data: ChartSeries[], sma: number, title: string}[] = [];

  constructor(public cypherService: CypherService,
    private metaService: Meta,
    private titleService: Title) {
      titleService.setTitle("Dash Charts | DashRadar");
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


  startFilter = (d: moment.Moment): boolean => {
    return d.utc(true) <= this.end_date.value;
  }

  endFilter = (d: moment.Moment): boolean => {
    return d.utc(true) >= this.start_date.value;
  }

  dateRangeToPeriod() {
    let beginningOfToday = moment.utc().startOf('day');
    if (!(this.end_date.value as moment.Moment).isSame(beginningOfToday)) {
      return undefined;
    }
    let yearAgo = moment.utc().subtract(1, 'year').startOf('day');
    let monthAgo = moment.utc().subtract(1, 'month').startOf('day');
    let weekAgo = moment.utc().subtract(1, 'week').startOf('day');
    if ((this.start_date.value as moment.Moment).isSame(yearAgo)) return "year";
    if ((this.start_date.value as moment.Moment).isSame(monthAgo)) return "month";
    if ((this.start_date.value as moment.Moment).isSame(weekAgo)) return "week";
    if ((this.start_date.value as moment.Moment).isSame(moment.utc(0))) return "all";
  }

  ngOnInit() {

    this.start_date.valueChanges.subscribe((e: moment.Moment) => {
      this.start_date.value.utc(true);
      this.selectedPeriod = this.dateRangeToPeriod();
    });

    this.end_date.valueChanges.subscribe((e: moment.Moment) => {
      this.end_date.value.utc(true);
      this.selectedPeriod = this.dateRangeToPeriod();
    });


    this.cypherService.executeQuery(decodeURIComponent(this.all_data_query), {})
      .subscribe((response: CypherResponse) => {
        this.charts.push({data: this.extractTransactionsPerDayData(response), sma: 1, title: "Transactions per day"});
        this.charts.push({data: this.extractFeesPerDayData(response), sma: 1, title: "Fees per day (Dash)"});
        this.charts.push({data: this.extractFeesPerByteData(response), sma: 1, title: "Average fee per byte (Duffs)"});
        this.charts.push({data: this.extractPrivatesendTransactionsPerDayData(response), sma: 1, title: "Privatesend transactions per day"});
        this.charts.push({data: this.extractMixingData(response), sma: 1, title: "Mixing transactions per day"});
        this.charts.push({data: this.extractBlockRewardsData(response), sma: 1, title: "Block rewards per day (Dash)"});
        this.charts.push({data: this.extractOutputValueData(response), sma: 1, title: "Output volume per day (Dash)"});
        this.charts.push({data: this.extractBlockchainGrowthData(response), sma: 1, title: "Blockchain growth per day (MB)"});
        this.charts.push({data: this.extractUtxoData(response), sma: 1, title: "Unspent transaction output set size"});
        this.charts.push({data: this.extractInputOutputData(response), sma: 1, title: "Average number of inputs and outputs per transaction"});
      });

  }

  private extractTransactionsPerDayData(cypherResponse: CypherResponse): ChartSeries[] {
    let transactions_per_day_data = this.extractColumns(cypherResponse, ["n.tx_count"]);
    transactions_per_day_data[0].label = "Transactions";
    return transactions_per_day_data;
  }

  private extractFeesPerDayData(cypherResponse: CypherResponse): ChartSeries[] {
    let fees_per_day_data = this.extractColumns(cypherResponse, ["n.total_fees_sat"]);
    fees_per_day_data[0].data.forEach(e => e.y = e.y / 100000000.0);
    fees_per_day_data[0].label = "Fees per day (DASH)";
    return fees_per_day_data;
  }

  private extractFeesPerByteData(cypherResponse: CypherResponse): ChartSeries[] {
    let fees_per_byte_data = this.extractColumns(cypherResponse, ["n.total_fees_sat", "n.total_transaction_size"]);
    let total_fee_data = fees_per_byte_data[0].data.map((e: ChartPoint) => e.y);
    total_fee_data.unshift(0);
    let tx_size_data = fees_per_byte_data[1].data.map((e: ChartPoint) => e.y);
    tx_size_data.unshift(0);
    let fees_per_kb = [];
    for (let i = 1; i < total_fee_data.length; i++) {
      let previous = i > 1 ?  fees_per_kb[i-2] : 0;
      fees_per_kb.push(previous + (1.0*total_fee_data[i]-total_fee_data[i-1])/(tx_size_data[i]-tx_size_data[i-1]));
    }
    for (let i = 0; i < fees_per_kb.length; i++) {
      fees_per_byte_data[0].data[i].y = fees_per_kb[i];
    }
    fees_per_byte_data[0].label = "Average fee per byte (Duffs)";
    fees_per_byte_data = fees_per_byte_data.slice(0, 1);
    return fees_per_byte_data;
  }

  private extractPrivatesendTransactionsPerDayData(cypherResponse: CypherResponse): ChartSeries[] {
    let privatesend_transactions_per_day_data = this.extractColumns(cypherResponse, ["n.privatesend_tx_count"]);
    privatesend_transactions_per_day_data[0].label = "Privatesend transactions";
    return privatesend_transactions_per_day_data;
  }

  private extractMixingData(cypherResponse: CypherResponse): ChartSeries[] {
    let mixing_data = this.extractColumns(cypherResponse, ["n.privatesend_mixing_100_0_count", "n.privatesend_mixing_10_0_count", "n.privatesend_mixing_1_0_count", "n.privatesend_mixing_0_1_count", "n.privatesend_mixing_0_01_count"]);
    mixing_data[0].label = "Mixing 100.0";
    mixing_data[1].label = "Mixing 10.0";
    mixing_data[2].label = "Mixing 1.0";
    mixing_data[3].label = "Mixing 0.1";
    mixing_data[4].label = "Mixing 0.01";
    return mixing_data;
  }

  private extractBlockRewardsData(cypherResponse: CypherResponse): ChartSeries[] {
    let block_rewards_per_day = this.extractColumns(cypherResponse, ["n.total_block_rewards_sat"]);
    block_rewards_per_day[0].data.forEach(e => e.y = e.y / 100000000.0);
    block_rewards_per_day[0].label = "Block rewards (Dash)";
    return block_rewards_per_day;
  }

  private extractOutputValueData(cypherResponse: CypherResponse): ChartSeries[] {
    let total_output_value_data = this.extractColumns(cypherResponse, ["n.total_output_volume_sat"]);
    total_output_value_data[0].data.forEach(e => e.y = e.y / 100000000.0);
    total_output_value_data[0].label = "Output volume (Dash)";
    return total_output_value_data;
  }

  private extractBlockchainGrowthData(cypherResponse: CypherResponse): ChartSeries[] {
    let daily_block_size_data = this.extractColumns(cypherResponse, ["n.total_block_size"]);
    daily_block_size_data[0].data.forEach(e => e.y = e.y / 1000000.0);
    daily_block_size_data[0].label = "Blockchain growth (MB)";
    return daily_block_size_data;
  }

  private extractUtxoData(cypherResponse: CypherResponse): ChartSeries[] {
    let utxo_data = this.extractColumns(cypherResponse, ["n.output_count", "n.input_count", "n.height"]);
    let output_counts = utxo_data[0].data.map((e: ChartPoint) => e.y);
    let input_counts = utxo_data[1].data.map((e: ChartPoint) => e.y);
    let heights = utxo_data[2].data.map((e: ChartPoint) => e.y);
    let utx_counts = [];
    for (let i = 0; i < input_counts.length; i++) {
      utx_counts.push(output_counts[i] - input_counts[i] + heights[i]);
    }
    for (let i = 1; i < utx_counts.length; i++) {
      utx_counts[i] = utx_counts[i - 1] + utx_counts[i];
    }
    for (let i = 0; i < utx_counts.length; i++) {
      utxo_data[0].data[i].y = utx_counts[i];
    }
    utxo_data[0].label = "UTXO count";
    let daily_utxo_data = utxo_data.slice(0, 1);
    return daily_utxo_data;
  }

  private extractInputOutputData(cypherResponse: CypherResponse): ChartSeries[] {
    let input_output_data = this.extractColumns(cypherResponse, ["n.input_count", "n.output_count", "n.tx_count"]);
    input_output_data[0].label = "Inputs per transaction";
    input_output_data[1].label = "Outputs per transaction";
    let inputs_per_transaction: number[] = [];
    let outputs_per_transaction: number[] = [];
    for (let i = 0; i < input_output_data[0].data.length; i++) {
      let input_count = input_output_data[0].data[i].y - (i===0 ? 0 : input_output_data[0].data[i-1].y);
      let output_count = input_output_data[1].data[i].y - (i===0 ? 0 : input_output_data[1].data[i-1].y);
      let tx_count = input_output_data[2].data[i].y - (i===0 ? 0 : input_output_data[2].data[i-1].y);
      inputs_per_transaction.push(1.0 * input_count / tx_count);
      outputs_per_transaction.push(1.0 * output_count / tx_count);
    }
    for (let i = 1; i < inputs_per_transaction.length; i++) {
      inputs_per_transaction[i] = inputs_per_transaction[i-1]+inputs_per_transaction[i];
      outputs_per_transaction[i] = outputs_per_transaction[i-1]+outputs_per_transaction[i];
    }
    for (let i = 0; i < inputs_per_transaction.length; i++) {
      input_output_data[0].data[i].y = inputs_per_transaction[i];
      input_output_data[1].data[i].y = outputs_per_transaction[i];
    } 
    input_output_data = input_output_data.slice(0, 2);
    return input_output_data;
  }

  private extractColumns(response: CypherResponse, columns: string[]): ChartSeries[] {
    return columns.map(column => response.columns.indexOf(column))
      .filter(columnIndex => columnIndex >= 0)
      .map(columnIndex => {
        let column = response.columns[columnIndex];
        let data = response.data.map(row => {
          return { x: new Date(row[0] * 1000), y: row[columnIndex] }
        });
        return {
          label: column,
          fill: false,
          borderWidth: 1,
          pointRadius: 1,
          pointHitRadius: 50,
          data: data
        };
      });
  }


}

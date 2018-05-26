import * as chart_utils from '../utils/chart-utils';
import { ChartSeries } from './chartjs-types';

export class CypherResponse {

  constructor(public columns?: string[],
    public data?: object[]) {

  }


  extractColumnsToRunningTotal(columns: string[]): ChartSeries[] {
    return columns.map(column => this.columns.indexOf(column))
      .filter(columnIndex => columnIndex >= 0)
      .map(columnIndex => {
        let column = this.columns[columnIndex];

        let data = this.data.map((row, index: number) => {
          return { x: new Date(row[0] * 1000), y: row[columnIndex] }
        });

        let runningTotalValues = chart_utils.valuesToRunningTotal(data.map(e => e.y));
        for (let i = 1; i < runningTotalValues.length; i++) {
          data[i-1].y = runningTotalValues[i];
        }
         
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

  extractColumns(columns: string[]): ChartSeries[] {
    return columns.map(column => this.columns.indexOf(column))
      .filter(columnIndex => columnIndex >= 0)
      .map(columnIndex => {
        let column = this.columns[columnIndex];
        let data = this.data.map(row => {
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

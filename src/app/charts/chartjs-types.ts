export interface ChartSeries {
  label: string,
  fill: boolean,
  borderWidth?: number,
  pointRadius?: number,
  pointHitRadius?: number,
  pointStyle?: string,
  steppedLine?: boolean,
  showLine?: boolean,
  data: ChartPoint[]
}


export interface ChartPoint {
  x: number | Date,
  y: number
}
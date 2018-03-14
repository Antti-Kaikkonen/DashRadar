export function rowsToDataArray(rows: Array<any>, convertToDate?: boolean) {
  let data;
  if (convertToDate) {
    data = rows.sort((rowA, rowB) => rowA[0] - rowB[0]);
  } else {
    data = rows;
  }
  return rows.map(row => {
    return { x: convertToDate ? new Date(row[0] * 1000) : row[0], y: row[1] };
  });
}


export function runningTotalToValues(runningTotal: number[], sma?: number): number[] {
  let result: number[] = [];
  if (sma === undefined) sma = 1;
  if (sma < 1) return result;
  for (let i = sma; i < runningTotal.length; i++) {
    result.push((runningTotal[i]-runningTotal[i-sma])/(1.0*sma));
  }
  return result;
}


export function valuesToRunningTotal(values: number[]): number[] {
  let result: number[] = [];
  result.push(0);
  values.forEach((value: number, index: number) => result.push(result[result.length - 1] + value));
  return result;
}

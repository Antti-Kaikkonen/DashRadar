import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { ChartSeries } from './chartjs-types';
import { CypherResponse } from './cypher-response';


@Injectable({
  providedIn: 'root'
})
export class ChartDataService {

  private charjsImageURL: string = environment.chartJsImageURL;

  charts: { 
    [name:string]:
    {
      query?: string, 
      previewUrl?: string, 
      title?: string, 
      description?: string,
      cypherReader?: (cypherResponse:CypherResponse)=>ChartSeries[]
    }; 
  } = {
    'transactions-per-day':{
      query:
      "MATCH (d:Day)-[:LAST_BLOCK]->(:Block)-[:BLOCKCHAIN_TOTALS]->(b:BlockChainTotals)\n"+
      "WITH d.day*86400 as time, b.tx_count as txcount \n"+
      "RETURN time, txcount as `Number of transactions`\n"+
      "ORDER BY time;",
      previewUrl: this.charjsImageURL+"/line.png?query=MATCH%20(d%3ADay)-%5B%3ALAST_BLOCK%5D-%3E(%3ABlock)-%5B%3ABLOCKCHAIN_TOTALS%5D-%3E(b%3ABlockChainTotals)%20WITH%20d.day*86400%20as%20time%2C%20b.tx_count%20as%20txcount%20ORDER%20BY%20time%20WHERE%20time%20%3E%3D%20(datetime.truncate(%27day%27%2C%20datetime())-duration(%7B%20years%3A%201%7D)).epochSeconds%20WITH%20collect(time)%20as%20times%2C%20collect(txcount)%20as%20txcounts%20UNWIND%20range(1%2C%20length(txcounts)-1)%20as%20i%20RETURN%20times%5Bi-1%5D%20as%20time%2C%20(txcounts%5Bi%5D-txcounts%5Bi-1%5D)%20as%20%60Transactions%20per%20day%60%3B&x_axis=false&y_axis=false&width=320&height=180",
      title: "Transactions per day",
      description: "",
      cypherReader: (cypherResponse:CypherResponse)=>{return cypherResponse.extractColumns(["Number of transactions"])}
    },

    'median-transaction-fee':{
      query: 
      "MATCH (d:Day)-[:DAILY_PERCENTILES]->(dp:DailyPercentiles {percentile:0.5})\n"+
      "RETURN d.day*86400 as time, dp.tx_fee_sat/100000000.0 as `Median transaction fee (Dash)`\n"+
      "ORDER BY time;",
      previewUrl: this.charjsImageURL+"/line.png?query=MATCH%20(dp%3ADailyPercentiles%20%7Bpercentile%3A0.5%7D)%3C-%5B%3ADAILY_PERCENTILES%5D-(d%3ADay)%20WHERE%20d.day*86400%20%3E%3D%20(datetime.truncate(%27day%27%2C%20datetime())-duration(%7B%20years%3A%201%7D)).epochSeconds%20RETURN%20d.day*86400%20as%20time%2C%20dp.tx_fee_sat%20as%20%60Median%20transaction%20fee%20(Duffs)%60%20ORDER%20BY%20time%3B&width=320&height=180&x_axis=false&y_axis=false",
      title: "Median transaction fee (Dash)",
      description: "",
      cypherReader: (cypherResponse:CypherResponse)=>cypherResponse.extractColumnsToRunningTotal(["Median transaction fee (Dash)"])
    },


    'average-transaction-fee':{
      query: 
      "MATCH (d:Day)-[:LAST_BLOCK]->(b:Block)-[:BLOCKCHAIN_TOTALS]->(bct:BlockChainTotals)\n"+
      "WITH d.day as date, b, bct\n"+
      "ORDER BY date\n"+
      "WITH collect(date) as dates, 0+collect(bct.total_fees_sat) as fees, 0+collect(bct.tx_count) as tx_counts, 0+collect(b.height) as heights\n"+
      "UNWIND range(1, length(dates)) as i\n"+
      "WITH dates[i-1]*24*60*60 as date, (fees[i]-fees[i-1])/100000000.0 as fees, tx_counts[i]-tx_counts[i-1] as tx_count, heights[i]-heights[i-1] as coinbase_tx_count\n"+
      "RETURN date, fees/(tx_count-coinbase_tx_count) as `Average transaction fee (DASH)`",
      /*"MATCH (d:Day)-[:LAST_BLOCK]->(b:Block)-[:BLOCKCHAIN_TOTALS]->(bct:BlockChainTotals)\n"+
      "WITH d.day as date, b, bct\n"+
      "ORDER BY date\n"+
      "WITH collect(date) as dates, collect(bct.total_fees_sat) as fees, collect(bct.tx_count) as tx_counts, collect(b.height) as heights\n"+
      "UNWIND range(1, length(dates)-1) as i\n"+
      "WITH dates[i-1]*24*60*60 as date, (fees[i]-fees[i-1])/100000000.0 as fees, tx_counts[i]-tx_counts[i-1] as tx_count, heights[i]-heights[i-1] as coinbase_tx_count\n"+
      "RETURN date, fees/(tx_count-coinbase_tx_count) as `Average transaction fee (DASH)`;",*/
      previewUrl: this.charjsImageURL+"/line.png?query=MATCH%20(d%3ADay)-%5B%3ALAST_BLOCK%5D-%3E(b%3ABlock)-%5B%3ABLOCKCHAIN_TOTALS%5D-%3E(bct%3ABlockChainTotals)%20WHERE%20d.day*86400%20%3E%3D%20(datetime.truncate(%27day%27%2C%20datetime())-duration(%7B%20years%3A%201%7D)).epochSeconds%20WITH%20d.day%20as%20date%2C%20b%2C%20bct%20ORDER%20BY%20date%20WITH%20collect(date)%20as%20dates%2C%20collect(bct.total_fees_sat)%20as%20fees%2C%20collect(bct.tx_count)%20as%20tx_counts%2C%20collect(b.height)%20as%20heights%20UNWIND%20range(1%2C%20length(dates)-1)%20as%20i%20WITH%20dates%5Bi-1%5D*24*60*60%20as%20date%2C%20(fees%5Bi%5D-fees%5Bi-1%5D)%2F100000000.0%20as%20fees%2C%20tx_counts%5Bi%5D-tx_counts%5Bi-1%5D%20as%20tx_count%2C%20heights%5Bi%5D-heights%5Bi-1%5D%20as%20coinbase_tx_count%20RETURN%20date%2C%20fees%2F(tx_count-coinbase_tx_count)%20as%20%60Fees%20per%20transaction%20(DASH)%60%3B&x_axis=false&y_axis=false&width=320&height=180",
      title: "Average transaction fee (Dash)",
      cypherReader: (cypherResponse:CypherResponse)=>cypherResponse.extractColumnsToRunningTotal(["Average transaction fee (DASH)"]),
      description: ""
    },

    
    'median-transaction-fee-per-byte':{
      query: 
      "MATCH (d:Day)-[:DAILY_PERCENTILES]->(dp:DailyPercentiles {percentile:0.5})\n"+
      "RETURN d.day*86400 as time, dp.tx_fee_per_byte_sat as `Median transaction fee per byte (Duffs)`\n"+
      "ORDER BY time;",
      previewUrl: this.charjsImageURL+"/line.png?query=MATCH%20(d%3ADay)-%5B%3ADAILY_PERCENTILES%5D-%3E(dp%3ADailyPercentiles%20%7Bpercentile%3A0.5%7D)%20WHERE%20d.day*86400%20%3E%3D%20(datetime.truncate(%27day%27%2C%20datetime())-duration(%7B%20years%3A%201%7D)).epochSeconds%20RETURN%20d.day*86400%20as%20time%2C%20dp.tx_fee_per_byte_sat%20as%20fee%20ORDER%20BY%20time%3B&x_axis=false&y_axis=false&width=320&height=180",
      title: "Median transaction fee per byte (Duffs)",
      cypherReader: (cypherResponse:CypherResponse)=>cypherResponse.extractColumnsToRunningTotal(["Median transaction fee per byte (Duffs)"]),
      description: ""
    },

    'privatesend-transactions-per-day':{
      query: 
      "MATCH (d:Day)-[:LAST_BLOCK]->(:Block)-[:PRIVATESEND_TOTALS]->(bct:PrivateSendTotals)\n"+
      "RETURN d.day*86400 as time, bct.privatesend_tx_count as `Number of PrivateSend transactions`\n"+
      "ORDER BY time;",
      previewUrl: this.charjsImageURL+"/line.png?query=MATCH%20(d%3ADay)-%5B%3ALAST_BLOCK%5D-%3E(%3ABlock)-%5B%3APRIVATESEND_TOTALS%5D-%3E(bct%3APrivateSendTotals)%20WHERE%20d.day*86400%20%3E%3D%20(datetime.truncate(%27day%27%2C%20datetime())-duration(%7B%20years%3A%201%7D)).epochSeconds%20WITH%20d.day*86400%20as%20time%2C%20bct.privatesend_tx_count%20as%20txcount%20ORDER%20BY%20time%20WITH%20collect(time)%20as%20times%2C%20collect(txcount)%20as%20txcounts%20UNWIND%20range(1%2C%20length(txcounts)-1)%20as%20i%20RETURN%20times%5Bi-1%5D%20as%20time%2C%20(txcounts%5Bi%5D-txcounts%5Bi-1%5D)%20as%20tx_count%3B&x_axis=false&y_axis=false&width=320&height=180",
      title: "PrivateSend transactions per day",
      cypherReader: (cypherResponse:CypherResponse)=>{return cypherResponse.extractColumns(["Number of PrivateSend transactions"])},
      description: ""
    },
    'mixing-transactions-per-day':{
      query: 
      "MATCH (d:Day)-[:LAST_BLOCK]->(:Block)-[:PRIVATESEND_TOTALS]->(pst:PrivateSendTotals)\n"+
      "RETURN d.day*86400 as time, pst.privatesend_mixing_0_001_count+pst.privatesend_mixing_0_01_count+pst.privatesend_mixing_0_1_count+pst.privatesend_mixing_1_0_count+pst.privatesend_mixing_10_0_count as `Number of mixing transactions`\n"+
      "ORDER BY time;",
      previewUrl: this.charjsImageURL+"/line.png?query=MATCH (d%3ADay)-[%3ALAST_BLOCK]->(%3ABlock)-[%3APRIVATESEND_TOTALS]->(pst%3APrivateSendTotals)%20%0AWHERE d.day*86400 >%3D (datetime.truncate('day'%2C datetime())-duration({ years%3A 1})).epochSeconds%20%0AWITH d.day*86400 as time%2C pst.privatesend_mixing_0_001_count%2Bpst.privatesend_mixing_0_01_count%2Bpst.privatesend_mixing_0_1_count%2Bpst.privatesend_mixing_1_0_count%2Bpst.privatesend_mixing_10_0_count as txcount%20%0AORDER BY time WITH collect(time) as times%2C collect(txcount) as txcounts%20%0AUNWIND range(1%2C length(txcounts)-1) as i%20%0ARETURN times[i-1] as time%2C (txcounts[i]-txcounts[i-1]) as tx_count%3B&x_axis=false&y_axis=false&width=320&height=180",
      //previewUrl: this.charjsImageURL+"/line.png?query=MATCH%20(d%3ADay)-%5B%3ALAST_BLOCK%5D-%3E(%3ABlock)-%5B%3APRIVATESEND_TOTALS%5D-%3E(pst%3APrivateSendTotals)%20WHERE%20d.day*86400%20%3E%3D%20(datetime.truncate(%27day%27%2C%20datetime())-duration(%7B%20years%3A%201%7D)).epochSeconds%20WITH%20d.day*86400%20as%20time%2C%20pst.privatesend_mixing_0_01_count%2Bpst.privatesend_mixing_0_1_count%2Bpst.privatesend_mixing_1_0_count%2Bpst.privatesend_mixing_10_0_count%20as%20txcount%20ORDER%20BY%20time%20WITH%20collect(time)%20as%20times%2C%20collect(txcount)%20as%20txcounts%20UNWIND%20range(1%2C%20length(txcounts)-1)%20as%20i%20RETURN%20times%5Bi-1%5D%20as%20time%2C%20(txcounts%5Bi%5D-txcounts%5Bi-1%5D)%20as%20tx_count%3B&x_axis=false&y_axis=false&width=320&height=180",
      title: "Mixing transactions per day",
      cypherReader: (cypherResponse:CypherResponse)=>{return cypherResponse.extractColumns(["Number of mixing transactions"])},
      description: ""
    },
    'total-unspent-mixed-dash':{
      query: 
      "MATCH (d:Day)-[:LAST_BLOCK]->(:Block)-[:PRIVATESEND_TOTALS]->(pst:PrivateSendTotals)\n"+
      "WITH\n"+
      "  d.day*86400 as time,\n"+
      "  (pst.privatesend_mixing_0_001_output_count-pst.privatesend_mixing_0_001_spent_output_count)*0.001+\n"+
      "  (pst.privatesend_mixing_0_01_output_count-pst.privatesend_mixing_0_01_spent_output_count)*0.01+\n"+
      "  (pst.privatesend_mixing_0_1_output_count-pst.privatesend_mixing_0_1_spent_output_count)*0.1+\n"+
      "  (pst.privatesend_mixing_1_0_output_count-pst.privatesend_mixing_1_0_spent_output_count)*1.0+\n"+
      "  (pst.privatesend_mixing_10_0_output_count-pst.privatesend_mixing_10_0_spent_output_count)*10.0+\n"+
      "  (pst.privatesend_mixing_100_0_output_count-pst.privatesend_mixing_100_0_spent_output_count)*100.0\n"+
      "as unspent_dash\n"+
      "RETURN time, unspent_dash as `Unspent mixed Dash`\n"+
      "ORDER BY time;",
      previewUrl: this.charjsImageURL+"/line.png?query=MATCH (d%3ADay)-[%3ALAST_BLOCK]->(%3ABlock)-[%3APRIVATESEND_TOTALS]->(pst%3APrivateSendTotals) WHERE d.day*86400 >%3D (datetime.truncate('day'%2C datetime())-duration({ years%3A 1})).epochSeconds WITH d.day*86400 as time%2C (pst.privatesend_mixing_0_001_output_count-pst.privatesend_mixing_0_001_spent_output_count)*0.001%2B(pst.privatesend_mixing_0_01_output_count-pst.privatesend_mixing_0_01_spent_output_count)*0.01%2B(pst.privatesend_mixing_0_1_output_count-pst.privatesend_mixing_0_1_spent_output_count)*0.1%2B(pst.privatesend_mixing_1_0_output_count-pst.privatesend_mixing_1_0_spent_output_count)*1.0%2B(pst.privatesend_mixing_10_0_output_count-pst.privatesend_mixing_10_0_spent_output_count)*10.0%2B(pst.privatesend_mixing_100_0_output_count-pst.privatesend_mixing_100_0_spent_output_count)*100.0%0Aas unspent_dash RETURN time%2C unspent_dash ORDER BY time%3B&x_axis=false&y_axis=false&width=320&height=180",
      //previewUrl: this.charjsImageURL+"/line.png?query=MATCH%20(d%3ADay)-%5B%3ALAST_BLOCK%5D-%3E(%3ABlock)-%5B%3APRIVATESEND_TOTALS%5D-%3E(pst%3APrivateSendTotals)%20WHERE%20d.day*86400%20%3E%3D%20(datetime.truncate(%27day%27%2C%20datetime())-duration(%7B%20years%3A%201%7D)).epochSeconds%20WITH%20d.day*86400%20as%20time%2C%20(pst.privatesend_mixing_0_01_output_count-pst.privatesend_mixing_0_01_spent_output_count)*0.01%2B%20(pst.privatesend_mixing_0_1_output_count-pst.privatesend_mixing_0_1_spent_output_count)*0.1%2B%20(pst.privatesend_mixing_1_0_output_count-pst.privatesend_mixing_1_0_spent_output_count)*1.0%2B%20(pst.privatesend_mixing_10_0_output_count-pst.privatesend_mixing_10_0_spent_output_count)*10.0%2B%20(pst.privatesend_mixing_100_0_output_count-pst.privatesend_mixing_100_0_spent_output_count)*100.0%20as%20unspent_dash%20RETURN%20time%2C%20unspent_dash%20ORDER%20BY%20time%3B&x_axis=false&y_axis=false&width=320&height=180",
      title: "Total unspent mixed Dash",
      cypherReader: (cypherResponse:CypherResponse)=>cypherResponse.extractColumnsToRunningTotal(["Unspent mixed Dash"]),
      description: ""
    },
    'total-unspent-mixed-dash-by-denomination':{
      query: "",
      previewUrl: "",
      title: "",
      description: ""
    },
    "mixing-transactions-per-day-by-denomination":{
      query:
      "MATCH (d:Day)-[:LAST_BLOCK]->(:Block)-[:PRIVATESEND_TOTALS]->(n:PrivateSendTotals)\n"+
      "WITH d.day as date, n\n"+
      "ORDER BY date\n"+
      "WITH \n"+
      "0+collect(n.privatesend_mixing_10_0_count) as mixing_1,\n"+
      "0+collect(n.privatesend_mixing_1_0_count) as mixing_2,\n"+
      "0+collect(n.privatesend_mixing_0_1_count) as mixing_3,\n"+
      "0+collect(n.privatesend_mixing_0_01_count) as mixing_4,\n"+
      "0+collect(n.privatesend_mixing_0_001_count) as mixing_5,\n"+
      "collect(date) as dates\n"+
      "UNWIND range(1, length(dates)) as i\n"+
      "RETURN\n"+
      "dates[i-1]*24*60*60 as time,\n"+
      "mixing_1[i]-mixing_1[i-1] as `10.0`,\n"+
      "mixing_2[i]-mixing_2[i-1] as `1.0`,\n"+
      "mixing_3[i]-mixing_3[i-1] as `0.1`,\n"+
      "mixing_4[i]-mixing_4[i-1] as `0.01`,\n"+
      "mixing_5[i]-mixing_5[i-1] as `0.001`\n"+
      "ORDER BY time;",
      previewUrl: this.charjsImageURL+"/line.png?query=MATCH (d%3ADay)-[%3ALAST_BLOCK]->(%3ABlock)-[%3APRIVATESEND_TOTALS]->(n%3APrivateSendTotals)%20%0AWHERE d.day*86400 >%3D (datetime.truncate('day'%2C datetime())-duration({ years%3A 1})).epochSeconds%20%0AWITH d.day as date%2C n%20%0AORDER BY date%20%0AWITH%20%0Acollect(n.privatesend_mixing_10_0_count) as mixing_1%2C%20%0Acollect(n.privatesend_mixing_1_0_count) as mixing_2%2C%20%0Acollect(n.privatesend_mixing_0_1_count) as mixing_3%2C%20%0Acollect(n.privatesend_mixing_0_01_count) as mixing_4%2C%20%0Acollect(n.privatesend_mixing_0_001_count) as mixing_5%2C%20%0Acollect(date) as dates%20%0AUNWIND ['10.0'%2C '1.0'%2C '0.1'%2C '0.01'%2C '0.001'] AS type%20%0AUNWIND range(1%2C length(dates)-1) as i%20%0ARETURN dates[i-1]*24*60*60 as time%2C%20%0ACASE%20%0AWHEN type%3D'10.0' THEN (mixing_1[i]-mixing_1[i-1])%20%0AWHEN type%3D'1.0' THEN (mixing_2[i]-mixing_2[i-1])%20%0AWHEN type%3D'0.1' THEN (mixing_3[i]-mixing_3[i-1])%20%0AWHEN type%3D'0.01' THEN (mixing_4[i]-mixing_4[i-1])%20%0AWHEN type%3D'0.001' THEN (mixing_5[i]-mixing_5[i-1])%20%0AEND as Transactions%2C type ORDER BY time%3B&legend=true&x_axis=false&y_axis=false&width=320&height=180",
      //previewUrl: this.charjsImageURL+"/line.png?query=MATCH%20(d%3ADay)-%5B%3ALAST_BLOCK%5D-%3E(%3ABlock)-%5B%3APRIVATESEND_TOTALS%5D-%3E(n%3APrivateSendTotals)%20WHERE%20d.day*86400%20%3E%3D%20(datetime.truncate(%27day%27%2C%20datetime())-duration(%7B%20years%3A%201%7D)).epochSeconds%20WITH%20d.day%20as%20date%2C%20n%20ORDER%20BY%20date%20WITH%20collect(n.privatesend_mixing_10_0_count)%20as%20mixing_1%2C%20collect(n.privatesend_mixing_1_0_count)%20as%20mixing_2%2C%20collect(n.privatesend_mixing_0_1_count)%20as%20mixing_3%2C%20collect(n.privatesend_mixing_0_01_count)%20as%20mixing_4%2C%20collect(date)%20as%20dates%20UNWIND%20%5B%2210.0%22%2C%20%221.0%22%2C%20%220.1%22%2C%20%220.01%22%5D%20AS%20type%20UNWIND%20range(1%2C%20length(dates)-1)%20as%20i%20RETURN%20dates%5Bi-1%5D*24*60*60%20as%20time%2C%20CASE%20WHEN%20type%3D%2210.0%22%20THEN%20(mixing_1%5Bi%5D-mixing_1%5Bi-1%5D)%20WHEN%20type%3D%221.0%22%20THEN%20(mixing_2%5Bi%5D-mixing_2%5Bi-1%5D)%20WHEN%20type%3D%220.1%22%20THEN%20(mixing_3%5Bi%5D-mixing_3%5Bi-1%5D)%20WHEN%20type%3D%220.01%22%20THEN%20(mixing_4%5Bi%5D-mixing_4%5Bi-1%5D)%20END%20as%20Transactions%2C%20type%20ORDER%20BY%20time%3B&legend=true&x_axis=false&y_axis=false&width=320&height=180",
      title: "Mixing transaction per day by denomination",
      cypherReader: (cypherResponse:CypherResponse)=>cypherResponse.extractColumnsToRunningTotal(["10.0", "1.0", "0.1", "0.01", "0.001" ]),
      description: ""
    },
    'number-of-unspent-transaction-outputs':{
      query: 
      "MATCH (d:Day)-[:LAST_BLOCK]->(b:Block)-[:BLOCKCHAIN_TOTALS]->(bct:BlockChainTotals)\n"+
      "WITH d.day*86400 as time, bct.output_count-bct.input_count+b.height as utxo_count\n"+
      "RETURN time, utxo_count\n"+
      "ORDER BY time;",
      previewUrl: this.charjsImageURL+"/line.png?query=MATCH%20(d%3ADay)-%5B%3ALAST_BLOCK%5D-%3E(b%3ABlock)-%5B%3ABLOCKCHAIN_TOTALS%5D-%3E(bct%3ABlockChainTotals)%20WHERE%20d.day*86400%20%3E%3D%20(datetime.truncate(%27day%27%2C%20datetime())-duration(%7B%20years%3A%201%7D)).epochSeconds%20WITH%20d.day*86400%20as%20time%2C%20bct.output_count-bct.input_count%2Bb.height%20as%20utxo_count%20RETURN%20time%2C%20utxo_count%20ORDER%20BY%20time%3B&x_axis=false&y_axis=false&width=320&height=180",
      title: "Number of unspent transaction outputs",
      cypherReader: (cypherResponse:CypherResponse)=>cypherResponse.extractColumnsToRunningTotal(["utxo_count"]),
      description: ""
    },
    'average-block-size':{
      query: 
      "MATCH (d:Day)-[:LAST_BLOCK]->(b:Block)-[:BLOCKCHAIN_TOTALS]->(bct:BlockChainTotals)\n"+
      "WITH d.day*86400 as time, bct.total_block_size as block_size, b.height as height\n"+
      "ORDER BY time\n"+
      "WITH collect(time) as times, 0+collect(block_size) as block_sizes, 0+collect(height) as heights\n"+
      "UNWIND range(1, length(times)) as i\n"+
      "WITH times[i-1] as time, (block_sizes[i]-block_sizes[i-1]) as block_size, heights[i]-heights[i-1] as blocks\n"+
      "RETURN time, block_size/1000.0/blocks as `Average block size (kB)`;",
      previewUrl: this.charjsImageURL+"/line.png?query=MATCH%20(d%3ADay)-%5B%3ALAST_BLOCK%5D-%3E(b%3ABlock)-%5B%3ABLOCKCHAIN_TOTALS%5D-%3E(bct%3ABlockChainTotals)%20WHERE%20d.day*86400%20%3E%3D%20(datetime.truncate(%27day%27%2C%20datetime())-duration(%7B%20years%3A%201%7D)).epochSeconds%20WITH%20d.day*86400%20as%20time%2C%20bct.total_block_size%20as%20block_size%2C%20b.height%20as%20height%20ORDER%20BY%20time%20WITH%20collect(time)%20as%20times%2C%20collect(block_size)%20as%20block_sizes%2C%20collect(height)%20as%20heights%20UNWIND%20range(1%2C%20length(times)-1)%20as%20i%20WITH%20times%5Bi-1%5D%20as%20time%2C%20(block_sizes%5Bi%5D-block_sizes%5Bi-1%5D)%20as%20block_size%2C%20heights%5Bi%5D-heights%5Bi-1%5D%20as%20blocks%20RETURN%20time%2C%20block_size%2F1000.0%2Fblocks%20as%20average_block_size%3B&x_axis=false&y_axis=false&width=320&height=180",
      title: "Average block size (kB)",
      cypherReader: (cypherResponse:CypherResponse)=>cypherResponse.extractColumnsToRunningTotal(["Average block size (kB)"]),
      description: ""
    },
    "total-output-volume": {
      query: 
      "MATCH (d:Day)-[:LAST_BLOCK]->(:Block)-[:BLOCKCHAIN_TOTALS]->(b:BlockChainTotals)\n"+
      "WITH d.day*86400 as time, b.total_output_volume_sat/100000000.0 as total_output_volume\n"+
      "RETURN time, total_output_volume as `Total output volume (Dash)`\n"+
      "ORDER BY time;",
      previewUrl: this.charjsImageURL+"/line.png?query=MATCH%20(d%3ADay)-%5B%3ALAST_BLOCK%5D-%3E(%3ABlock)-%5B%3ABLOCKCHAIN_TOTALS%5D-%3E(b%3ABlockChainTotals)%20WHERE%20d.day*86400%20%3E%3D%20(datetime.truncate(%27day%27%2C%20datetime())-duration(%7B%20years%3A%201%7D)).epochSeconds%20WITH%20d.day*86400%20as%20time%2C%20b.total_output_volume_sat%2F100000000.0%20as%20total_output_volume%20ORDER%20BY%20time%20WITH%20collect(time)%20as%20times%2C%20collect(total_output_volume)%20as%20total_output_volumes%20UNWIND%20range(1%2C%20length(times)-1)%20as%20i%20WITH%20times%5Bi-1%5D%20as%20time%2C%20(total_output_volumes%5Bi%5D-total_output_volumes%5Bi-1%5D)%20as%20total_output_volume%20RETURN%20time%2C%20total_output_volume%3B&x_axis=false&y_axis=false&width=320&height=180",
      title: "Total output volume (Dash)",
      cypherReader: (cypherResponse:CypherResponse)=>{return cypherResponse.extractColumns(["Total output volume (Dash)"])},
      description: ""
    },
    'block-rewards-per-day':{
      query: 
      "MATCH (d:Day)-[:LAST_BLOCK]->(:Block)-[:BLOCKCHAIN_TOTALS]->(b:BlockChainTotals)\n"+
      "WITH d.day*86400 as time, b.total_block_rewards_sat/100000000.0 as total_block_rewards\n"+
      "RETURN time, total_block_rewards as `Total block rewards per day (Dash)`\n"+
      "ORDER BY time;",
      previewUrl: this.charjsImageURL+"/line.png?query=MATCH%20(d%3ADay)-%5B%3ALAST_BLOCK%5D-%3E(%3ABlock)-%5B%3ABLOCKCHAIN_TOTALS%5D-%3E(b%3ABlockChainTotals)%20WHERE%20d.day*86400%20%3E%3D%20(datetime.truncate(%27day%27%2C%20datetime())-duration(%7B%20years%3A%201%7D)).epochSeconds%20WITH%20d.day*86400%20as%20time%2C%20b.total_block_rewards_sat%20as%20block_rewards%20ORDER%20BY%20time%20WITH%20collect(time)%20as%20times%2C%20collect(block_rewards)%20as%20block_rewardss%20UNWIND%20range(1%2C%20length(times)-1)%20as%20i%20RETURN%20times%5Bi-1%5D%20as%20time%2C%20(block_rewardss%5Bi%5D-block_rewardss%5Bi-1%5D)%20as%20block_rewards%3B&x_axis=false&y_axis=false&width=320&height=180",
      title: "Block rewards per day (Dash)",
      cypherReader: (cypherResponse:CypherResponse)=>{return cypherResponse.extractColumns(["Total block rewards per day (Dash)"])},
      description: ""
    },
    'average-number-of-inputs-and-outputs-per-transaction':{
      query: "",
      previewUrl: "",
      title: "",
      description: ""
    },
    'average-mixing-transaction-size-by-denomination':{
      query: 
      "MATCH (d:Day)-[:LAST_BLOCK]->(:Block)-[:PRIVATESEND_TOTALS]->(n:PrivateSendTotals)\n"+
      "WITH d.day as date, n\n"+
      "ORDER BY date\n"+
      "WITH \n"+
      "0+collect(n.privatesend_mixing_10_0_size) as mixing_1_size,\n"+
      "0+collect(n.privatesend_mixing_1_0_size) as mixing_2_size,\n"+
      "0+collect(n.privatesend_mixing_0_1_size) as mixing_3_size,\n"+
      "0+collect(n.privatesend_mixing_0_01_size) as mixing_4_size,\n"+
      "0+collect(n.privatesend_mixing_10_0_count) as mixing_1_count,\n"+
      "0+collect(n.privatesend_mixing_1_0_count) as mixing_2_count,\n"+
      "0+collect(n.privatesend_mixing_0_1_count) as mixing_3_count,\n"+
      "0+collect(n.privatesend_mixing_0_01_count) as mixing_4_count,\n"+
      "0+collect(n.privatesend_mixing_0_001_count) as mixing_5_count,\n"+
      "collect(date) as dates\n"+
      "UNWIND range(1, length(dates)) as i\n"+
      "RETURN\n"+
      "dates[i-1]*24*60*60 as time,\n"+
      "CASE (mixing_1_count[i]-mixing_1_count[i-1]) WHEN 0 THEN NULL ELSE 1.0*(mixing_1_size[i]-mixing_1_size[i-1])/(mixing_1_count[i]-mixing_1_count[i-1]) END as `10.0`,\n"+
      "CASE (mixing_2_count[i]-mixing_2_count[i-1]) WHEN 0 THEN NULL ELSE 1.0*(mixing_2_size[i]-mixing_2_size[i-1])/(mixing_2_count[i]-mixing_2_count[i-1]) END as `1.0`,\n"+
      "CASE (mixing_3_count[i]-mixing_3_count[i-1]) WHEN 0 THEN NULL ELSE 1.0*(mixing_3_size[i]-mixing_3_size[i-1])/(mixing_3_count[i]-mixing_3_count[i-1]) END as `0.1`,\n"+
      "CASE (mixing_4_count[i]-mixing_4_count[i-1]) WHEN 0 THEN NULL ELSE 1.0*(mixing_4_size[i]-mixing_4_size[i-1])/(mixing_4_count[i]-mixing_4_count[i-1]) END as `0.01`\n"+
      "CASE (mixing_5_count[i]-mixing_5_count[i-1]) WHEN 0 THEN NULL ELSE 1.0*(mixing_5_size[i]-mixing_5_size[i-1])/(mixing_5_count[i]-mixing_5_count[i-1]) END as `0.001`\n"+
      "ORDER BY time;",
      previewUrl: "",
      title: "Average mixing transaction size by denomination (bytes)",
      cypherReader: (cypherResponse:CypherResponse)=>cypherResponse.extractColumnsToRunningTotal(["10.0", "1.0", "0.1", "0.01", ]),
      description: ""
    }
  }

  constructor() { }
}

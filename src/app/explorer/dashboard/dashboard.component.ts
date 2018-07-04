import { Component, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { startWith } from 'rxjs/operators';

import { CypherService } from '../../charts/cypher.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  transactions: Transaction[] = [];

  columnsToDisplay = ["image", "txid", "time"];

  private pstype2img = {
    0:"dual_color/tx.png",
    1:"create_denominations.png",
    2:"private_send.png",
    3:"dual_color/tx.png",//no image for 100.0
    4:"dual_color/private_send_10-0_black.png",
    5:"dual_color/private_send_1-0_black.png",
    6:"dual_color/private_send_0-1_black.png",
    7:"dual_color/private_send_0-01_black.png"
  };

  interval: Subscription;
  mempoolSub: Subscription;

  constructor(private cypherService: CypherService) { }

  ngOnDestroy() {
    if (this.interval !== undefined) this.interval.unsubscribe();
    if (this.mempoolSub !== undefined) this.mempoolSub.unsubscribe();
  }  


  updateTransactions(newTxArray: Transaction[]) {
    let oldtxids: string[] = this.transactions.map(e => e.txid);
    let newtxids: string[] = newTxArray.map(e => e.txid);
    let addTransactions: Transaction[] = newTxArray.filter(tx => !oldtxids.includes(tx.txid));
    let keepTransations: Transaction[] = this.transactions.filter(tx => newtxids.includes(tx.txid));
    this.transactions = addTransactions.concat(keepTransations);
  }


  ngOnInit() {


    this.interval = Observable.interval(2000).pipe(startWith(0)).subscribe(() => {
      let query: string = "MATCH (tx:Transaction)-[INCLUDED_IN]->(:Mempool) RETURN tx.txid as txid, tx.receivedTime as time, tx.pstype as pstype, tx.txlock as txlock ORDER BY time DESC;"
      if (this.mempoolSub == undefined || this.mempoolSub.closed) {
        this.mempoolSub = this.cypherService.executeQuery(query, {}).subscribe(e => {
          let newTxs = e.data.map(row => {
            let pstype: number = row[2];
            let txlock: boolean = row[3];
            let image: string;
            if (txlock && pstype === 2) {
              image = "private_instant_send.png";
            } else if (txlock && pstype === 0) {
              image = "single_color/instantx.png";
            } else {
              image = this.pstype2img[pstype];
            }
            return {txid: row[0], time: row[1], pstype: row[2], image:image};
          });
          this.updateTransactions(newTxs);
        });
      }
    });
  }

}

export interface Transaction {
  txid: string, 
  time: number, 
  pstype: number, 
  image: string
}

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

  transactions: {txid: string, time: number, pstype: number, image: string}[] = [];

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

  constructor(private cypherService: CypherService) { }

  ngOnDestroy() {
    if (this.interval !== undefined) {
      this.interval.unsubscribe();
    }
  }  

  ngOnInit() {


    this.interval = Observable.interval(2000).pipe(startWith(0)).subscribe(() => {
      let query: string = "MATCH (tx:Transaction)-[INCLUDED_IN]->(:Mempool) RETURN tx.txid as txid, tx.receivedTime as time, tx.pstype as pstype ORDER BY time DESC;"
      this.cypherService.executeQuery(query, {}).subscribe(e => {
        this.transactions = e.data.map(row => {
          let pstype: number = row[2];
          
          return {txid: row[0], time: row[1], pstype: row[2], image:this.pstype2img[row[2]]};
        });
      });
    });
  }

}

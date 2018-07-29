import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { environment } from '../../../environments/environment';
import { CypherService } from '../../charts/cypher.service';

@Component({
  selector: 'app-privatesend-analysis',
  templateUrl: './privatesend-analysis.component.html',
  styleUrls: ['./privatesend-analysis.component.scss']
})
export class PrivatesendAnalysis2Component implements OnInit {

  rounds = [2, 3, 4, 5, 6, 7, 8];

  roundValues;

  roundTotals;

  roundTimes;

  roundNotFound;

  roundLoading;

  txid: string;

  errors = {};

  privateSendAnalysisURL: string = environment.privateSendAnalysisURL;

  txinfo : {feesSat: number, receivedTime: number, blockHeight: number, blockTime: number, nInputs: number, valueSat: number, blockHash: string};

  txinfoLoading: boolean = false;

  constructor(private http: HttpClient, private route: ActivatedRoute,
    private cypherService: CypherService) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      let newTxid: string = params['txid'];
      if (newTxid != undefined && newTxid !== this.txid) {
        this.txid = newTxid;
        this.loadTx();
      }
    }); 

    
  }


  loadTx() {
    this.txinfoLoading = true;
    this.cypherService.executeQuery("MATCH (in:TransactionInput)-[:INPUT]->(tx:Transaction {pstype:$pstype})-[:OUTPUT]->(out:TransactionOutput) WHERE tx.txid=$txid WITH tx, count(in) as inputCount, out OPTIONAL MATCH (tx)-[:INCLUDED_IN]->(b:Block)\n"+ 
    "RETURN tx.feesSat, tx.receivedTime, b.height, b.time, b.hash, inputCount, sum(out.valueSat) as valueSat", {txid:this.txid, pstype: 2}).subscribe(e => {
      this.txinfoLoading = false;
      if (e.data.length == 1) {
        let row = e.data[0];
        this.txinfo = {
          feesSat: row[0],
          receivedTime: row[1],
          blockHeight: row[2],
          blockTime: row[3],
          blockHash: row[4],
          nInputs: row[5],
          valueSat: row[6]
        }
      } else {
        this.txinfo = undefined;
      } 
    }, (error) => {this.txinfoLoading = false;}
    );

    this.errors = {};
    this.roundValues = {};
    this.roundTotals = {};
    this.roundTimes = {};
    this.roundNotFound = {};
    this.roundLoading = {};
    this.rounds.forEach(round => {
      this.roundLoading[round] = true;
      this.http.get(this.privateSendAnalysisURL+"/clusters/"+round+"/"+this.txid+".txt", { responseType: 'text' }).subscribe(data => {
        this.roundLoading[round] = false;
        console.log("got data");

        let roundValues: {name: string, value: number}[] = [];
        data.trim().split("\n").forEach(line => {
          let components: string[] = line.split("=");
          let name: string = components[0];
          if (name === "notfound") {
            this.roundNotFound[round] = components[1] === "true";
          } else if (name === "count") {
            this.roundTotals[round] = Number.parseInt(components[1]);
          } else if (name === "time") {
            this.roundTimes[round] = Number.parseInt(components[1]);
          } else {
            roundValues.push({name: name, value: Number.parseInt(components[1])});
          }
        });
        roundValues.sort((a, b) => b.value-a.value);
        this.roundValues[round] = roundValues;
      }, 
      error => {
        console.log("error", error);
        this.roundLoading[round] = false;
        this.errors[round] = "Error: Unable to load "+this.txid+" "+round+"-round data";
      });

    });
  }

}

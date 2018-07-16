import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-privatesend-analysis',
  templateUrl: './privatesend-analysis.component.html',
  styleUrls: ['./privatesend-analysis.component.scss']
})
export class PrivatesendAnalysisComponent implements OnInit {

  rounds = [2, 3, 4, 5, 6, 7, 8];

  roundValues;

  roundTotals;

  roundTimes;

  roundNotFound;

  txid: string;

  errors = {};

  privateSendAnalysisURL: string = environment.privateSendAnalysisURL;

  constructor(private http: HttpClient, private route: ActivatedRoute) { }

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
    this.errors = {};
    this.roundValues = {};
    this.roundTotals = {};
    this.roundTimes = {};
    this.roundNotFound = {};
    this.rounds.forEach(round => {

      this.http.get(this.privateSendAnalysisURL+"/"+round+"/"+this.txid+".txt", { responseType: 'text' }).subscribe(data => {
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

        /*let lines: {name: string, value: number}[] = data.trim().split("\n")
        .map(line => {
          let components: string[] = line.split("=");
          let name: string = components[0];
          if (name === "notfound") {
            return {name: components[0], value: Number.parseInt(components[1])};
          } else {
            return {name: components[0], value: Number.parseInt(components[1])};
          }
        });*/
        /*let totalCount: number = lines[0].value;
        this.roundTotals[round] = totalCount;
        console.log(lines.length);
        console.log("totalCount", totalCount);
        lines.shift();


        let roundValues = [];
        lines.forEach(e => {
          if (e.name=="count") {
            this.roundTotals[round] = e.value;
          } else if (e.name=="time") {
            this.roundTimes[round] = e.value;
          } else {
            roundValues.push(e);
          }
        });*/
        //lines.sort((a, b) => b.value-a.value);
        roundValues.sort((a, b) => b.value-a.value);
        this.roundValues[round] = roundValues;
      }, 
      error => {
        console.log("error", error);
        this.errors[round] = "Error: Unable to load "+this.txid+" "+round+"-round data";
      });

    });
  }

}

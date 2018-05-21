import { Component, Input, OnInit, SimpleChanges } from '@angular/core';

import { CypherService } from '../../../charts/cypher.service';
import { Transaction } from './../transaction';

@Component({
  selector: 'app-transaction-summary',
  templateUrl: './transaction-summary.component.html',
  styleUrls: ['./transaction-summary.component.scss']
})
export class TransactionSummaryComponent implements OnInit {

  @Input() transaction: Transaction;

  @Input() currentAddress?: string;

  currentAddressIsInput: boolean = false;

  currentAddressIsOutput: boolean = false;

  imageName: string;

  balanceLoading: boolean = false;;
  newBalance: number;
  balanceChange: number;

  inputsSummary: string;
  outputsSummary: string;

  constructor(private cypherService: CypherService) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.transaction) {
      this.asd();
    }

  

    if (this.currentAddress !== undefined) {
      this.loadTransactionBalance();
      this.currentAddressIsInput = !this.transaction.vin.every(e => e.addr !== this.currentAddress);
      this.currentAddressIsOutput = !this.transaction.vout.every(e => e.scriptPubKey.addresses[0] !== this.currentAddress);
    }

    if (this.transaction.vin.length === 1 && this.transaction.vin[0].addr !== undefined && this.transaction.vin[0].addr !== this.currentAddress) {
      this.inputsSummary = this.transaction.vin[0].addr;
    } else if (this.transaction.vin.length === 1 && this.transaction.vin[0].addr !== undefined && this.transaction.vin[0].addr === this.currentAddress) {
      this.inputsSummary = "This Address";
    } else if (this.transaction.vin.length === 1 && this.transaction.vin[0].addr === undefined) {
      this.inputsSummary = "Newly generated coins";
    } else if (this.transaction.vin.length > 1 && !this.currentAddressIsInput) {
      this.inputsSummary = this.transaction.vin.length + " Addresses";
    } else if (this.transaction.vin.length > 1 && this.currentAddressIsInput) {
      this.inputsSummary = "This + " + (this.transaction.vin.length-1) + (this.transaction.vin.length === 2 ? "Address" : "Addresses");
    }

    if (this.transaction.vout.length === 1 && this.transaction.vout[0].scriptPubKey.addresses[0] !== this.currentAddress) {
      this.outputsSummary = this.transaction.vout[0].scriptPubKey.addresses[0];
    } else if (this.transaction.vout.length === 1 && this.transaction.vout[0].scriptPubKey.addresses[0] === this.currentAddress) {
      this.outputsSummary = "This Address";
    } else if (this.transaction.vout.length > 1 && !this.currentAddressIsOutput) {
      this.outputsSummary = this.transaction.vout.length + " Addresses";
    } else if (this.transaction.vout.length > 1 && this.currentAddressIsOutput) {
      this.outputsSummary = "This + " + (this.transaction.vout.length-1) + (this.transaction.vout.length === 2 ? " Address" : " Addresses");
    }
  }

  ngOnInit() {
  }

  loadTransactionBalance() {
    this.newBalance = undefined;
    this.balanceChange = undefined;
    let query: string = "MATCH (:Transaction {txid:\""+this.transaction.txid+"\"})-[:CREATES]->(b:BalanceEvent)-[:INCLUDED_IN]->(:Address {address:\""+this.currentAddress+"\"})\n"
    + "RETURN b.balanceAfterSat, b.balanceChangeSat;";
    this.balanceLoading = true;
    this.cypherService.executeQuery(query, {}).subscribe(e => {
      this.balanceLoading = false;
      if (e.data.length === 1) {
        this.newBalance = e.data[0][0]/100000000.0;
        this.balanceChange = e.data[0][1]/100000000.0;
      }
    }, (error) => this.balanceLoading = false);
  }

  private asd() {
    if (this.transaction.isPrivateSendTransaction()) {
      this.imageName = "private_send.png";
    } else if (this.transaction.isCreateDenominationsTransaction()) {
      this.imageName = "create_denominations.png";
    } else if (this.transaction.isCoinbase()) {
      this.imageName = "single_color/coinbase_black.png";
    } else if (this.transaction.isMixingTransaction()) {
      if (this.transaction.vin[0].value==0.0100001) {
        this.imageName = "dual_color/private_send_0-01_black.png";
      } else if (this.transaction.vin[0].value==0.100001) {
        this.imageName = "dual_color/private_send_0-1_black.png";
      } else if (this.transaction.vin[0].value==1.00001) {
        this.imageName = "dual_color/private_send_1-0_black.png";
      } else if (this.transaction.vin[0].value==10.0001) {
        this.imageName = "dual_color/private_send_10-0_black.png";
      }
    } else {
      this.imageName = "dual_color/tx.png"
    }
  }  

}

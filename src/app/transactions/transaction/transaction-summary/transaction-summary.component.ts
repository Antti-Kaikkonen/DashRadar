import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs';

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

  txBalanceSub: Subscription;

  constructor(private cypherService: CypherService) { }

  ngOnDestroy() {
    if (this.txBalanceSub !== undefined) this.txBalanceSub.unsubscribe();
  }


  ngOnChanges(changes: SimpleChanges) {
    if (changes.transaction) {
      this.asd();
    }

  

    if (this.currentAddress !== undefined) {
      this.loadTransactionBalance();
      this.currentAddressIsInput = !this.transaction.vin.every(e => e.addr !== this.currentAddress);
      this.currentAddressIsOutput = !this.transaction.vout.every(e => e.scriptPubKey.addresses === undefined || e.scriptPubKey.addresses[0] !== this.currentAddress);
    }

    let uniqueInputAddresses = new Set(this.transaction.vin.filter(vin => vin.addr !== undefined && vin.addr != null).map(vin => vin.addr));
    let uniqueOutputAddresses = new Set(this.transaction.vout.filter(vout => vout.scriptPubKey.addresses !== undefined && vout.scriptPubKey.addresses[0] !== undefined && vout.scriptPubKey.addresses[0] != null).map(vout => vout.scriptPubKey.addresses[0]));

    if (uniqueInputAddresses.size === 1 && !this.currentAddressIsInput) {
      this.inputsSummary = this.transaction.vin[0].addr;
    } else if (uniqueInputAddresses.size === 1 && this.currentAddressIsInput) {
      this.inputsSummary = "This Address";
    } else if (this.transaction.vin.length === 1 && this.transaction.vin[0].addr === undefined) {
      this.inputsSummary = "Newly generated coins";
    } else if (uniqueInputAddresses.size > 1 && !this.currentAddressIsInput) {
      this.inputsSummary = uniqueInputAddresses.size + " Addresses";
    } else if (uniqueInputAddresses.size > 1 && this.currentAddressIsInput) {
      this.inputsSummary = "This + " + (uniqueInputAddresses.size-1) + (uniqueInputAddresses.size === 2 ? " Address" : " Addresses");
    }

    if (uniqueOutputAddresses.size === 1 && !this.currentAddressIsOutput) {
      this.outputsSummary = uniqueOutputAddresses.values().next().value;
    } else if (uniqueOutputAddresses.size === 1 && this.currentAddressIsOutput) {
      this.outputsSummary = "This Address";
    } else if (uniqueOutputAddresses.size > 1 && !this.currentAddressIsOutput) {
      this.outputsSummary = uniqueOutputAddresses.size + " Addresses";
    } else if (uniqueOutputAddresses.size > 1 && this.currentAddressIsOutput) {
      this.outputsSummary = "This + " + (uniqueOutputAddresses.size-1) + (uniqueOutputAddresses.size === 2 ? " Address" : " Addresses");
    }
  }

  ngOnInit() {
  }

  loadTransactionBalance() {
    if (this.txBalanceSub !== undefined) this.txBalanceSub.unsubscribe();
    this.newBalance = undefined;
    this.balanceChange = undefined;
    let query: string = "MATCH (:Transaction {txid:$txid})-[:CREATES]->(b:BalanceEvent)-[:INCLUDED_IN]->(:Address {address:$address})\n"
    + "RETURN b.balanceAfterSat, b.balanceChangeSat;";
    this.balanceLoading = true;
    this.txBalanceSub = this.cypherService.executeQuery(query, {txid:this.transaction.txid, address:this.currentAddress}).subscribe(e => {
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

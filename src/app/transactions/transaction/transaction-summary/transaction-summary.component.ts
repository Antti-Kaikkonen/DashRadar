import { Component, Input, OnInit, SimpleChanges } from '@angular/core';

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

  constructor() { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.transaction) {
      this.asd();
    }

    if (this.currentAddress !== undefined) {
      this.currentAddressIsInput = !this.transaction.vin.every(e => e.addr !== this.currentAddress);
      this.currentAddressIsOutput = !this.transaction.vout.every(e => e.scriptPubKey.addresses[0] !== this.currentAddress);
    }
  }

  ngOnInit() {
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

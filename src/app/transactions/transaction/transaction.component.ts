import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, Params } from '@angular/router';

import { TransactionService } from '../../transactions/transaction.service';
import { Transaction } from './transaction';

@Component({
  selector: 'app-transaction',
  templateUrl: './transaction.component.html',
  styleUrls: ['./transaction.component.scss']
})
export class TransactionComponent implements OnInit {

	@Input() transaction: Transaction;
  errorMessage: string;
  error: boolean = false;

  expanded: boolean = true;

  txoutindex: number;
  txinindex: number;
  imageName: string = "dual_color/tx.png";
  txid: string;

  transaction_type: string = "";

  fee: number;

	constructor(
		private route: ActivatedRoute,
    private transactionService: TransactionService,
    private metaService: Meta,
    private titleService: Title) { }


  ngOnChanges(changes: SimpleChanges) {
    if (changes.transaction && changes.transaction.currentValue) {
      this.transactionChanged();
    }
  }  

	ngOnInit() {
		this.route.params
		.filter((params: Params) => params['txid'] !== undefined)//Only load tx if in route
    .switchMap((params: Params) => {
      this.txid = params.txid;
      this.transaction = undefined;
      this.imageName = "dual_color/tx.png";
      return this.transactionService.getTransactionByHash(params['txid'])
    })
  	.subscribe(
  		(transaction: Transaction) => {
        this.titleService.setTitle("Dash Transaction "+transaction.txid+" | DashRadar");
        this.transaction = transaction;
        this.transactionChanged();
      },
    	(error: string) =>  {
        this.errorMessage = error; 
        this.error = true
      }
    );

    this.route.queryParams.subscribe(e => {
      this.txoutindex = e.txoutindex;
      this.txinindex = e.txinindex;
    });
  }
  
  private transactionChanged() {
    this.fee = this.transaction.calculateFee();
    this.txid = this.transaction.txid;
    if (this.transaction.isPrivateSendTransaction()) {
      this.imageName = "private_send.png";
      this.transaction_type = "PRIVATESEND";
    } else if (this.transaction.isCreateDenominationsTransaction()) {
      this.imageName = "create_denominations.png";
      this.transaction_type = "CREATE DENOMINATIONS";
    } else if (this.transaction.isCoinbase()) {
      this.imageName = "single_color/coinbase_black.png";
      this.transaction_type = "COINBASE";
    } else if (this.transaction.isMixingTransaction()) {
      this.transaction_type = "MIXING";
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
      this.transaction_type = "";
      this.imageName = "dual_color/tx.png";
    }
  }

}
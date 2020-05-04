import { DatePipe } from '@angular/common';
import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, Params } from '@angular/router';
import { filter, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
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
  imageName: string = "png2/64x64/dual_color/tx.png";
  txid: string;

  transaction_type: "" | "QUORUM COMMITMENT" | "PRIVATESEND" | "INSTANT PRIVATESEND" | "CREATE DENOMINATIONS" | "COINBASE" | "MIXING" | "PRIVATESEND COLLATERAL PAYMENT" | "PRIVATESEND MAKE COLLATERAL INPUTS" = "";

  fee: number;

  privateSendAnalysisURL: string = environment.privateSendAnalysisURL;

	constructor(
		private route: ActivatedRoute,
    private transactionService: TransactionService,
    private datePipe: DatePipe,
    private metaService: Meta,
    private titleService: Title) { }


  ngOnChanges(changes: SimpleChanges) {
    if (changes.transaction && changes.transaction.currentValue) {
      this.transactionChanged();
    }
  }  

  ngOnDestroy() {
    this.metaService.removeTag('name="description"');
  }

	ngOnInit() {
    this.route.params
    .pipe(
      filter((params: Params) => params['txid'] !== undefined),
      switchMap((params: Params) => {
        this.txid = params.txid;
        this.transaction = undefined;
        this.imageName = "png2/64x64/dual_color/tx.png";
        return this.transactionService.getTransactionByHash(params['txid'])
      })
    )
  	.subscribe(
  		(transaction: Transaction) => {
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

  private toTitleCase(str)
  {
      return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
  }
  
  
  private transactionChanged() {
    this.fee = this.transaction.calculateFee();
    this.txid = this.transaction.txid;
    if (this.transaction.isQcTx()) {
      this.transaction_type = "QUORUM COMMITMENT";
      this.imageName = "png2/64x64/quorum_commitment_black.png";
    } else if (this.transaction.isPrivateSendTransaction()) {
      if (this.transaction.txlock) {
        this.imageName = "png2/64x64/private_instant_send.png";
        this.transaction_type = "INSTANT PRIVATESEND";
      } else {
        this.imageName = "png2/64x64/private_send.png";
        this.transaction_type = "PRIVATESEND";
      }
    } else if (this.transaction.isCreateDenominationsTransaction()) {
      this.imageName = "png2/64x64/create_denominations.png";
      this.transaction_type = "CREATE DENOMINATIONS";
    } else if (this.transaction.isCoinbase()) {
      this.imageName = "png2/64x64/single_color/coinbase_black.png";
      this.transaction_type = "COINBASE";
    } else if (this.transaction.isMixingTransaction()) {
      this.transaction_type = "MIXING";
      if (this.transaction.vin[0].value==0.00100001) {
        this.imageName = "png2/64x64/dual_color/private_send_0-001_black.png";
      } else if (this.transaction.vin[0].value==0.0100001) {
        this.imageName = "png2/64x64/dual_color/private_send_0-01_black.png";
      } else if (this.transaction.vin[0].value==0.100001) {
        this.imageName = "png2/64x64/dual_color/private_send_0-1_black.png";
      } else if (this.transaction.vin[0].value==1.00001) {
        this.imageName = "png2/64x64/dual_color/private_send_1-0_black.png";
      } else if (this.transaction.vin[0].value==10.0001) {
        this.imageName = "png2/64x64/dual_color/private_send_10-0_black.png";
      }
    } else if (this.transaction.isCollateralPaymentTransaction()) {
      this.transaction_type = "PRIVATESEND COLLATERAL PAYMENT";
      this.imageName = "SVG/collateral_payment.svg";
    } else if (this.transaction.isMakeCollateralInputsTransaction()) {
      this.transaction_type = "PRIVATESEND MAKE COLLATERAL INPUTS";
      this.imageName = "SVG/make_collateral_inputs.svg";
    } else {
      this.transaction_type = "";
      this.imageName = "png2/64x64/dual_color/tx.png";
    }

    this.titleService.setTitle("Dash "+this.toTitleCase(this.transaction_type)+" Transaction | DashRadar");
    this.metaService.removeTag('name="description"');
    this.metaService.addTag({
      name: "description", 
      content: this.datePipe.transform(this.transaction.time*1000, "mediumDate")+", "+this.transaction.vin.length+" inputs, "+this.transaction.vout.length+" outputs, fee: "+this.fee +" dash, txid: "+this.transaction.txid
    });
  }

}

import { Component, OnInit, Input } from '@angular/core';
import { TransactionService } from './../../../transactions/transaction.service';
import { Transaction }    from './../transaction';
import { VOut} from './../vout';
import { VIn } from './../vin';

@Component({
  selector: 'app-transaction-input-output-table',
  templateUrl: './transaction-input-output-table.component.html',
  styleUrls: ['./transaction-input-output-table.component.scss']
})
export class TransactionInputOutputTableComponent implements OnInit {

  @Input() transaction: Transaction;

  @Input() currentAddress?: string = "XnWuSvxQ8rCiE9n7JMWK7oC9h21SSNFmCZ";

  @Input() txinindex: number;

  @Input() txoutindex: number;

  constructor(private transactionService: TransactionService) { }
  
  ngOnInit() {

    //Insight api sometimes has null addr even if there is an address in the referenced output
    this.transaction.vin.filter((vin:VIn) => vin.txid && !vin.addr).forEach((vin:VIn) => {

      this.transactionService.getOutputFromInput(vin).subscribe((vout:VOut) => {
        if (vout.scriptPubKey.addresses && vout.scriptPubKey.addresses.length===1) {
          vin.addr=vout.scriptPubKey.addresses[0];
        }
      });

    });
  }

}

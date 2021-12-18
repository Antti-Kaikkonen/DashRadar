import { Component, EventEmitter, Host, Inject, Input, OnInit, Output } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as Immutable from 'immutable';
import { from, Observable } from 'rxjs';
import { concat, filter, mergeMap } from 'rxjs/operators';

import { AddressService } from '../../addresses/address.service';
import { Address } from '../../addresses/address/address';
import { TransactionService } from '../../transactions/transaction.service';
import { Transaction } from '../../transactions/transaction/transaction';
import { VivagraphContainerComponent } from '../vivagraph-container.component';

@Component({
  selector: 'app-import-export',
  templateUrl: './import-export.component.html',
  styleUrls: ['./import-export.component.scss']
})
export class ImportExportComponent implements OnInit {

	@Input() transactions: Immutable.Map<string, Transaction>;

  @Input() addresses: Immutable.Map<string, Address>;

  @Output() onExportSVG = new EventEmitter();

	inputAddress: string;

	inputTransaction: string;

	jsonImportData: string;

  importingJSON: boolean = false;

  constructor(@Host() private parent: VivagraphContainerComponent,
  	private addressService: AddressService,
    private transactionService: TransactionService,
    public dialog: MatDialog) { }

  ngOnInit() {
  }

  addAddress() {
  	if (this.inputAddress === undefined || this.inputAddress.length !== 34) {
  		alert("Address must be 34 characters long");
  		return;
  	}
  	this.addressService.getAddress(this.inputAddress).subscribe((address: Address) => this.parent.addresses = this.parent.addresses.set(address.addrStr, address));
  }

  addTransaction() {
  	if (this.inputTransaction === undefined || this.inputTransaction.length !== 64) {
  		alert("Transaction Id must be 64 characters long");
  		return;
  	}
  	this.transactionService.getTransactionByHash(this.inputTransaction).subscribe((transaction: Transaction) => this.parent.transactions = this.parent.transactions.set(transaction.txid, transaction));
  }


  exportToJSON() {

    let jsondata: string = JSON.stringify({
      transactions: this.transactions.valueSeq().map((transaction: Transaction) => transaction.txid), 
      addresses: this.addresses.valueSeq().map((address: Address) => address.addrStr)
    });

    let dialogRef = this.dialog.open(ExportDialog, {
      width: '250px',
      data: { jsondata: jsondata }
    });

    /*dialogRef.afterClosed().subscribe(() => {
      console.log('The dialog was closed');
    });*/

  }

  toggleImportJSON() {
    this.importingJSON = !this.importingJSON;
  }

  importFromJSON() {
  	let data: {addresses: string[], transactions: string[]} = JSON.parse(this.jsonImportData);

  	let txs: Observable<Transaction> = from(data.transactions).pipe(
      filter((txId: string) => txId.length === 64),
      mergeMap(
        (txId: string) => 
        this.transactionService.getTransactionByHash(txId), 4
      )
    )

    let addrs: Observable<Address> = from(data.addresses).pipe(
      filter((address: string) => address.length === 34),
      mergeMap( 
        (address: string) => 
        this.addressService.getAddress(address), 4
      )
    )
    let both = txs.pipe(concat(addrs));

    both.subscribe((t: Transaction|Address) => {
    	
    	if (t instanceof Transaction) {
    		this.parent.transactions = this.parent.transactions.set(t.txid, t);
    	} else {
    		this.parent.addresses = this.parent.addresses.set(t.addrStr, t);
    	}
    });

  }


}


@Component({
  selector: 'dialog-overview-example-dialog',
  templateUrl: 'export-dialog.html',
})
export class ExportDialog {

  constructor(
    public dialogRef: MatDialogRef<ExportDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
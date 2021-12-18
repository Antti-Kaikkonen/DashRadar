import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';

import { Transaction } from '../../transactions/transaction/transaction';

@Component({
  selector: 'app-transaction-dialog',
  templateUrl: './transaction-dialog.component.html',
  styleUrls: ['./transaction-dialog.component.scss']
})
export class TransactionDialogComponent implements OnInit {

	public closeTrigger = false;

	@Input() transaction: Transaction;

	@Output() onTransactionDeleted = new EventEmitter<Transaction>();

	@Output() onTransactionExpanded = new EventEmitter<Transaction>();

	@Output() onTransactionInputsExpanded = new EventEmitter<Transaction>();

	@Output() onTransactionOutputsExpanded = new EventEmitter<Transaction>();

	@Output() onTransactionInspected = new EventEmitter<Transaction>();

	menuTrigger: MatMenuTrigger;

  constructor() {}

  ngOnInit() {
  }

}

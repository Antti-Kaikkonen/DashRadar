import { Component, Input, OnInit, SimpleChanges } from '@angular/core';

import { Transaction } from '../transaction/transaction';

@Component({
  selector: 'transactions-table',
  templateUrl: './transactions-table.component.html',
  styleUrls: ['./transactions-table.component.scss'],

})
export class TransactionsTableComponent implements OnInit {

	public expanded: {} = {};

	@Input() currentAddress?: string;

	@Input() transactions: Array<Transaction>;

	constructor() { }

	isExpanded(transaction: Transaction) {
		return this.expanded[transaction.txid];
		//return this.expanded.includes(transaction.txid);
	}

	toggleExpanded(transaction: Transaction) {
		if (this.expanded[transaction.txid]) {
			delete this.expanded[transaction.txid];
		} else {
			this.expanded[transaction.txid] = true;
		}
	}

	ngOnChanges(changes: SimpleChanges) {
		if (changes.transactions && changes.transactions.currentValue) {
			let oldTxIds: string[] = changes.transactions.previousValue ? changes.transactions.previousValue.map(e => e.txid) : [];
			let newTxIds: string[] = changes.transactions.currentValue.map(e => e.txid);
			let deletedTxIds: string[] = oldTxIds.filter(txid => !newTxIds.includes(txid));
			deletedTxIds.forEach(txid => delete this.expanded[txid]);

			//this.expanded = this.transactions.map(tx => tx.txid).filter(txid => this.expanded.includes(txid));
			//this.expanded = new Array(this.transactions.length).fill(false);
		}
	}

	ngOnInit() {
	}

}

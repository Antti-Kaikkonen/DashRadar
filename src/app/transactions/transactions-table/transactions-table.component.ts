import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { Transaction } from '../transaction/transaction';

@Component({
  selector: 'transactions-table',
  templateUrl: './transactions-table.component.html',
  styleUrls: ['./transactions-table.component.scss'],

})
export class TransactionsTableComponent implements OnInit {

	public expanded: boolean[];

	@Input() currentAddress?: string;

	@Input() transactions: Array<Transaction>;

	constructor() { }

	ngOnChanges(changes: SimpleChanges) {
		if (changes.transactions && changes.transactions.currentValue) {
			this.expanded = new Array(this.transactions.length).fill(false);
		}
	}

	ngOnInit() {
	}

}

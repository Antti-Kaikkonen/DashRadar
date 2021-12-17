import { DataSource } from '@angular/cdk/table';
import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatSort, Sort } from '@angular/material';
import * as Immutable from 'immutable';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, merge } from 'rxjs/operators';

import { Transaction } from '../../transactions/transaction/transaction';

@Component({
  selector: 'app-vivagraph-transaction-list',
  templateUrl: './vivagraph-transaction-list.component.html',
  styleUrls: ['./vivagraph-transaction-list.component.scss']
})
export class VivagraphTransactionListComponent implements OnInit {

	@Input() 
  transactions: Immutable.Map<string, Transaction>;

  displayedColumns = ["select", 'hash', 'size'];

  @Input()
  selectedTransactions: Immutable.Map<string, Transaction>;

  @Output() onTransactionSelectionToggled = new EventEmitter<Transaction>();

  @Output() onAllTransactionsSelectionToggled = new EventEmitter();

  @Output() onDeleteSelectedTransactions = new EventEmitter();

  @Output() onExpandSelectedTransactions = new EventEmitter();

  @Output() onExpandSelectedTransactionsInputs = new EventEmitter();

  @Output() onExpandSelectedTransactionsOutputs = new EventEmitter();

  dataSource: TransactionDataSource;

  private dataChange: BehaviorSubject<Transaction[]> = new BehaviorSubject<Transaction[]>([]);

  private longestTotalSent: number = 7;
  private longestTotalReceived: number = 7;

  sort: MatSort;

  constructor() { }

  allTransactionsSelected(): boolean {
    return !this.selectedTransactions.isEmpty() && this.selectedTransactions.size === this.transactions.size
  }

  ngOnInit() {
    this.dataSource = new TransactionDataSource(this.dataChange, this.sort);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.transactions) {
      let oldTx: Immutable.Map<string, Transaction> = changes.transactions.previousValue;
      let newTx: Immutable.Map<string, Transaction> = changes.transactions.currentValue;
      let removeTx: Immutable.Map<string, Transaction> = oldTx === undefined ? Immutable.Map<string, Transaction>() : oldTx.deleteAll(newTx.keys());
      removeTx.forEach((transaction: Transaction) => this.selectedTransactions = this.selectedTransactions.delete(transaction.txid));
      this.dataChange.next(Array.from(newTx.values()));
    }
  }
}

export class TransactionDataSource extends DataSource<any> {
  _filterChange = new BehaviorSubject('');
  get filter(): string { return this._filterChange.value; }
  set filter(filter: string) { this._filterChange.next(filter); }

  constructor(private _database: BehaviorSubject<Transaction[]>,
              private _sort: MatSort) {
    super();
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<Transaction[]> {
    return this._database
    .pipe(
      merge(this._sort.sortChange),
      map((value: Sort | Transaction[], index) => {
        let sortedData = this.sortData(this._database.getValue().slice());

        return sortedData;
      })
    );
  }

  disconnect() {
  }

  /** Returns a sorted copy of the database data. */
  sortData(data: Transaction[]): Transaction[] {
    if (!this._sort.active || this._sort.direction == '') { return data; }

    return data.sort((a, b): number => {
      let propertyA: number|string = '';
      let propertyB: number|string = '';

      switch (this._sort.active) {
        case 'hash': [propertyA, propertyB] = [a.txid, b.txid]; break;
        case 'size': [propertyA, propertyB] = [a.size, b.size]; break;
      }

      let valueA = isNaN(+propertyA) ? propertyA : +propertyA;
      let valueB = isNaN(+propertyB) ? propertyB : +propertyB;

      return (valueA < valueB ? -1 : 1) * (this._sort.direction == 'asc' ? 1 : -1);
    });
  }

}

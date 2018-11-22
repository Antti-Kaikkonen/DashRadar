import { DataSource } from '@angular/cdk/table';
import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatSort, Sort } from '@angular/material';
import * as Immutable from 'immutable';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, merge } from 'rxjs/operators';

import { Address } from '../../addresses/address/address';

@Component({
  selector: 'app-vivagraph-address-list',
  templateUrl: './vivagraph-address-list.component.html',
  styleUrls: ['./vivagraph-address-list.component.scss']
})
export class VivagraphAddressListComponent implements OnInit {

  @Input() 
  addresses: Immutable.Map<string, Address>;

  displayedColumns = ["select", 'hash', 'totalSent', 'totalReceived'];

  @Input()
  selectedAddresses: Immutable.Map<string, Address>;

  @Output() onAddressSelectionToggled = new EventEmitter<Address>();

  @Output() onAllAddressesSelectionToggled = new EventEmitter();

  @Output() onDeleteSelectedAddresses = new EventEmitter();

  @Output() onExpandSelectedAddresses = new EventEmitter();

  dataSource: AddressDataSource;

  private dataChange: BehaviorSubject<Address[]> = new BehaviorSubject<Address[]>([]);

  private longestTotalSent: number = 7;
  private longestTotalReceived: number = 7;

  @ViewChild(MatSort) sort: MatSort;

  constructor() { }

  allAddressesSelected(): boolean {
    return !this.selectedAddresses.isEmpty() && this.selectedAddresses.size === this.addresses.size
  }

  ngOnInit() {
    this.dataSource = new AddressDataSource(this.dataChange, this.sort);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.addresses) {
      let oldAddr: Immutable.Map<string, Address> = changes.addresses.previousValue;
      let newAddr: Immutable.Map<string, Address> = changes.addresses.currentValue;
      let removeAddr: Immutable.Map<string, Address> = oldAddr === undefined ? Immutable.Map<string, Address>() : oldAddr.deleteAll(newAddr.keys());
      removeAddr.forEach((address: Address) => this.selectedAddresses = this.selectedAddresses.delete(address.addrStr));
      let a: Address = newAddr.maxBy((value) => value.totalSent.toString().length);
      let b: Address = newAddr.maxBy((value) => value.totalReceived.toString().length);
      if (a !== undefined) {
        this.longestTotalSent = a.totalSent.toString().length+1;
      } else {
        this.longestTotalSent = 7;
      }
      if (b !== undefined) {
        this.longestTotalReceived = b.totalReceived.toString().length+1;
      } else {
        this.longestTotalReceived = 7;
      }
      this.dataChange.next(Array.from(newAddr.values()));
    }
  }
}

export class AddressDataSource extends DataSource<any> {
  _filterChange = new BehaviorSubject('');
  get filter(): string { return this._filterChange.value; }
  set filter(filter: string) { this._filterChange.next(filter); }

  constructor(private _database: BehaviorSubject<Address[]>,
              private _sort: MatSort) {
    super();
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<Address[]> {
    return this._database
    .pipe(
      merge(this._sort.sortChange),
      map((value: Sort | Address[], index) => {
        let sortedData = this.sortData(this._database.getValue().slice());
        return sortedData;
      })
    );
  }

  disconnect() {
  }

  /** Returns a sorted copy of the database data. */
  sortData(data: Address[]): Address[] {
    if (!this._sort.active || this._sort.direction == '') { return data; }

    return data.sort((a, b): number => {
      let propertyA: number|string = '';
      let propertyB: number|string = '';

      switch (this._sort.active) {
        case 'hash': [propertyA, propertyB] = [a.addrStr, b.addrStr]; break;
        case 'totalSent': [propertyA, propertyB] = [a.totalSent, b.totalSent]; break;
        case 'totalReceived': [propertyA, propertyB] = [a.totalReceived, b.totalReceived]; break;
      }

      let valueA = isNaN(+propertyA) ? propertyA : +propertyA;
      let valueB = isNaN(+propertyB) ? propertyB : +propertyB;

      return (valueA < valueB ? -1 : 1) * (this._sort.direction == 'asc' ? 1 : -1);
    });
  }
}

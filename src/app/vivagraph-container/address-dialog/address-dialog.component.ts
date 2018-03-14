import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { Address } from '../../addresses/address/address';

@Component({
  selector: 'app-address-dialog',
  templateUrl: './address-dialog.component.html',
  styleUrls: ['./address-dialog.component.scss']
})
export class AddressDialogComponent implements OnInit {

	@Input() address: Address;

	@Output() onAddressDeleted = new EventEmitter<Address>();

	@Output() onAddressExpanded = new EventEmitter<Address>();

	@Output() onAddressInspected = new EventEmitter<Address>();

  constructor() { }

  ngOnInit() {
  }

}

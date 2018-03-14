import { Component, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, Params, Router } from '@angular/router';

import { TransactionService } from '../../transactions/transaction.service';
import { AddressService } from '../address.service';
import { Transaction } from './../../transactions/transaction/transaction';
import { Address } from './address';

@Component({
  selector: 'app-address',
  templateUrl: './address.component.html',
  styleUrls: ['./address.component.scss']
})
export class AddressComponent implements OnInit {

	public address: Address;
	errorMessage: string;
  error: boolean;
  transactions: Transaction[];

  pageSizeOptions = [10];
  pageSize = this.pageSizeOptions[0];

  addrStr: string;

  currentPage = 0;

  constructor(private route: ActivatedRoute,
    private router: Router,
  	private addressService: AddressService,
    private transactionService: TransactionService,
    private metaService: Meta,
    private titleService: Title) { }

  ngOnInit() {

    this.route.queryParams
    .filter(e => e.page !== undefined)
    .subscribe(e => {
      if (isNaN(e.page)) {
        this.currentPage = 0;
      } else {
        this.currentPage = Math.max(0, Number(e.page));
      }
      if (this.address !== undefined) {
        this.transactionService.getTransactionsByAddress(this.address.addrStr, this.currentPage).subscribe(transactions => this.transactions = transactions);
      }
    }); 

    this.route.params
    .filter(params => params.addr)
    .switchMap((params: Params) => {
      this.addrStr = params.addr;
      return this.addressService.getAddress(params.addr)
    }).subscribe(
      (address: Address) => {
        this.titleService.setTitle("Dash Address "+address.addrStr+" | DashRadar");
        this.address = address;
        this.transactionService.getTransactionsByAddress(this.address.addrStr, this.currentPage)
        .subscribe(tranactions => this.transactions = tranactions, 
          error => console.log("error fetching address transactions: ", error));
        /*Observable.from(this.address.transactions)
        .mergeMap(txid => this.transactionService.getTransactionByHash(txid))
        .toArray()
        .subscribe(transactions => this.transactions = transactions, 
          error => console.log("error fetching address transactions: ", error));*/
      },
	    (error: string) =>  {this.errorMessage = error; this.error = true;}
    );
  }

  pageChanged(event) {

    this.transactions = undefined;
    this.currentPage = event.pageIndex;

    let urlTree = this.router.parseUrl(this.router.url);
    urlTree.queryParams["page"] = event.pageIndex;
    this.router.navigateByUrl(urlTree);
  }

}

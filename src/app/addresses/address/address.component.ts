import { Component, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import { TransactionService } from '../../transactions/transaction.service';
import { WalletService } from '../../wallets/wallet.service';
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
  transactions: Transaction[] = [];

  pageSizeOptions = [10];
  pageSize = this.pageSizeOptions[0];

  addrStr: string;

  guesstimatedWallet: {exists: boolean, addressCount?: number};

  currentPage = 0;

  interval: Subscription;

  constructor(private route: ActivatedRoute,
    private router: Router,
  	private addressService: AddressService,
    private transactionService: TransactionService,
    private walletService: WalletService,
    private metaService: Meta,
    private titleService: Title) { }

  ngOnDestroy() {
    this.interval.unsubscribe();
    this.metaService.removeTag('name="description"');
  }  


  addressChanged(address: Address) {
    if (this.address === undefined || this.address.txApperances != address.txApperances || this.address.unconfirmedTxApperances != address.unconfirmedTxApperances) {
      this.transactionService.getTransactionsByAddress(this.addrStr, this.currentPage)
      .subscribe((newTransactions: Transaction[]) => {
        let transactions = newTransactions.map(newTx => {
          let oldTx = this.transactions.find((value: Transaction, index: number) => {
            return value.txid === newTx.txid}
          );
          if (oldTx === undefined)  {
            return newTx;
          } else {
            return oldTx;
          }
        });
        this.transactions = transactions;
      });
      this.address = address;
    }
  }

  checkGuestimatedWalletUpdates() {
    this.walletService.getWalletAddressCount(this.addrStr).subscribe(e => {
      try {
        let count: number = e.data[0][0];
        if (count >= 0) {
          this.guesstimatedWallet = {addressCount: count, exists: true};
        } else {
          this.guesstimatedWallet = {exists: false};
        }
      } catch(error) {
        this.guesstimatedWallet = {exists: false};
      }
    });
  }

  checkForUpdates() {
    if (!this.address) return;
    this.addressService.getAddress(this.addrStr)
    .subscribe((address: Address) => {
      this.addressChanged(address);
      this.checkGuestimatedWalletUpdates();
    });
  }


  ngOnInit() {

    this.interval = Observable.interval(10000).subscribe(() => {
      this.checkForUpdates();
    });

    this.route.queryParams
    //.filter(e => e.page !== undefined)
    .subscribe(e => {
      if (isNaN(e.page)) {
        this.currentPage = 0;
      } else {
        this.currentPage = Math.max(0, Number(e.page));
      }
      if (this.address !== undefined) {
        this.transactionService.getTransactionsByAddress(this.address.addrStr, this.currentPage)
        .subscribe(transactions => this.transactions = transactions);
      }
    }); 

    this.route.params
    .filter(params => params.addr)
    .switchMap((params: Params) => {
      this.addrStr = params.addr;
      this.guesstimatedWallet = undefined;
      return this.addressService.getAddress(params.addr)
    }).subscribe(
      (address: Address) => {
        this.titleService.setTitle("Dash Address "+address.addrStr+" | DashRadar");
        this.metaService.removeTag('name="description"');
        this.metaService.addTag({
          name: "description", 
          content: "Balance: "+address.balance+", transactions: "+address.txApperances+", received: "+address.totalReceived+", sent: "+address.totalSent
        });
        this.addressChanged(address);
        this.checkGuestimatedWalletUpdates();
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

import { isPlatformBrowser } from '@angular/common';
import { ApplicationRef, ChangeDetectorRef, Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { interval } from 'rxjs';
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
  transactionsSub: Subscription;
  walletSub: Subscription;
  addressSub: Subscription;
  isStableSub: Subscription;

  isBrowser: boolean;

  constructor(private route: ActivatedRoute,
    private router: Router,
  	private addressService: AddressService,
    private transactionService: TransactionService,
    private walletService: WalletService,
    private metaService: Meta,
    private titleService: Title,
    private appRef: ApplicationRef,
    private changeDetectorRef: ChangeDetectorRef,
    @Inject(PLATFORM_ID) platformId: string) {
      this.isBrowser = isPlatformBrowser(platformId);
    }

  ngOnDestroy() {
    if (this.interval !== undefined) this.interval.unsubscribe();
    if (this.transactionsSub !== undefined) this.transactionsSub.unsubscribe();
    if (this.addressSub !== undefined) this.addressSub.unsubscribe();
    if (this.walletSub !== undefined) this.walletSub.unsubscribe();
    if (this.isStableSub !== undefined) this.isStableSub.unsubscribe();
    this.metaService.removeTag('name="description"');
  }  


  addressChanged(address: Address) {
    if (this.address === undefined || this.address.txApperances != address.txApperances || this.address.unconfirmedTxApperances != address.unconfirmedTxApperances) {
      this.transactionsSub = this.transactionService.getTransactionsByAddress(address.addrStr, this.currentPage)
      .subscribe((newTransactions: Transaction[]) => {
        let transactions = newTransactions.map(newTx => {
          let oldTx = this.transactions.find((value: Transaction, index: number) => {
            return value.txid === newTx.txid
          });
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
    if (this.walletSub !== undefined) this.walletSub.unsubscribe();
    this.walletSub = this.walletService.getWalletAddressCount(this.addrStr).subscribe(e => {
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
    if (this.addressSub !== undefined) this.addressSub.unsubscribe();
    this.addressSub = this.addressService.getAddress(this.addrStr)
    .subscribe((address: Address) => {
      this.addressChanged(address);
      this.checkGuestimatedWalletUpdates();
      this.changeDetectorRef.detectChanges();
    });
  }


  ngOnInit() {
    if (this.isBrowser) {
      this.isStableSub = this.appRef.isStable.subscribe(stable => {
        if (stable) {
          this.isStableSub.unsubscribe();
          this.interval = interval(10000).subscribe(() => {
            this.checkForUpdates();
          });
        }
      });    
    }

    this.route.queryParams
    //.filter(e => e.page !== undefined)
    .subscribe(e => {
      if (isNaN(e.page)) {
        this.currentPage = 0;
      } else {
        this.currentPage = Math.max(0, Number(e.page));
      }
      if (this.address !== undefined && this.address.addrStr === this.route.snapshot.params.addr) {//only if address didn't change simulataneously
        if (this.transactionsSub !== undefined) this.transactionsSub.unsubscribe();
        this.transactionsSub = this.transactionService.getTransactionsByAddress(this.address.addrStr, this.currentPage)
        .subscribe(transactions => this.transactions = transactions);
      }
    }); 

    this.route.params
    .filter(params => params.addr)
    .switchMap((params: Params) => {
      this.transactions = [];
      this.addrStr = params.addr;
      this.address = undefined;
      this.guesstimatedWallet = undefined;
      if (this.addressSub !== undefined) this.addressSub.unsubscribe();
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

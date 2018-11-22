import { CdkPortal, DomPortalOutlet } from '@angular/cdk/portal';
import { DOCUMENT } from '@angular/common';
import { ApplicationRef, Component, ComponentFactoryResolver, Inject, Injector, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { onErrorResumeNext, Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { AddressService } from '../addresses/address.service';
import { Address } from '../addresses/address/address';
import { BlockService } from '../blocks/block.service';
import { Block } from '../blocks/block/block';
import { TransactionService } from '../transactions/transaction.service';
import { Transaction } from '../transactions/transaction/transaction';

@Component({
  selector: 'app-explorer',
  templateUrl: './explorer.component.html',
  styleUrls: ['./explorer.component.scss']
})
export class ExplorerComponent implements OnInit {

  @ViewChild(CdkPortal) portal;

  private host: DomPortalOutlet;

  searchStr: string = "";

  loadingSearchResults = false;

  found = false;

  submitted = false;

  searchSub: Subscription;

  searchForm = new FormGroup ({
    searchInput: new FormControl('')
  });


  constructor(private router: Router,
    private blockService: BlockService,
    private transactionService: TransactionService,
    private addressService: AddressService,
    private componentFactoryResolver: ComponentFactoryResolver,
    private applicationRef: ApplicationRef,
    private injector: Injector,
    @Inject(DOCUMENT) private document: Document) {
     }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.host = new DomPortalOutlet(
      this.document.querySelector('#navbar-actions'),
      this.componentFactoryResolver,
      this.applicationRef,
      this.injector
    );
    this.host.attach(this.portal);
  }

  ngOnDestroy() {
    if (this.searchSub !== undefined) this.searchSub.unsubscribe();
    this.host.detach();
  }

  onSubmit() {
    this.searchStr = this.searchForm.get("searchInput").value;
    if (this.searchStr.length === 0) return;
    this.searchStr = this.searchStr.trim();
    this.submitted = true;
    this.loadingSearchResults = true;
    let addressObservable = this.addressService.getAddress(this.searchStr);
    let txObservable = this.transactionService.getTransactionByHash(this.searchStr);

    let observable = onErrorResumeNext(addressObservable, txObservable);
    //let observable = Observable.merge(addressObservable, txObservable, hashObservable);

    if (!isNaN(Number(this.searchStr.trim()))) {
      let heightObservable = this.blockService.getBlockByHeight(Number(this.searchStr));
      observable = onErrorResumeNext(
        observable,
        heightObservable
      );
    } else {
      let hashObservable = this.blockService.getBlockByHash(this.searchStr);
      observable = onErrorResumeNext(
        observable, 
        hashObservable
      );
    }
    this.searchSub = observable
    .pipe(
      finalize(() => {
        this.loadingSearchResults = false;
        if (!this.found) {
          this.searchForm.get("searchInput").setErrors({"error":"wasd"});
        }
      })
    )  
    .subscribe((e: Address | Transaction | Block) => {
      this.found = true;
      if (e instanceof Address) {
        this.router.navigate(['/explorer/address/', this.searchStr ]);
      }
      if (e instanceof Transaction) {
        this.router.navigate(['/explorer/tx/', this.searchStr ]);
      }
      if (e instanceof Block) {
        this.router.navigate(['/explorer/blocks/', e.hash ]);
      }
    }, (error) => {
      console.log("got error", error)
    });
  }

}

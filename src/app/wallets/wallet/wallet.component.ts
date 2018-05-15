import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Subscription } from 'rxjs';
import { Observable } from 'rxjs/Observable';

import { CypherResponse } from '../../charts/cypher-response';
import { WalletService } from '../wallet.service';

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.scss']
})
export class WalletComponent implements OnInit {

  sourceAddress: string;

  pageIndex: number = 0;

  pageSize: number = 50;

  addresses: string[];

  pagedAddresses: string[];

  loading: boolean;
  error: boolean;

  subscription: Subscription;

  constructor(private route: ActivatedRoute, private walletService: WalletService) { }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  ngOnInit() {
    let observable: Observable<CypherResponse> = this.route.params
    .filter(params => params.addr)
    .switchMap((params: Params) => {
      this.sourceAddress = params.addr;
      return this.walletService.getAddresses(this.sourceAddress)
    });
    this.loading = true;
    this.error = false;
    this.subscription = observable.subscribe((response: CypherResponse) => {
      this.loading = false;
      this.addresses = response.data.map(row => row[0]);
      this.loadPage();
    }, (error) => {
      this.loading = false;
      this.error = true;
    });
  }

  private loadPage() {
    this.pagedAddresses = this.addresses.slice(this.pageIndex*this.pageSize, (this.pageIndex+1)*this.pageSize);
  }

  onPageChange(event) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadPage();
  }


}

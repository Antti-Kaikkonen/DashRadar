import 'rxjs/add/operator/switchMap';

import { Component, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { TransactionService } from '../../transactions/transaction.service';
import { Transaction } from '../../transactions/transaction/transaction';
import { BlockService } from '../block.service';
import { Block } from './block';

@Component({
  selector: 'app-block',
  templateUrl: './block.component.html',
  styleUrls: ['./block.component.scss'],
  providers: []

})
export class BlockComponent implements OnInit {

	block: Block;
  transactions: Array<Transaction>;
	errorMessage: string;
	error: boolean = false;
  currentTime: number;
  hash: string;

  pageSizeOptions = [10];
  pageSize = this.pageSizeOptions[0];
  length = 100;

  currentPage = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
  	private blockService: BlockService,
    private transactionService: TransactionService,
    private metaService: Meta,
    private titleService: Title) {
      
    }

  ngOnInit() {

    this.route.queryParams
    .filter(e => e.page !== undefined)
    .subscribe(e => {
      if (isNaN(e.page)) {
        this.currentPage = 0;
      } else {
        this.currentPage = Math.max(0, Number(e.page));
      }
      if (this.hash !== undefined) {
        this.transactionService.getTransactionsByBlockHash(this.block.hash, this.currentPage).subscribe(transactions => this.transactions = transactions);
      }
    });

  	this.route.params
    .switchMap((params: Params) => {
      this.hash=params.hash;
      return this.blockService.getBlockByHash(params['hash'])
    }).subscribe(
      (block: Block) => {
        this.titleService.setTitle("Dash Block "+block.height+" | DashRadar");
        this.block = block;
        this.loadBlockTransactions(block);
      },
	    (error: string) =>  {this.errorMessage = error; this.error = true;}
    );

    let currentTime = new Date();
    Observable.timer(1000-currentTime.getMilliseconds(), 1000)
      .subscribe(tick => {
      this.currentTime = new Date().getTime();
    });

  }

  pageChanged(event) {
    this.transactions = undefined;

    this.currentPage = event.pageIndex;

    let urlTree = this.router.parseUrl(this.router.url);
    urlTree.queryParams["page"] = event.pageIndex;
    this.router.navigateByUrl(urlTree);

    //this.transactionService.getTransactionsByBlockHash(this.block.hash, event.pageIndex).subscribe(transactions => this.transactions = transactions);
  }

  private loadBlockTransactions(block: Block) {
    let transactionsByIndex: Map<number, Transaction> = new Map();

    this.transactionService.getTransactionsByBlockHash(block.hash, this.currentPage).subscribe(transactions => this.transactions = transactions);
    /*
    Observable.range(0, block.tx.length)
    .mergeMap(
      (txIndex: number) => //Index in the tx array of the block
      this.transactionService.getTransactionByHash(block.tx[txIndex]).map((transaction: Transaction) => [txIndex, transaction])
    )
    .onErrorResumeNext()//TODO REMOVE!
    .toArray()
    .map(
      (txIndexToTransactionArray: Array<[number, Transaction]>) => 
      Array.from(new Map(txIndexToTransactionArray.sort((a: [number, Transaction], b: [number, Transaction]) => a[0]-b[0])).values())
    )
    .subscribe(
      (transactions : Array<Transaction>) => {this.transactions = transactions},
      (error) => {}
    );*/
  }

}

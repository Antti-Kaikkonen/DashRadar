import 'rxjs/add/operator/switchMap';

import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, Params, Router } from '@angular/router';

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

  static SUPER_BLOCK_EVERY_N_BLOCKS: number = 16616;
  static FIRST_SUPERBLOCK_HEIGHT: number = 332320;

	block: Block;
  transactions: Array<Transaction>;
	errorMessage: string;
	error: boolean = false;
  hash: string;

  superBlock: boolean = false;

  pageSizeOptions = [10];
  pageSize = this.pageSizeOptions[0];
  length = 100;

  currentPage = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
  	private blockService: BlockService,
    private transactionService: TransactionService,
    private datePipe: DatePipe,
    private metaService: Meta,
    private titleService: Title) {
      
  }

  ngOnDestroy() {
    this.metaService.removeTag('name="description"');
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
      this.superBlock = false;
      this.hash=params.hash;
      return this.blockService.getBlockByHash(params['hash'])
    }).subscribe(
      (block: Block) => {
        this.titleService.setTitle("Dash Block #"+block.height+" | DashRadar");
        this.metaService.removeTag('name="description"');
        this.metaService.addTag({
          name: "description", 
          content: this.datePipe.transform(block.time, "mediumDate")+", hash: "+block.hash+", "+block.tx.length+" transaction, "+block.size/1000+" kB"
        });
        this.block = block;
        this.superBlock = (this.block.height%BlockComponent.SUPER_BLOCK_EVERY_N_BLOCKS === 0) && (this.block.height >= BlockComponent.FIRST_SUPERBLOCK_HEIGHT);
        this.loadBlockTransactions(block);
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

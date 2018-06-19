import { DataSource } from '@angular/cdk/collections';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material';
import { PageEvent } from '@angular/material/paginator';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import { BlockService } from '../block.service';
import { Block } from '../block/block';

@Component({
  selector: 'app-blocks-table2',
  templateUrl: './blocks-table2.component.html',
  styleUrls: ['./blocks-table2.component.scss']
})
export class BlocksTable2Component implements OnInit {

	displayedColumns = ['height', 'time', 'transactions'];
  exampleDatabase: BlockDatabase;
  dataSource: BlockDataSource | null;

  pageSizeOptions = [10];
  pageSize = this.pageSizeOptions[0];
  length = 100;

  currentPage = 0;

  lastBlockHeight: number;

  interval: Subscription;

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(private route: ActivatedRoute,
    private router: Router,
    private blockService: BlockService,
    private metaService: Meta,
    private titleService: Title) { 
      titleService.setTitle("Dash Block Explorer | DashRadar");
      this.exampleDatabase = new BlockDatabase(this.blockService, this.lastBlockHeight);
      this.dataSource = new BlockDataSource(this.exampleDatabase);
  }

  ngAfterViewInit() {
    
  }

  updateBlocks() {
    let lastBlock: number = this.lastBlockHeight-this.currentPage*this.pageSize;
    let firstBlock: number = lastBlock-this.pageSize+1;
    this.exampleDatabase.getBlocks(firstBlock, lastBlock);
  }

  ngOnDestroy() {
    this.interval.unsubscribe();
  }  

  ngOnInit() {

    this.interval = Observable.interval(5000).subscribe(() => {
      this.blockService.getHeight().subscribe((newHeight: number) => {
        if (newHeight != this.lastBlockHeight) {
          this.lastBlockHeight = newHeight;
          this.updateBlocks();
        }
      });
    });

    this.route.queryParams
    .filter(queryParams => queryParams.page !== undefined)
    .subscribe(queryParams => {
      if (isNaN(queryParams.page)) {
        this.currentPage = 0;
      } else {
        this.currentPage = Math.max(0, Number(queryParams.page));
      }

      if (this.lastBlockHeight) {
        this.updateBlocks();
      }
    })

    this.get10Blocks();
  }

  pageChanged(event: PageEvent) {
    this.currentPage = event.pageIndex;

    let urlTree = this.router.parseUrl(this.router.url);
    urlTree.queryParams['page'] = ""+event.pageIndex;
    this.router.navigateByUrl(urlTree);

    /*
    console.log("pageEvent", pageEvent);
      let lastBlock: number = this.lastHeight-pageEvent.pageIndex*pageEvent.pageSize;
      let firstBlock: number = lastBlock-pageEvent.pageSize+1;
      console.log("min", firstBlock, "last", lastBlock);
      this.getBlocks(firstBlock, lastBlock);
    */  
  }


  get10Blocks() {
    this.blockService.getHeight()
    .subscribe(
      (height: number) => {
        this.lastBlockHeight = height;
        //this.paginator.pageIndex = 1;
        this.length = height;
        //this.exampleDatabase = new BlockDatabase(this.blockService, this.lastBlockHeight);
        //this.dataSource = new BlockDataSource(this.exampleDatabase);
        this.exampleDatabase.getBlocks(height-9-this.currentPage*10, height-this.currentPage*10);
        //this.getBlocks(height-9, height);
      },
      (error: string) =>  {
        //this.errorMessage = error; this.error=true
      }
    );
  }

}

export class BlockDatabase {
  /** Stream that emits whenever the data has been modified. */
  dataChange: BehaviorSubject<Block[]> = new BehaviorSubject<Block[]>([]);
  get data(): Block[] { return this.dataChange.value; }

  subscription: Subscription;


  constructor(private blockService: BlockService, public lastHeight: number) {
    //paginator.page.subscribe((pageEvent:PageEvent) => this.pageChanged(pageEvent));
  }

  getBlocks(min: number, max: number) {
    this.dataChange.next(new Array(10).fill(new Block(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined)));
    if (this.subscription !== undefined) {
      this.subscription.unsubscribe();
    }

    this.subscription = Observable.range(min, max-min+1)
    .mergeMap((height: number) => this.blockService.getBlockByHeight(height))
    .toArray()
    .map(
      (blocks: Array<Block>) => 
      blocks.sort((block1: Block, block2: Block) => block2.height-block1.height)
    ).subscribe(
      (blocks : Array<Block>) => this.dataChange.next(blocks),
      (error: string) => {
        //this.errorMessage = error; this.error=true;
    });
  }

}

export class BlockDataSource extends DataSource<any> {


  constructor(private _exampleDatabase: BlockDatabase) {
    super();
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<Block[]> {
    const displayDataChanges = [
      this._exampleDatabase.dataChange,
    ];

    return Observable.merge(...displayDataChanges).map(() => {
      let filteredData = this._exampleDatabase.data;//.slice().filter((item: Block) => {
      return filteredData;
    });
  }

  disconnect() {}
}

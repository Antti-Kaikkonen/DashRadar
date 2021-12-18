import { isPlatformBrowser } from '@angular/common';
import { ApplicationRef, ChangeDetectorRef, Component, Inject, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

import { CypherService } from '../../charts/cypher.service';

@Component({
  selector: 'app-blocks-table2',
  templateUrl: './blocks-table2.component.html',
  styleUrls: ['./blocks-table2.component.scss']
})
export class BlocksTable2Component implements OnInit {

	displayedColumns = ['height', 'time', 'transactions'];

  blocks: Block2[] = [];

  pageSizeOptions = [10];
  pageSize = this.pageSizeOptions[0];
  length = 0;

  currentPage = 0;

  interval: Subscription;
  blocksub: Subscription;
  isStableSub: Subscription;

  query: string = "CYPHER planner=rule MATCH (b:BestBlock) WITH b.height as tipHeight MATCH (b:Block)<-[:INCLUDED_IN]-(tx:Transaction) WHERE b.height > tipHeight-($page+1)*$pageSize AND b.height <= tipHeight-$page*$pageSize RETURN b.hash, b.height, b.time, count(tx) as txcount ORDER BY b.height DESC;"


  isBrowser: boolean;

  constructor(private route: ActivatedRoute,
    private router: Router,
    private titleService: Title,
    private cypherService: CypherService,
    private appRef: ApplicationRef,
    private changeDetectorRef: ChangeDetectorRef,
    @Inject(PLATFORM_ID) platformId: string) { 
      this.isBrowser = isPlatformBrowser(platformId);
      this.titleService.setTitle("Dash Block Explorer | DashRadar");
  }

  ngAfterViewInit() {
    
  }

  updateBlocks(force: boolean = false) {
    if (force && this.blocksub != undefined) {
      this.blocksub.unsubscribe();
    }
    if (force || this.blocksub == undefined || this.blocksub.closed) {
      let currentPage: number = this.currentPage;
      this.blocksub = 
      this.cypherService.executeQuery(this.query, {page:currentPage, pageSize:10}).subscribe(e => {
        this.blocks = e.data.map(row => new Block2(row[0], row[1], row[2], row[3]));
        if (this.blocks.length > 0) {
          this.length = this.blocks[0].height+currentPage*10;
        }
        this.changeDetectorRef.detectChanges();
      });
    }  
  }

  ngOnDestroy() {
    if (this.interval !== undefined) this.interval.unsubscribe();
    if (this.blocksub !== undefined) this.blocksub.unsubscribe();
    if (this.isStableSub !== undefined) this.isStableSub.unsubscribe();
  }  

  ngOnInit() {
    if (this.isBrowser) {
      this.isStableSub = this.appRef.isStable.subscribe(stable => {
        if (stable) {
          this.isStableSub.unsubscribe();
          this.interval = interval(2000).subscribe(() => {
            this.updateBlocks();
          });
        }
      });    
    }

    if (!this.route.snapshot.queryParams.page) {
      this.updateBlocks();
    }

    this.route.queryParams
    .pipe(
      filter(queryParams => queryParams.page !== undefined)
    )
    .subscribe(queryParams => {
      if (isNaN(queryParams.page)) {
        this.currentPage = 0;
      } else {
        this.currentPage = Math.max(0, Number(queryParams.page));
      }
      if (this.blocks.length > 0) this.blocks = [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined];
      this.updateBlocks(true);
    });
  }

  pageChanged(event: PageEvent) {
    this.currentPage = event.pageIndex;

    let urlTree = this.router.parseUrl(this.router.url);
    urlTree.queryParams['page'] = ""+event.pageIndex;
    this.router.navigateByUrl(urlTree);
  }


}

export class Block2 {

  constructor(public hash: string, public height: number, public time: number, public txappearances: number) {}

}
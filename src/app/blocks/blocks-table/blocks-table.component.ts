import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { Observable } from 'rxjs/Observable';

import { BlockPropertiesDialogComponent } from '../block-properties-dialog/block-properties-dialog.component';
import { BlockProperty } from '../block-property';
import { BlockService } from '../block.service';
import { Block } from '../block/block';

@Component({
  selector: 'blocks-table',
  templateUrl: './blocks-table.component.html',
  styleUrls: ['./blocks-table.component.scss'],
  providers: []
})
export class BlocksTableComponent implements OnInit {
	
	COLUMN_NAME_AGE = "Age";
	COLUMN_NAME_HEIGHT = "Height";
	COLUMN_NAME_TRANSACTIONS = "Transactions";
	COLUMN_NAME_HASH = "Hash";


	//transactions = new Array<string>("tx1", "tx2");
	blocks: Array<Block>;// = [new Block("asd", 1, 1, 1, 1, "merkelroot", this.transactions, 1, 1, 1, "bits", 1, "chainwork", "prevhash", "nexthash")];
	errorMessage: string;
	error: boolean = false;
	currentTime: number;

	columns: Array<BlockProperty> = [new BlockProperty(this.COLUMN_NAME_HEIGHT, true), 
	new BlockProperty(this.COLUMN_NAME_HASH, false),
	new BlockProperty(this.COLUMN_NAME_AGE, true),
	new BlockProperty(this.COLUMN_NAME_TRANSACTIONS, true)];

	//columns: Map<string, boolean> = new Map([
	//		[this.COLUMN_NAME_HEIGHT, true], [this.COLUMN_NAME_HASH, false], [this.COLUMN_NAME_AGE, true], [this.COLUMN_NAME_TRANSACTIONS, true]
	//]);


	//allColumnNames: Array<string> = [this.COLUMN_NAME_HEIGHT, this.COLUMN_NAME_HASH, this.COLUMN_NAME_AGE, this.COLUMN_NAME_TRANSACTIONS];
	//columnNames: Array<string> = [this.COLUMN_NAME_HEIGHT, this.COLUMN_NAME_AGE, this.COLUMN_NAME_TRANSACTIONS];

	constructor(private blockService: BlockService, public dialog: MatDialog) {
	}

	ngOnInit() {
		this.get5Blocks();
		this.currentTime = new Date().getTime();
		Observable.timer(1000-this.currentTime%1000, 1000)
      .subscribe(tick => {
    	this.currentTime = new Date().getTime();
  	});
	}

	openDialog() {
		let config = new MatDialogConfig();
		config.data = {properties : this.columns};
		//config.data = {usedBlockProperties : this.columnNames,
		//							allBlockProperties : this.allColumnNames};
    let dialogRef = this.dialog.open(BlockPropertiesDialogComponent, config);
    dialogRef.afterClosed().subscribe(result => {
    });
  }

  get5Blocks() {
  	this.blockService.getHeight()
		.subscribe(
	   	(height: number) => this.getBlocks(height-5, height),
			(error: string) =>  {this.errorMessage = error; this.error=true}
		);
	}

	getBlocks(min: number, max: number) {

		Observable.range(min, max-min+1)
		.mergeMap((height: number) => this.blockService.getBlockByHeight(height))
		.toArray()
		.map(
			(blocks: Array<Block>) => 
			blocks.sort((block1: Block, block2: Block) => block2.height-block1.height)
		)
		.subscribe(
			(blocks : Array<Block>) => this.blocks = blocks,
			(error: string) => {this.errorMessage = error; this.error=true;}
		)
	}

}
import { Component, Inject, OnInit, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { DragulaService } from 'ng2-dragula/ng2-dragula';

import { BlockProperty } from '../block-property';

@Component({
  selector: 'app-block-properties-dialog',
  templateUrl: './block-properties-dialog.component.html',
  styleUrls: ['./block-properties-dialog.component.scss'],
  viewProviders: [DragulaService],
})
export class BlockPropertiesDialogComponent implements OnInit {

  //allBlockProperties: Array<string>;
	//usedBlockProperties: Array<string>;
  properties: Array<BlockProperty>;

  constructor(
    private dragulaService: DragulaService,
  	public dialogRef: MatDialogRef<BlockPropertiesDialogComponent>,
  	@Optional() @Inject(MAT_DIALOG_DATA) private dialogData: any
	) { }


  ngOnInit() {
    this.properties = this.dialogData.properties;
    //this.allBlockProperties = this.dialogData.allBlockProperties;
    //this.usedBlockProperties = this.dialogData.usedBlockProperties;

    this.dragulaService.drop.subscribe((value) => {
    });

    this.dragulaService.dropModel.subscribe((bagName, el, target, source) => {
    });
  }

  toggle(blockProperty: BlockProperty) {
    blockProperty.active = !blockProperty.active;
    //var index = this.usedBlockProperties.indexOf(blockProperty);
    //if (index > -1) {
    //  this.usedBlockProperties.splice(index, 1);
    //} else {
    //  let i = this.allBlockProperties.indexOf(blockProperty)-1;
    //  for (i; i >= 0; i--) {
    //    let currentProperty = this.allBlockProperties[i];
    //    console.log("looking for ", currentProperty, "in usedBlockProperties");
    //    let i2 = this.usedBlockProperties.indexOf(currentProperty);
    //    if (i2 !== -1) {
    //      this.usedBlockProperties.splice(i2+1, 0, blockProperty);
    //      break;
    //    }
    //  }
    //  if (i == -1) {
    //    this.usedBlockProperties.splice(0, 0, blockProperty);
    //  }
    //}
    //console.log(blockProperty);
  }

}

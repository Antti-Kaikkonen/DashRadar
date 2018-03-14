import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { VivagraphSettings } from '../../settings/vivagraph-settings';

@Component({
  selector: 'app-vivagraph-settings',
  templateUrl: './vivagraph-settings.component.html',
  styleUrls: ['./vivagraph-settings.component.scss']
})
export class VivagraphSettingsComponent implements OnInit {

	@Input()
	vivagraphSettings: VivagraphSettings;

	@Output() onSettingsChanged = new EventEmitter<VivagraphSettings>();

	onChange(event) {
		this.vivagraphSettings = Object.assign({}, this.vivagraphSettings);
		this.onSettingsChanged.emit(this.vivagraphSettings);
	}

  constructor() { }

  ngOnInit() {
  }

  restoreDefaults() {
  	this.vivagraphSettings=new VivagraphSettings();
  	this.onSettingsChanged.emit(this.vivagraphSettings);
  }

}

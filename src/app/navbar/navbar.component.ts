import { Component, OnInit } from '@angular/core';
import { MatIconRegistry } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';

//import {Http} from '@angular/http'

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  viewProviders: [MatIconRegistry]
})
export class NavbarComponent implements OnInit {

  constructor(iconReg: MatIconRegistry, sanitizer: DomSanitizer) { 
    //console.log("test");
    iconReg.addSvgIcon('dash_alt', sanitizer.bypassSecurityTrustResourceUrl('assets/SVG/DASH-alt.svg'));
  }

  ngOnInit() {
  }

}

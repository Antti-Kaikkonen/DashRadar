import { MediaMatcher } from '@angular/cdk/layout';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatIconRegistry } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  viewProviders: [MatIconRegistry]
})
export class NavbarComponent implements OnInit {

  mobileQuery: MediaQueryList;
  private _mobileQueryListener: () => void;
  title: string;

  constructor(changeDetectorRef: ChangeDetectorRef, media: MediaMatcher,
    private route:ActivatedRoute,
    private router:Router) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
  }

  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }

  ngAfterViewInit() {
  }

  ngOnInit() {
    this.router.events.pipe(
      filter(event => event['snapshot'] && event['snapshot'].data && event['snapshot'].data.title)
    ).subscribe(e => this.title = e['snapshot'].data.title);
    //this.router.events.subscribe(e => console.log("e", e));
    //this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(e => console.log("event", e));
  }

}

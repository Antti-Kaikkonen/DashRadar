import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { environment } from '../../environments/environment';
import { Address } from './address/address';

@Injectable()
export class AddressService {

	private addressesByAddress: Map<string, Observable<Address>>;

  constructor(private http: Http) {
  	this.addressesByAddress = new Map();
  }

  public getAddress(address: string, useCache: boolean = false):  Observable<Address> {
  	if (useCache !== true || !this.addressesByAddress.has(address)) {
  		let addressObservable: Observable<Address> = this.http.get(this.addressURL(address, false, 0, 1000))
        .map(res => this.insightResponseToAddress(res))
        /*.retryWhen(attempts => Observable.range(1, 3)
	        .zip(attempts, i => i)
	        .mergeMap(i => {
	          console.log("delay address retry by " + i + " second(s)");
	          return Observable.timer(i * 1000);
	        })
	      )*/
        .publishReplay(1).refCount();//to cache the result in this observable
  		this.addressesByAddress.set(address, addressObservable);
  	}
  	return this.addressesByAddress.get(address);
	}

  private addressURL(address: string, notxlist?: boolean, from?: number, to?: number) {
		let base = environment.insightApiUrl+"/addr/"+address;
		if (notxlist) {
			base += "?notxlist=1";
		}	else {
			if (from && to) {
				base += "?from="+from+"&to="+to;
			} else {
				base += "?from=0&to=1000";
			}
		}
		return base;
	}

	private insightResponseToAddress(response: any): Address {
		var data = response.json();
		return new Address(
			data.addrStr, 
			data.balance, 
			data.totalReceived, 
			data.totalSent, 
			data.unconfirmedBalance, 
			data.unconfirmedTxApperances, 
			data.txApperances, 
			data.transactions
		);
	}

}

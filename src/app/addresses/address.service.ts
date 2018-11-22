import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, publishReplay, refCount } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { Address } from './address/address';

@Injectable()
export class AddressService {

	private addressesByAddress: Map<string, Observable<Address>>;

  constructor(private http: HttpClient) {
  	this.addressesByAddress = new Map();
  }

  public getAddress(address: string, useCache: boolean = false):  Observable<Address> {
  	if (useCache !== true || !this.addressesByAddress.has(address)) {
			let addressObservable: Observable<Address> = this.http.get(this.addressURL(address, false, 0, 1000))
			.pipe(
				map(res => this.insightResponseToAddress(res)),
				publishReplay(1),
				refCount()
			)
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
		var data = response;
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

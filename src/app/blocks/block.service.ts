import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';

import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { environment } from '../../environments/environment';
import { Block } from './block/block';

@Injectable()
export class BlockService {

	private heightURL = environment.insightApiUrl+'/sync';

	private blocksByHash: Map<string, Observable<Block>>;//blockCache

	constructor(private http: Http) { 
		this.blocksByHash = new Map();
	}

	getBlockByHash(hash: string):  Observable<Block> {
		if (!this.blocksByHash.has(hash)) {
			let blockObservable: Observable<Block> = this.http.get(this.blockByHashtURL(hash))
        .map(res => this.insightResponseToBlock(res))
        .publishReplay(1).refCount()//to cache the result in this observable
        .catch(res => this.handleError(res));
			this.blocksByHash.set(hash, blockObservable);
		}
		return this.blocksByHash.get(hash);
	}

	getBlockByHeight(height: number): Observable<Block> {
		return this.http.get(this.blockByHeightURL(height))
		  .map((response : Response) => response.json())
		  .mergeMap(jsonData => this.getBlockByHash(jsonData.blockHash))
      //.map(res => this.blockCypherResponseToBlock(res))
      .catch(res => this.handleError(res));
	}

	getHeight(): Observable<number> {
  	return this.http.get(this.heightURL)
      .map(res => res.json().blockChainHeight)
      .catch(res => this.handleError(res));
	}

	private insightResponseToBlock(response: any): Block {
		var data = response.json();
		return new Block(data.hash, data.confirmations, data.size, data.height, data.version, data.merkleroot, data.tx, data.time*1000, 1, 1, "bits", 1, "chainwork", "prevhash", "nexthash");
	}


	private handleError (error: Response | any) {
		console.log("blockService handleError", error);
    let errMsg: string;
    if (error instanceof Response) {
			let body;
			try {
				body = error.json() || '';
			} catch(e) {
				body = '';
			}
			const err = body.error || JSON.stringify(body);
      errMsg = error.status + " - " + error.statusText || '' +err;
    } else {
			errMsg = error.message ? error.message : error.toString();
    }
    console.error(errMsg);
    return Observable.throw(errMsg);
	}

	private blockByHeightURL(height: number) {
		return environment.insightApiUrl+"/block-index/"+height;
	}

	private blockByHashtURL(hash: string) {
		return environment.insightApiUrl+"/block/"+hash;
	}

}

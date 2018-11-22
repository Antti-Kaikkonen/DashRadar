import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, mergeMap, publishReplay, refCount } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { Block } from './block/block';

@Injectable()
export class BlockService {

	private heightURL = environment.insightApiUrl+'/sync';

	private blocksByHash: Map<string, Observable<Block>>;//blockCache

	constructor(private http: HttpClient) { 
		this.blocksByHash = new Map();
	}

	getBlockByHash(hash: string):  Observable<Block> {
		if (!this.blocksByHash.has(hash)) {
			let blockObservable: Observable<Block> = this.http.get(this.blockByHashtURL(hash))
			.pipe(
				map(res => this.insightResponseToBlock(res)),
				publishReplay(1),
				refCount()
			)
			this.blocksByHash.set(hash, blockObservable);
		}
		return this.blocksByHash.get(hash);
	}

	getBlockByHeight(height: number): Observable<Block> {
		return this.http.get<any>(this.blockByHeightURL(height))
		.pipe(
			mergeMap(jsonData => this.getBlockByHash(jsonData.blockHash))
		);
	}

	getHeight(): Observable<number> {
		return this.http.get<any>(this.heightURL)
		.pipe(
			map(res => res.blockChainHeight)
		);
	}

	private insightResponseToBlock(data: any): Block {
		//var data = response.json();
		return new Block(data.hash, data.confirmations, data.size, data.height, data.version, data.merkleroot, data.tx, data.time*1000, 1, 1, "bits", 1, "chainwork", "prevhash", "nexthash");
	}

	private blockByHeightURL(height: number) {
		return environment.insightApiUrl+"/block-index/"+height;
	}

	private blockByHashtURL(hash: string) {
		return environment.insightApiUrl+"/block/"+hash;
	}

}

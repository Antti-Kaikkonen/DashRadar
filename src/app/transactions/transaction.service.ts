import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';

import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { environment } from '../../environments/environment';
import { Transaction } from './transaction/transaction';
import { VIn } from './transaction/vin';
import { VOut } from './transaction/vout';

@Injectable()
export class TransactionService {

  private transactionsByHash: Map<string, Observable<Transaction>>;//Transaction cache

  constructor(private http: Http) {
  	 	this.transactionsByHash = new Map();
  }

  getTransactionsByAddress(address: string, page: number): Observable<Transaction[]> {
    let transactionsObservable: Observable<Transaction[]> = this.http.get(this.transactionUrlByAddress(address, page))
    .map(response => response.json().txs.map(transaction => Transaction.FromInsightJSON(transaction)));
    return transactionsObservable;
  }

  getTransactionsByBlockHash(blockhash: string, page: number) : Observable<Transaction[]> {
    let transactionsObservable: Observable<Transaction[]> = this.http.get(this.transactionUrlByBlockHash(blockhash, page))
    .map(response => response.json().txs.map(transaction => Transaction.FromInsightJSON(transaction)));
    return transactionsObservable;
  }

  getTransactionByHash(hash: string, useCache: boolean = false): Observable<Transaction> {
  	if (useCache !== true || !this.transactionsByHash.has(hash)) {
			let transactionObservable: Observable<Transaction> = this.http.get(this.transactionUrlByTxId(hash))
      .map(res => this.insightResponseToTransaction(res))
      .publishReplay(1).refCount()//to cache the result in this observable
      //.catch(res => this.handleError(res));
			this.transactionsByHash.set(hash, transactionObservable);
		}
		return this.transactionsByHash.get(hash);
  }	

	private transactionUrlByTxId(txId: string) {
    return environment.insightApiUrl+"/tx/"+txId;
  } 
  
  private transactionUrlByAddress(address: string, page: number) {
    return environment.insightApiUrl+"/txs?address="+address+"&pageNum="+page;
  } 

  private transactionUrlByBlockHash(blockhash: string, page: number) {
    return environment.insightApiUrl+"/txs?block="+blockhash+"&pageNum="+page;
  }


  private insightResponseToTransaction(response: any): Transaction {
    var data = response.json();
    return Transaction.FromInsightJSON(data);
  }


  getOutputFromInput(input: VIn): Observable<VOut> {
    if (input.txid === undefined) return Observable.throw("no txid specified");
    return this.getTransactionByHash(input.txid)
    .map((transaction: Transaction) => transaction.vout[input.vout]);
  }

	private handleError (error: Response | any) {
    // In a real world app, you might use a remote logging infrastructure
    let errMsg: string;
    if (error instanceof Response) {
      const body = error.json() || '';
      const err = body.error || JSON.stringify(body);
      errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
    } else {
      errMsg = error.message ? error.message : error.toString();
    }
    console.error(errMsg);
    return Observable.throw(errMsg);
	}

}

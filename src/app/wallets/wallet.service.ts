import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import { environment } from '../../environments/environment';
import { CypherService } from '../charts/cypher.service';

@Injectable({
  providedIn: 'root'
})
export class WalletService {

  private cypherURL: string = environment.cypherUrl;

  constructor(private http: Http, private cypherService: CypherService) { }


  getWalletAddressCount(sourceAddress: string) {
    let query: string = "MATCH (c:MultiInputHeuristicCluster)<-[:INCLUDED_IN]-(:Address {address:$address})\n"
    +"RETURN c.clusterSize;";
    return this.cypherService.executeQuery(query, {address:sourceAddress});
  }

  getWalletAddresses(sourceAddress:string) {

    let query: string = "MATCH (c:MultiInputHeuristicCluster)<-[:INCLUDED_IN]-(:Address {address:$address})\n"
    +"MATCH (c)<-[:INCLUDED_IN]-(a:Address) RETURN a.address;";
    /*let query: string = "MATCH (c:MultiInputHeuristicCluster)<-[:INCLUDED_IN]-(:Address {address:\""+sourceAddress+"\"})\n"
    +"WITH c\n"
    +"MATCH (c)<-[:INCLUDED_IN]-(a:Address)<-[:ADDRESS]-(output:TransactionOutput)\n"
    +"WITH a, sum(output.valueSat)/100000000.0 as totalReceived\n"
    +"OPTIONAL MATCH (a)-[:ADDRESS]-(output:TransactionOutput)-[:SPENT_IN]->(:TransactionInput)\n"
    +"WITH a.address as address, totalReceived, sum(output.valueSat)/100000000.0 as totalSpent\n"
    +"WITH address, totalReceived, totalSpent, totalReceived-totalSpent as balance\n"
    +"RETURN address, totalReceived, totalSpent, balance ORDER BY -balance;"
    */
    return this.cypherService.executeQuery(query, {address:sourceAddress});
  }
}

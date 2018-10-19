import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { environment } from '../../environments/environment';
import { CypherService } from '../charts/cypher.service';

@Injectable({
  providedIn: 'root'
})
export class WalletService {

  private cypherURL: string = environment.cypherUrl;

  constructor(private http: HttpClient, private cypherService: CypherService) { }


  getWalletAddressCount(sourceAddress: string) {
    let query: string = "MATCH (c:MultiInputHeuristicCluster)<-[:INCLUDED_IN]-(:Address {address:$address})\n"
    +"RETURN c.clusterSize;";
    return this.cypherService.executeQuery(query, {address:sourceAddress});
  }

  getWalletAddresses(sourceAddress:string) {
    let query = "MATCH (oa:Address {address:$address})\n" +
    "WITH oa\n" +
    "OPTIONAL MATCH (c:MultiInputHeuristicCluster)<-[:INCLUDED_IN]-(oa)\n" +
    "WITH c, oa\n" +
    "OPTIONAL MATCH (c)<-[:INCLUDED_IN]-(a:Address)\n" +
    "RETURN \n" +
    "CASE c WHEN NULL THEN oa.address ELSE a.address END as address;"
    return this.cypherService.executeQuery(query, {address:sourceAddress});
  }
}

import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { environment } from '../../environments/environment';
import { CypherResponse } from './cypher-response';


@Injectable()
export class CypherService {

	private cypherURL: string = environment.cypherUrl;

	constructor(private http: Http) { 
	}


	executeQuery(query: string, params: object): Observable<CypherResponse> {
		let a: Observable<{columns: String[]}> = null;
		return this.http.post(this.cypherURL, {query: query, params: params})
		.map((response: Response) => {
			let json = response.json();
			return {
				columns: json.columns,
				data: json.data
			};
		});
	}

}

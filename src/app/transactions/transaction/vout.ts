"use strict";
import {ScriptPubKey} from './script-pub-key';

export class VOut {

	constructor(
    public value: number,
    public valueSat: number,
    public n: number,
    public scriptPubKey: ScriptPubKey,
    public sequence: number[],
   	public spentTxId: string,//Insight specific
   	public spentIndex: number//Insight specific
	) {  }

	static FromInsightJSON(json: any): VOut {
		return new this(Number(json.value), Math.round(Number(json.value)*100000000), json.n, json.scriptPubKey, json.sequence, json.spentTxId, Number(json.spentIndex));
	}

}

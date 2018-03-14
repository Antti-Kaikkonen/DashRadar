import {ScriptSig} from './script-sig'

export class VIn {

	constructor(
    public coinbase: string,//Only first transaction
    public txid: string,
    public vout: number,
    public scriptSig: ScriptSig,
    public sequence: number[],
    public addr: string,
    public valueSat: number,
    public value: number
	) {  }

	static FromInsightJSON(json: any): VIn {
		return new this(json.coinbase, json.txid, Number(json.vout), json.scriptSig, json.sequence, json.addr, Number(json.valueSat), Number(json.value));
	}
}

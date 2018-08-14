import { VIn } from './vin';
import { VOut } from './vout';

export class Transaction {

	constructor(
    public txid: string,//a.k.a. Hash
    public size: number,
    public version: number,
    public locktime: number,
    public time: number,
    public vin: VIn[],
    public vout: VOut[],
		public txlock: boolean,
		public blockhash: string,
		public blockheight: number,
		public confirmations: number
	) {  }

	static FromInsightJSON(json: any): Transaction {
		return new this(json.txid, 
			json.size, 
			Number(json.version), 
			Number(json.locktime), 
			json.time,
			json.vin.map(vin => VIn.FromInsightJSON(vin)),
			json.vout.map(vout => VOut.FromInsightJSON(vout)),
			json.txlock,
			json.blockhash,
			Number(json.blockheight),
			Number(json.confirmations)
		);
	}

	public static isDenomination(value: number): boolean {
    return (value == 0.0100001 || value == 0.100001 || value == 1.00001 || value == 10.0001 || value == 100.001); 
	}
	
	public isCreateDenominationsTransaction(): boolean {
    //All outputs except change address should be denominations
    if (this.vout.length < 2) return false;
		let nonDenominations: Array<VOut> = this.vout.filter((vout: VOut) => !Transaction.isDenomination(vout.value));
		if (nonDenominations.length === this.vout.length) return false;//Must contain at least one denomination
    if (nonDenominations.length < 2) return true;
    if (nonDenominations.length === 2) {
      return nonDenominations.some((vout: VOut) => vout.value == 0.04 || vout.value == 0.004);
    }
    return false;
  }

	public isMixingTransaction() {
    if (this.vin.length !== this.vout.length) return false;
    if (this.vin.length < 3) return false;
    let denomination = this.vin[0].value;
    if (!Transaction.isDenomination(denomination)) {
      return false;
    }
    return this.vin.every((vin: VIn) => vin.value == denomination) && this.vout.every((vout: VOut) => vout.value == denomination);
	}
	
	public isPrivateSendTransaction(): boolean {
    if (this.vout.length !== 1) return false;
    return this.vin.every(vin => Transaction.isDenomination(vin.value));
  }

	public calculateTotalInputs(): number {
		return Transaction.roundToSatoshis(this.vin.filter(vin => vin.value !== undefined)
		.map(vin => vin.value)
		.reduce((previous: number, current: number) => (previous+current), 0));
	}

	public calculateTotalOutputs(): number {
		return Transaction.roundToSatoshis(this.vout.filter(vout => vout.value !== undefined)
		.map((vout: VOut) => vout.value)
		.reduce((previousValue, currentValue) => {
			return previousValue+currentValue;
		}, 0));
	}

	public isCoinbase() {
		return this.vin.length === 1 && this.vin[0].coinbase !== undefined;
	}


	private static roundToSatoshis(value: number) {
		return Math.round(value*100000000)/100000000;
	}


	public calculateFee(): number {
		if (!this.isCoinbase()) {
			return Transaction.roundToSatoshis(this.calculateTotalInputs()-this.calculateTotalOutputs());
		}
	}
	
}
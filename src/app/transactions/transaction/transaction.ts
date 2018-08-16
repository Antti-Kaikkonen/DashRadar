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
		if (this.isMixingTransaction()) return false;
    if (this.vout.length < 2) return false;
		let nonDenominations: Array<VOut> = this.vout.filter((vout: VOut) => !Transaction.isDenomination(vout.value));
		if (nonDenominations.length === this.vout.length) return false;//Must contain at least one denomination
    if (nonDenominations.length < 2) return true;
    if (nonDenominations.length === 2) {
      return nonDenominations.some((vout: VOut) => vout.value == 0.04 || vout.value == 0.004);
    }
    return false;
	}
	
	public isCollateralPaymentTransaction(): boolean {
		if (this.vin.length !== 1 || this.vout.length !== 1 || this.isCoinbase()) return false;
		let vin: VIn = this.vin[0];
		let vout: VOut = this.vout[0];
		if (Transaction.isCollateralPaymentOutput(vout.valueSat)) {
			let fee: number = vin.valueSat-vout.valueSat;
			if (fee === 100000 || fee === 1000000) return true;
			console.log("not collateral inputs tx", fee);
		}
		return false;
	}

	public static isMakeCollateralInputsOutput(valueSat: number): boolean {
		return valueSat === 400000 || valueSat === 4000000;
	}

	public static isCollateralPaymentOutput(valueSat: number): boolean {
		if (valueSat % 100000 === 0 && valueSat < 400000 && valueSat > 0) return true;
		if (valueSat % 1000000 === 0 && valueSat < 4000000 && valueSat > 0) return true;
		return false;
	}

	public isMakeCollateralInputsTransaction(): boolean {
		return this.vout.findIndex(vout => vout.valueSat === 400000 || vout.valueSat === 4000000) !== -1;
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
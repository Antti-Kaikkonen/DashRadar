export class Address {
	constructor(
		public addrStr: string,
		public balance: number,
		public totalReceived: number,
		public totalSent: number,
		public unconfirmedBalance: number,
		public unconfirmedTxApperances: number,
		public txApperances: number,
		public transactions: Array<string>) {
	}
}

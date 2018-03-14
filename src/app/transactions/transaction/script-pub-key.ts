export class ScriptPubKey {

	constructor(
    public asm: string,
    public hex: string,
    public reqSigs: number,
    public type: string,
    public addresses: string[]
	) {  }

}

export class Block {
    constructor(
        public hash: string,
        public confirmations: number,
        public size: number,
        public height: number,
        public version: number,
        public merkleroot: string,
        public tx: string[],
        public time: number,
        public mediantime: number,
        public nonce: number,
        public bits: string,
        public difficulty: number,
        public chainwork: string,
        public previousblockhash: string,
        public nextblockhash: string
    ) {  }
}
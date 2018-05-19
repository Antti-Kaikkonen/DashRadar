export class VivagraphSettings {

	public edgeLineWidth: number;
	public iconSize: number;
	public shrinkExpanded: boolean;

	public scaleEdgeLines: boolean;

	public gravity: number;
	public dragCoeff: number;
	public springCoeff: number;

	public soundEnabled: boolean;
	public liveMaxTransactions: number;

	public showValues: boolean;

	public shapeRendering: "auto" | "optimizeSpeed" | "crispEdges" | "geometricPrecision";

	public maxNodeEdges: number;

	constructor() {
		this.edgeLineWidth = 1;
		this.iconSize = 30;
		this.shrinkExpanded = true;

		this.scaleEdgeLines = false;

		this.gravity = -10;
		this.dragCoeff = 0.1;
		this.springCoeff = 0.0004;

		this.soundEnabled = true;
		this.liveMaxTransactions = 500;

		this.showValues = false;

		this.shapeRendering = "auto";

		this.maxNodeEdges = 200;
	}
}

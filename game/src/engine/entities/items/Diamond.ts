import type Id from "../../IdGenerator";
import type { Coord } from "../../types";
import { utils } from "../../utils";
import { Item, type ItemConfig } from "./Item";

interface DiamondConfig extends ItemConfig {
}

export class Diamond extends Item {
	static override readonly typeName: string = "Diamond";
	static override readonly spritePos: Coord = { x: 2, y: 1 };
	declare id: Id<Diamond>;

	constructor(config: DiamondConfig) {
		config.drawPos = utils.GridToDraw(config.gridPos)
		super(config);
		
	}
}
import { GameObject } from "../GameObject.js";
import { TileMarkerColor, type Coord } from "../types";
import { utils } from "../utils.js";

export interface Tile {
	spritePos: Coord;
}

export class TileMarker extends GameObject {
	color: TileMarkerColor
	bobs: boolean

	constructor(
		pos: Coord,
		color: TileMarkerColor,
		bobs: boolean,
	) {
		let y = color.valueOf()

		const config = {
			drawPos: utils.GridToDraw(pos),
			spriteConfig: {
				src: "/static/assets/spritesheets/tile_marker.png",
				cropSize: { width: 16, height: 16 },
				drawSize: { width: 16, height: 16 },
				animations: {
					idle: [{ frame: { x: 0, y } }],
					bob: [{ frame: { x: 0, y } }, { frame: { x: 1, y } }],
				},
				currentAnim: bobs ? "bob" : "idle",
				drawOffset: { x: 0, y: 0 },
			},
		};
		super(config);

		this.color = color;
		this.bobs = bobs
	}
	
	set Coord(val: Coord) {
		this.drawPos = utils.GridToDraw(val)
	}

	updateSprite(change: Partial<{ color: TileMarkerColor, bobs: boolean }>) {
		let y = change.color?.valueOf() ?? this.color.valueOf()
		let bobs = change.bobs ?? this.bobs

		let newAnimations = {
			idle: [{ frame: { x: 0, y } }],
			bob: [{ frame: { x: 0, y } }, { frame: { x: 1, y } }],
		}

		this.sprite.animations = newAnimations
		this.sprite.currentAnimation = bobs ? "bob" : "idle"
	}

}

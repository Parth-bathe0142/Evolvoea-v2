import { GameObject, type GameObjectConfig } from "../GameObject.js";
import type Id from "../IdGenerator.js";
import { TileMarkerColor, type Coord } from "../types";
import { utils } from "../utils.js";

export interface Tile {
	spritePos: Coord;
}

export interface TileMarkerConfig extends GameObjectConfig {
	pos: Coord
	color: TileMarkerColor
	bobs: boolean
}

export class TileMarker extends GameObject {
	static override readonly typeName: string = "TileMarker";
	color: TileMarkerColor
	bobs: boolean
	declare id: Id<TileMarker>

	constructor(
		config: TileMarkerConfig
	) {
		let x = config.color.valueOf()

		config = {
			...config,
			type: TileMarker.typeName,
			drawPos: utils.GridToDraw(config.pos),
			spriteConfig: {
				src: "/static/assets/spritesheets/tile_marker.png",
				cropSize: { width: 16, height: 16 },
				drawSize: { width: 16, height: 16 },
				animations: {
					idle: [{ frame: { x, y: 0 } }],
					bob: [{ frame: { x, y: 0 } }, { frame: { x, y: 1 } }],
				},
				currentAnim: config.bobs ? "bob" : "idle",
				drawOffset: { x: 0, y: 0 },
			},
		};
		super(config as GameObjectConfig);

		this.color = config.color;
		this.bobs = config.bobs
	}
	
	set Coord(val: Coord) {
		this.drawPos = utils.GridToDraw(val)
	}

	updateSprite(change: Partial<{ color: TileMarkerColor, bobs: boolean }>) {
		let x = change.color?.valueOf() ?? this.color.valueOf()
		let bobs = change.bobs ?? this.bobs

		let newAnimations = {
			idle: [{ frame: { x, y: 0 } }],
			bob: [{ frame: { x, y: 0 } }, { frame: { x, y: 1 } }],
		}

		this.sprite.animations = newAnimations
		this.sprite.currentAnimation = bobs ? "bob" : "idle"
	}

	moveTo(coord: Coord) {
		this.drawPos = utils.GridToDraw(coord)
	}
}

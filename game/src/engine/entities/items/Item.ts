import { GameObject, type GameObjectConfig } from "../../GameObject";
import type Id from "../../IdGenerator";
import type { Scene } from "../../scene";
import type { SpriteConfig } from "../../Sprite";
import type { Coord } from "../../types";
import { utils } from "../../utils";

export interface ItemConfig extends GameObjectConfig {
	gridPos: Coord
	spritePos: Coord
}

export class Item extends GameObject {
	static override readonly typeName: string = "Item";
	static readonly spritePos: Coord = { x: 0, y: 0 }

	static drop(pos: Coord, scene: Scene): Id<Item> {
		const config: ItemConfig = {
			type: this.typeName,
			gridPos: pos,
			spritePos: this.spritePos,
			spriteConfig: {
				src: "static/assets/spritesheets/dungeon_items.png",
				animations: {
					"bob": [
						{ frame: { x: 0, y: 0 }, duration: 32 },
						{ frame: { x: 0, y: 0 }, duration: 32, offset: { x: 0, y: -3 } }
					]
				},
				currentAnim: "bob"
			},
		}

		const item = new Item(config)
		scene.addEntity(item)
		scene.items.push(item.id)
		
		return item.id
	}

	declare id: Id<Item>;

	constructor(config: ItemConfig) {
		config.drawPos = utils.GridToDraw(config.gridPos)
		for (const anim of Object.values(config.spriteConfig!.animations!)) {
			for (const frame of anim) {
				frame.frame.x += config.spritePos.x;
				frame.frame.y += config.spritePos.y;
			}
		}
		super(config as GameObjectConfig);
		
	}
}
import Id from "./IdGenerator.js";
import { type Coord, type GameObjectClass } from "./types";
import { Sprite, type SpriteConfig } from "./Sprite.js";

/**
 * @param drawPos Optional, starting position of the object on the grid
 * @param spriteConfig The sprite corresponding to this game object
 */
export interface GameObjectConfig {
	type: string;
	drawPos?: Coord;
	spriteConfig: SpriteConfig;
	id?: number;
}

/**
 * The root class for all ingame entities. Contains
 * only sprite and draw position information
 */
export abstract class GameObject {
	static readonly typeName: string = "GameObject";

	id: Id;
	drawPos: Coord = { x: 0, y: 0 };
	sprite: Sprite;
	isValid: boolean = true;
	eventListeners: Map<string, EventListener> = new Map();

	constructor(config: GameObjectConfig) {
		const cls = this.constructor as GameObjectClass;
		this.id = (
			config.id !== undefined ? Id.bookId(cls, config.id) : Id.create(cls)
		) as Id<this>;

		this.drawPos = config.drawPos || { x: 0, y: 0 };

		config.spriteConfig.gameObject = this;
		this.sprite = new Sprite(config.spriteConfig);
	}
	/**
	 * only updates the sprite if it is animated,
	 * otherwise does nothing
	 */
	update(): void {
		this.sprite.isAnimated && this.sprite.updateSprite();
	}

	destroy() {
		this.sprite.destroy();
		this.isValid = false;

		for (const [string, listener] of this.eventListeners) {
			document.removeEventListener(string, listener);
		}
	}
}

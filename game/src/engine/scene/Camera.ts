import { utils } from "../utils.js";
import type { Coord } from "../types";
import type Id from "../IdGenerator.js";
import type { Scene } from "./index.js";

interface CameraConfig {
	center?: Coord;
	scene: Scene;
	entity?: Id;
}

/**
 * A camera that is used to calculate where to draw
 * objects based on a selected object. It may not be
 * following anyone. It is a movable object with
 * default speed of 2 so it follows the object smoothly
 */
export class Camera {
	center: Coord;
	scene: Scene;
	entity?: Id;

	get offset(): Coord {
		let obj
		if (this.entity && (obj = this.scene.getEntityById(this.entity))) {
			return {
				x: this.center.x - obj.drawPos.x,
				y: this.center.y - obj.drawPos.y,
			};
		} else {
			return { x: 0, y: 0 };
		}
	}

	constructor(config: CameraConfig) {
		this.center = config.center ?? utils.GridToDraw({ x: 12, y: 7 });
		this.scene = config.scene;
		if (config.entity) {
			this.entity = config.entity;
		}
	}

	follow(entity: Id) {
		this.entity = entity;
	}
}

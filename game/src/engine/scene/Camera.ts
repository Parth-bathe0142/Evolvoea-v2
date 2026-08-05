import { utils } from "../utils.js";
import { GameObject } from "../GameObject.js";
import type { Coord } from "../misc.js";

interface CameraConfig {
    center?: Coord
    object?: GameObject
}

/**
 * A camera that is used to calculate where to draw
 * objects based on a selected object. It may not be 
 * following anyone. It is a movable object with 
 * default speed of 2 so it follows the object smoothly
 */
export class Camera {
    center: Coord
    object: GameObject | null = null

    get offset(): Coord {
        if(this.object) {
            return {
                x: this.center.x - this.object.drawPos.x,
                y: this.center.y - this.object.drawPos.y
            }
        } else {
            return { x: 0, y: 0 }
        }
    }

    constructor(config: CameraConfig) {
        this.center = config.center ?? utils.GridToDraw({ x: 12, y: 7 })
        this.object = config.object ?? null
    }

    follow(object: GameObject | null) {
        this.object = object
    }
}
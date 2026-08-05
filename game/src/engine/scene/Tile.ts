import { GameObject } from "../GameObject.js";
import type { Coord } from "../misc.js";
import { utils } from "../utils.js";

export interface Tile {
    spritePos: Coord
}

export class TileMarker extends GameObject {
    constructor(pos: Coord) {
        const config = {
            drawPos: utils.GridToDraw(pos),
            spriteConfig: {
                src: "/static/assets/spritesheets/tile_marker.png",
                cropSize: { width: 16, height: 16 },
                drawSize: { width: 16, height: 16 },
                animations: {
                    "bob": [
                        { frame: { x: 0, y: 0 }},
                        { frame: { x: 1, y: 0 }}
                    ]
                },
                currentAnim: "bob",
                drawOffset: { x: 0, y: 0 }
                
            }
        }
        super(config)
    }
}
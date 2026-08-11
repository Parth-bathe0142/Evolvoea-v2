import type { Scene } from "../scene";
import type { Camera } from "../scene/Camera";
import { TileMarker } from "../scene/Tile.js";
import type { Coord } from "../types";
import { utils } from "../utils.js";

export interface MouseInputConfig {
	scene: Scene
}

export default class MouseInput {
	scene: Scene
	camera: Camera
	mouseX: number = 0
	mouseY: number = 0
	private mousemoveListener?: (e: MouseEvent) => void;

	constructor(config: MouseInputConfig) {
		this.scene = config.scene;
		this.camera = this.scene.camera;
		this.bindListeners();
	}

	bindListeners() {
		this.scene.canvas.addEventListener("mousemove", this.mousemoveListener = e => {
			this.mouseX = e.clientX;
			this.mouseY = e.clientY;
		})
	}

	removeListeners() {
		this.mousemoveListener &&
			this.scene.canvas.removeEventListener("mousemove", this.mousemoveListener)
	}

	/** @returns the grid coord of the currently hovered tile */
	getHoveredCoords(): Coord {
		const rect = this.scene.canvas.getBoundingClientRect()

		const canvasX = (this.mouseX - rect.left) * (this.scene.canvas.width / rect.width)
		const canvasY = (this.mouseY - rect.top) * (this.scene.canvas.height / rect.height)

		const offset = this.camera.offset
		const worldDrawPos: Coord = {
			x: canvasX - offset.x,
			y: canvasY - offset.y
		}

		return utils.DrawToGrid(worldDrawPos)
	}
}

export class HoverMarker extends TileMarker {
}
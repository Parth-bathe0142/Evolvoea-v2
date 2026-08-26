import { utils } from "./utils.js";
import { GameObject, type GameObjectConfig } from "./GameObject.js";
import type { Coord, GridDirs } from "./types";

export interface MovableObjectGridConfig extends GameObjectConfig {
	gridPos?: Coord;
}
/**
 * Represents objects that can move in the world, following
 * the fixed positions of cells in a grid. movement is smooth
 * but starts and ends only at discrete cells.
 * Movement restrictions are to be implemented as "wall" cells
 * that cannot be walked into
 */
export class MovableObjectGrid extends GameObject {
	static override readonly typeName: string = "MovableObjectGrid";
	gridPos: Coord;
	maxSteps = 16;
	steps = 0;
	direction: GridDirs = "none";
	movingTo: Coord | null = null;
	moveResolve: (() => void) | null = null;

	constructor(config: MovableObjectGridConfig) {
		super(config);
		this.gridPos = config.gridPos || { x: 0, y: 0 };
		this.drawPos = utils.GridToDraw(this.gridPos);
	}

	/**
	 * if object is currently moving, updates its drawPos till
	 * it reaches its destination, then updates the grid pos.
	 * effectively this object can block the cell it is in as
	 * well as the cell it is currently moving to, making
	 * collisions impossible
	 */
	override update(): void {
		super.update();

		if (this.steps == 0 || this.direction == "none") {
			return;
		} else {
			switch (this.direction) {
				case "up":
					this.drawPos.y -= 16 / this.maxSteps;
					break;
				case "right":
					this.drawPos.x += 16 / this.maxSteps;
					break;
				case "down":
					this.drawPos.y += 16 / this.maxSteps;
					break;
				case "left":
					this.drawPos.x -= 16 / this.maxSteps;
					break;
			}

			this.steps--;
			if (this.steps == 0) {
				this.stop();
				this.drawPos = {
					x: Math.round(this.drawPos.x),
					y: Math.round(this.drawPos.y),
				};
			}
		}
	}
	/**
	 * Starts the movement behavior. Does NOT make any
	 * updates to the sprite of this object
	 * @param to direction of intended movement
	 */
	makeMove(to: GridDirs, resolve?: () => void) {
		if (this.movingTo) {
			return;
		}
		this.moveResolve = resolve ?? null;
		if (this.direction == "none" && this.steps == 0) {
			this.direction = to;
			this.steps = this.maxSteps;
			switch (to) {
				case "up":
					this.movingTo = { x: this.gridPos.x, y: this.gridPos.y - 1 };
					break;
				case "right":
					this.movingTo = { x: this.gridPos.x + 1, y: this.gridPos.y };
					break;
				case "down":
					this.movingTo = { x: this.gridPos.x, y: this.gridPos.y + 1 };
					break;
				case "left":
					this.movingTo = { x: this.gridPos.x - 1, y: this.gridPos.y };
					break;
			}
		} else {
			document.dispatchEvent(
				new CustomEvent("complete-walk", {
					detail: {
						who: this.id,
					},
				}),
			);
		}
	}

	stop() {
		this.direction = "none";
		this.gridPos = this.movingTo!;
		this.movingTo = null;
		this.moveResolve && this.moveResolve();
	}
}

export interface MovableObjectFreeConfig extends GameObjectConfig {
	speed: number;
}

/**
 * Represents objects that can move freely without the
 * confines of the grid and its cells. Intended for
 * objects on the battleground such as slimes or projectiles
 * This implementation works by accepting destination
 * coords and moving the object to it.
 * @todo Implement movement restrictions
 */
export class MovableObjectFree extends GameObject {
	static override readonly typeName: string = "MovableObjectFree";
	moving: boolean = false;
	speed: number;
	direction = { x: 0, y: 0 };
	targetPos: Coord | null = null;

	constructor(config: MovableObjectFreeConfig) {
		super(config);
		this.speed = config.speed;
	}

	/**
	 * Updates drawPos and moves it towards destination
	 * at given speed. Stops within \<speed> points distance of
	 * destination in order to avoid rounding errors
	 */
	override update() {
		super.update();

		if (this.moving) {
			if (utils.getDistance(this.drawPos, this.targetPos!) < this.speed + 1) {
				this.stop();
			}
			let dx = this.direction.x * this.speed;
			let dy = this.direction.y * this.speed;

			this.drawPos.x += dx;
			this.drawPos.y += dy;
		}
	}

	/**
	 * Starts the movement behavior by providing a
	 * destination to move to, in free space by default
	 * but can snap to the grid as well
	 */
	moveTowards(to: Coord, on: "grid" | "free" = "free") {
		if (on == "grid") {
			to = utils.GridToDraw(to);
		}
		this.direction = utils.getUnitVector(this.drawPos, to);
		this.moving = true;
		this.targetPos = to;
	}

	moveBeyond(to: Coord, on: "grid" | "free" = "free") {
		const end = {
			x: to.x * 10,
			y: to.y * 10,
		};

		this.moveTowards(end, on);
	}

	/**
	 * Terminates the movement behavior, can also
	 * interrupt it if called explicitly. Converts
	 * drawPos coord to rounded numbers, otherwise
	 * sprites can take a blurry appearance caused
	 * by floating point coords
	 */
	stop() {
		this.moving = false;
		this.targetPos = null;
		this.direction = { x: 0, y: 0 };
		this.drawPos = {
			x: Math.round(this.drawPos.x),
			y: Math.round(this.drawPos.y),
		};
	}
}

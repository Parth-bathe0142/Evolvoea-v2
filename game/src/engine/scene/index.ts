import { Player } from "../entities/Player.js";
import { Camera } from "./Camera.js";
import { GameObject, type GameObjectConfig } from "../GameObject.js";
import KeyInput from "../inputs/KeyInput";
import { TileMarkerColor, type Coord } from "../types";
import { PathFinder } from "../PathFinder.js";
import { Time } from "../Time.js";
import { utils } from "../utils.js";
import { PixelMap } from "./PixelMap.js";
import type Id from "../IdGenerator.js";
import { IdMap } from "../IdGenerator.js";
import MouseInput, { HoverMarker } from "../inputs/mouseInput.js";
import { TileMarker, type TileMarkerConfig } from "./Tile.js";
import type { GridCharacter } from "../entities/GridCharacter.js";

export interface SceneConfig {
	mapConfig?: {
		name: string;
		spritesheetSize: [number, number];
		goal: Coord;
	};
	playerPos?: Coord;
	Characters?: [string, GameObjectConfig][];
	randomSpawns?: number;
}

export class Scene {
	ctx: CanvasRenderingContext2D;
	canvas: HTMLCanvasElement;
	map: PixelMap;

	characters: Id<GridCharacter>[] = [];
	tileMarkers: Id[] = [];
	entityRefs: IdMap = new IdMap()
	player: Id<Player>;
	hoverMarker: Id<HoverMarker>
	
	time: Time;
	camera: Camera;
	keyInput: KeyInput;
	mouseInput: MouseInput;

	pathFinder: PathFinder;

	isPaused: boolean;
	isReady: boolean = false;
	readyCallback: (() => void) | undefined


	constructor(config: SceneConfig) {
		this.pathFinder = new PathFinder();

		this.canvas = document.getElementById("game-canvas")! as HTMLCanvasElement;
		this.ctx = this.canvas.getContext("2d")!;
		this.characters = [];

		const player = new Player({
			type: Player.typeName,
			gridPos: config.playerPos ?? { x: 5, y: 7 },
			name: "player",
			scene: this,
			spriteConfig: {
				src: "static/assets/spritesheets/character.png",
				currentAnim: "idle-down",
			},
		})
		this.addEntity(player)
		
		this.player = player.id;
		this.characters.push(this.player)

		const hoverMarker = new HoverMarker({
			type: HoverMarker.typeName,
			pos: { x: 0, y: 0 },
			color: TileMarkerColor.Red,
			bobs: true,
		} as TileMarkerConfig)
		this.addEntity(hoverMarker)
		this.tileMarkers.push(hoverMarker.id)
		
		this.hoverMarker = hoverMarker.id as Id<HoverMarker>;

		if (config.mapConfig) {
			this.map = new PixelMap(
				config.mapConfig.name,
				...config.mapConfig.spritesheetSize,
				config.mapConfig.goal,
			);
		} else {
			this.map = new PixelMap("example_map", 6, 8, { x: 0, y: 0 });
		}
		this.time = new Time(48);
		this.camera = new Camera({
			scene: this,
			entity: this.player,
		});
		this.keyInput = new KeyInput({ puppet: this.player, scene: this });
		this.mouseInput = new MouseInput({ scene: this, tileChangeCallback: this.hoveredTileChange })

		this.isPaused = false;

		this.load(config);
	}

	private async load(_config: SceneConfig) {
		await this.map.load();
		this.init();
	}

	update = () => {
		this.characters.forEach((id) => {
			this.getEntityById(id)?.update();
		});
		
		this.tileMarkers.forEach((id) => {
			this.getEntityById(id)?.update();
		});
		
	};

	render = () => {
		const gameState = {
			camera: this.camera,
			time: this.time,
		};

		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

		this.map.drawLayer(this.ctx, gameState, "Water");
		this.map.drawLayer(this.ctx, gameState, "Ground");
		this.map.drawLayer(this.ctx, gameState, "main");

		for (const id of this.characters) {
			this.getEntityById(id)?.sprite.draw(this.ctx, gameState);
		}
		
		for (const id of this.tileMarkers) {
			this.getEntityById(id)?.sprite.draw(this.ctx, gameState);
		}
		
		this.map.drawLayer(this.ctx, gameState, "Roof");
	};

	private init() {
		setTimeout(() => {
			const bmap = PathFinder.mapFromPixelMap(this.map);
			this.pathFinder.setMap(bmap, this.map.height, this.map.width);
			const { pause, play } = this.time.runLoop(this.update, this.render)!;
			this.pause = pause;
			this.play = play;

			this.isReady = true;
			this.readyCallback?.()
		}, 500);
	}

	onReady(cb: () => void) {
		if (this.isReady) {
			cb()
		} else {
			this.readyCallback = cb
		}
	}

	pause?: () => void;
	play?: () => void;

	togglePause() {
		if (this.isPaused) {
			this.play?.();
			this.isPaused = false;
		} else {
			this.pause?.();
			this.isPaused = true;
		}
	}

	isSpaceValid(_coord: Coord) {
		const coord = utils.coordToString(_coord);

		if (
			this.map.layers["Ground"]!.tiles.has(coord) &&
			!this.map.layers["main"]!.tiles.has(coord)
		) {
			return true;
		} else {
			return false;
		}
	}

	hoveredTileChange = (coord: Coord) => {
		this.getEntityById(this.hoverMarker)?.moveTo(coord)
		
		const entity = this.characters.find(id => utils.sameCoords(this.getEntityById(id)!.gridPos, coord))

		let record = null
		if (entity) {
			const data = this.getEntityById(entity)!.inspect()
			record = utils.inspectionToRecord(data)
		}

		Alpine.store("inspector").data = record
	}

	getEntityById<T extends GameObject>(id: Id<T>): T | undefined {
		return this.entityRefs.get(id) as T;
	}

	addEntity(entity: GameObject) {
		this.entityRefs.set(entity.id, entity);
	}

	removeEntityById(id: Id) {
		this.entityRefs.delete(id)
	}

	destroy() {
		this.pause?.();
		setTimeout(() => {
			this.entityRefs.forEach((entity) => {
				entity.destroy();
			});
			this.characters = [];
			this.tileMarkers = [];
			this.map.destroy();
			this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		}, 20);
	}
}

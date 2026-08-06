
import { Player } from "../entities/Player.js"
import { Camera } from "./Camera.js"
import { GameObject } from "../GameObject.js"
import { KeyInput } from "../inputs/KeyInput.js"
import type { Coord } from "../types"
import { PathFinder } from "../PathFinder.js"
import { Time } from "../Time.js"
import { utils } from "../utils.js"
import { PixelMap } from "./PixelMap.js"
import { TileMarker } from "./Tile.js"
import type { GridCharacterConfig } from "../entities/GridCharacter.js"

export interface SceneConfig {
    mapConfig?: {
        name: string
        spritesheetSize: [number, number]
        goal: Coord
    }
    playerPos?: Coord
    Characters?: [string, GridCharacterConfig][]
    randomSpawns?: number
}

export class Scene {

    ctx: CanvasRenderingContext2D
    canvas: HTMLCanvasElement

    characters: GameObject[] = []
    randomeSpawns = 0
    interactables: Map<Coord, GameObject>
    player: Player
    map: PixelMap
    time: Time
    camera: Camera
    keyInput: KeyInput
    pathFinder: PathFinder

    isPaused: boolean

    constructor(config: SceneConfig) {
        this.pathFinder = new PathFinder()

        this.canvas = document.getElementById("game-canvas")! as HTMLCanvasElement
        this.ctx = this.canvas.getContext("2d")!
        this.characters = []
        this.randomeSpawns = config.randomSpawns ?? 0

        this.player = new Player({
            gridPos: config.playerPos ?? { x: 5, y: 7 },
            name: "player",
            scene: this,
            spriteConfig: {
                src: "static/assets/spritesheets/character.png",
                currentAnim: "idle-down"
            }
        })

        this.interactables = new Map<Coord, GameObject>
        const goal = config.mapConfig?.goal
        if(goal) {
            const marker = new TileMarker(goal)
            this.interactables.set(goal, marker)

        }

        if(config.mapConfig) {
            this.map = new PixelMap(
                config.mapConfig.name,
                ...config.mapConfig.spritesheetSize,
                config.mapConfig.goal
            )
        } else {
            this.map = new PixelMap("example_map", 6, 8, { x: 0, y: 0 })
        }
        this.time = new Time(48)
        this.camera = new Camera({
            object: this.player
        })
        this.keyInput = new KeyInput({ puppet: this.player, scene: this })

        this.isPaused = false

        this.load(config)
    }

    private async load(_config: SceneConfig) {
			await this.map.load()
			
        this.init()
    }
    
    update = () => {
        this.player.update()
        this.characters.forEach(object => {
            object.update()
        })
        
        this.interactables.forEach(object => object.update())
    }
    
    render = () => {
        const gameState = {
            camera: this.camera,
            time: this.time
        }
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
        
        this.map.drawLayer(this.ctx, gameState, "Water");
        this.map.drawLayer(this.ctx, gameState, "Ground");
        this.map.drawLayer(this.ctx, gameState, "main");
        this.interactables.forEach(object => {
            object.sprite.draw(this.ctx, gameState)
        })
        for (const object of this.characters) {
            object.sprite.draw(this.ctx, gameState)
        }
        this.player.sprite.draw(this.ctx, gameState)
        this.map.drawLayer(this.ctx, gameState, "Roof");
    }
    
    private init() {
        setTimeout(() => {
            const bmap = PathFinder.mapFromPixelMap(this.map)
            this.pathFinder.setMap(bmap, this.map.height, this.map.width)
            const { pause, play } = this.time.runLoop(this.update, this.render)!
            this.pause = pause
            this.play = play
        }, 500)
    }

    pause?: () => void
    play?: () => void

    togglePause() {
        if (this.isPaused) {
            this.play?.()
            this.isPaused = false
        } else {
            this.pause?.()
            this.isPaused = true
        }
    }

    isSpaceValid(_coord: Coord) {
        const coord = utils.coordToString(_coord)
        
        if (this.map.layers["Ground"]!.tiles.has(coord) && !this.map.layers["main"]!.tiles.has(coord)) {
            return true;
        } else {
            return false;
        }
    }

    getCharacterById(id: number | string): GameObject | null {
        for(const obj of this.characters) {
            if(obj.id == id) {
                return obj
            }
        }

        return null
    }

    destroy() {
        this.pause?.()
        setTimeout(() => {
            this.characters.forEach(char => {
                char.destroy()
            })
            this.characters = []
            this.player.destroy()
            this.map.destroy()
            this.ctx.clearRect(0,0, this.canvas.width, this.canvas.height)
        }, 20)
      }
}




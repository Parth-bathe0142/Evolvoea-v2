import type { Coord, GameState } from "../misc.js";
import { utils } from "../utils.js";
import type { Tile } from "./Tile.js";

/**
 * Stores an array of Tiles
 */
export interface Layer {
    name: string
    tiles: Map<string, Tile>
    collider: boolean // other data stored in the layer
}

interface JSONInput {
    tileSize: number
    mapWidth: number
    mapHeight: number
    goal: Coord
    layers: {
        name: string
        tiles: { id: string, x: number, y: number }[]
        collider: boolean
    }[]
}

export class PixelMap {
    height: number = 0
    width: number = 0
    goal: Coord = { x: 0, y: 0 }

    name: string
    isLoaded = false

    // rows and columns in the spritesheet
    spritesheetRows: number = 0
    spritesheetCols: number = 0
    spriteSheet = new Image()

    // object that stores all layers as an object 
    // of format layername: layerobject
    layers: { [key: string]: Layer } = {}

    /**
     * Displays error when map is not found
     * @param name The folder name in which the spritesheet and map.json is present
     * @param spriteRows number of rows in spritesheet.png (rows -> up/down)
     * @param spriteCols number of cols in spritesheet.png (cols -> right/left)
     */
    constructor(name: string, spriteRows: number, spriteCols: number, goal: Coord) {
        this.goal = goal
        this.spritesheetCols = spriteCols
        this.spritesheetRows = spriteRows
        this.name = name

    }

    async load() {
        return new Promise<void>(async (res, rej) => {
            if (this.isLoaded) {
                res()
            }
            let json
            try {
                const response = await fetch(`/static/assets/maps/${this.name}/map.json`)
                json = await response.json() as JSONInput
                console.log(json);
                
            } catch (error) {
                console.error("map not found")
                rej()
            }
            this.initLayer(json!)
            this.spriteSheet.src = `/static/assets/maps/${this.name}/spritesheet.png`
            this.isLoaded = true
            
            res()
        })
    }

    /**
     * Initialize each layer one by one using for of loop
     * @param json stores the Id, coordinates of x and y and the name of the layer
     */
    initLayer(json: JSONInput) {
        this.height = json.mapHeight
        this.width = json.mapWidth

        for (const layer of json.layers) {

            this.layers[layer.name] = {
                name: layer.name,
                tiles: new Map<string, Tile>(),
                collider: layer.collider
            }
            const current = this.layers[layer.name]
            // { id: string, x: number, y: number }
            // <Coordstr, {spritePos: Coord}>
            for (const obj of layer.tiles) {
                current?.tiles.set(
                    utils.coordToString({ x: obj.x, y: obj.y }),
                    { spritePos: this.getSpritesheetCoord(obj.id) }
                )
            }
        }
    }

    /**
     * Draws the requested layer by iterating each tile
     * @param ctx 
     * @param state 
     * @param layer Which layer to draw
     */
    drawLayer(ctx: CanvasRenderingContext2D, state: GameState, layer: string) {
        const tiles = this.layers[layer]!.tiles
        for (const [coord, tile] of tiles) {
            let drawPos = utils.GridToDraw(utils.stringToCoord(coord))
            drawPos.x += state.camera?.offset.x ?? 0
            drawPos.y += state.camera?.offset.y ?? 0
            ctx.drawImage(
                this.spriteSheet,
                tile.spritePos.x, tile.spritePos.y,
                16, 16,

                drawPos.x, drawPos.y,
                16, 16
            )
        }
    }

    /**
     * Takes the id from the json file of each tile
     * Coords -> The top-left coordinates of a tile
     * @param id String value that is received from the json file
     * @returns converted values as a Coord on the SpriteSheet
     */
    private getSpritesheetCoord(id: string) {
        const nid = parseInt(id)
        return {
            x: (nid % this.spritesheetCols) * 16,
            y: Math.floor(nid / this.spritesheetCols) * 16
        }
    }

    destroy() {
        this.spriteSheet.src = ""
        this.layers = {}
    }
}

import initWASM,{ find_path, set_map, type InitOutput } from "../../../wasm_target"
import { PixelMap } from "./scene/PixelMap.js"
import { utils } from "./utils.js";

export class PathFinder {
    static layerBitsMap: { [key: string]: number } = {
        "Water": 1,
        "Ground": 2,
        "main": 4,
        "Roof": 8
    }

    static mapFromPixelMap(pix: PixelMap) {
        const map = new Array(pix.height * pix.width).fill(0)

        for (const layername in pix.layers) {
            if (Object.prototype.hasOwnProperty.call(pix.layers, layername)) {

                const layer = pix.layers[layername]!
                const bit = this.layerBitsMap[layername]

                for(const [coordStr, _] of layer.tiles) {
                    const { x, y } = utils.stringToCoord(coordStr);
                    const index = (y * pix.width) + x   // image indexing

                    if (index >= 0 && index < map.length) {
                        map[index] += bit
                    }
                }
            }
        }  
        return new Uint8Array(map)
    }
    
    wasm?: InitOutput
    ready = false
    constructor() {
        initWASM("static/game_wasm_bg.wasm")
          .then((wasm: InitOutput) => this.wasm = wasm)
          .then(() => this.ready = true)
          .catch(console.error)
    }

    findPath(startx: number, starty: number, endx: number, endy: number, mode: number): string[] {
        if(!this.ready) return []
        if(this.wasm) {
            return find_path(startx, starty, endx, endy, mode)
        } else {
            return []
        }
    }
    setMap(map: Uint8Array, height: number, width: number): boolean {
        if(this.wasm) {
            return set_map(map, height, width)
        } else {
            return false
        }
    }

}
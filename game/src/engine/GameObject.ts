import { idGenerator } from "./IdGenerator.js"
import { type Coord } from "./misc.js"
import { Sprite, type SpriteConfig } from "./Sprite.js"


/**
 * @param drawPos Optional, starting position of the object on the grid
 * @param spriteConfig The sprite corresponding to this game object
 */
export interface GameObjectConfig {
    drawPos?: Coord,
    spriteConfig: SpriteConfig
    id?: number | string
}

/**
 * The root class for all ingame entities. Contains
 * only sprite and draw position information
 */
export abstract class GameObject {

    id: number | string
    drawPos: Coord = { x: 0, y: 0 }
    sprite: Sprite
    isValid: boolean = true
    eventListeners: Map<string, EventListener> = new Map()

    constructor(config: GameObjectConfig) {
        if(config.id) {
            this.id = config.id
            if(typeof config.id == 'number') {
                idGenerator.bookId(config.id)
            }
        } else {
            this.id = idGenerator.generateNewId()
        }
        this.drawPos = config.drawPos || { x: 0, y: 0 }

        config.spriteConfig.gameObject = this
        this.sprite = new Sprite(config.spriteConfig)
    }
    /**
     * only updates the sprite if it is animated, 
     * otherwise does nothing
     */
    update(): void {
        this.sprite.isAnimated && this.sprite.updateSprite()
    }

    destroy() {
        this.sprite.destroy()
        this.isValid = false

        for(const [string, listener] of this.eventListeners) {
            document.removeEventListener(string, listener)
        }
    }
}
import type { GridDirs } from "../types";
import { GridCharacter, type GridCharacterConfig } from "./GridCharacter.js";

export interface PlayerConfig extends GridCharacterConfig {

}

export class Player extends GridCharacter {
	static override readonly typeName: string = "Player";
    override facing: GridDirs = 'down'
    override beingControlled: boolean = false
    health: number = 5

    constructor(config: PlayerConfig) {
        config.spriteConfig.animations = {
            "idle-down": [
                { frame: { x: 0, y: 0 } }
            ],
            "idle-left": [
                { frame: { x: 0, y: 2 } }
            ],
            "idle-up": [
                { frame: { x: 0, y: 1 } }
            ],
            "idle-right": [
                { frame: { x: 0, y: 3 } }
            ],
            "walk-down": [
                { frame: { x: 0, y: 0 } },
                { frame: { x: 2, y: 0 } },
                { frame: { x: 0, y: 0 } },
                { frame: { x: 3, y: 0 } },
            ],
            "walk-left": [
                { frame: { x: 0, y: 2 } },
                { frame: { x: 2, y: 2 } },
                { frame: { x: 0, y: 2 } },
                { frame: { x: 3, y: 2 } },

            ],
            "walk-up": [
                { frame: { x: 0, y: 1 } },
                { frame: { x: 2, y: 1 } },
                { frame: { x: 0, y: 1 } },
                { frame: { x: 3, y: 1 } },
            ],
            "walk-right": [
                { frame: { x: 0, y: 3 } },
                { frame: { x: 2, y: 3 } },
                { frame: { x: 0, y: 3 } },
                { frame: { x: 3, y: 3 } },

            ],
            "bob-down": [
                { frame: { x: 0, y: 0 }, duration: 32 },
                { frame: { x: 1, y: 0 }, duration: 32 },
            ],
            "bob-left": [
                { frame: { x: 0, y: 2 }, duration: 32 },
                { frame: { x: 1, y: 2 }, duration: 32 },
            ],
            "bob-up": [
                { frame: { x: 0, y: 1 }, duration: 32 },
                { frame: { x: 1, y: 1 }, duration: 32 },
            ],
            "bob-right": [
                { frame: { x: 0, y: 3 }, duration: 32 },
                { frame: { x: 1, y: 3 }, duration: 32 },
            ],
        }
        config.spriteConfig.cropSize = { width: 48, height: 48 }
        config.spriteConfig.drawSize = { width: 48, height: 48 }
        config.spriteConfig.drawOffset = { x: -16, y: -20 }

        super(config)
    }

    

    override makeMove(to: GridDirs, resolve?: () => void): void {
        super.makeMove(to, resolve)
        this.sprite.currentAnimation = `walk-${to}`
    }

    override stop() {
        super.stop()
        setTimeout(() => {
            !this.movingTo && (this.sprite.currentAnimation = `idle-${this.facing}`)
        }, 10);
    }
}
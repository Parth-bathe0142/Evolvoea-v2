import { Scene } from "../scene";
import type { Coord, GridDirs, Puppet, PuppetCommand } from "../types";
import { MovableObjectGrid, type MovableObjectGridConfig } from "../MovableObject.js";
import { utils } from "../utils.js";

export interface GridCharacterConfig extends MovableObjectGridConfig {
    name: string
    scene?: Scene
}

/**
 * Represents a generic entity that stays on the
 * grid and might move. Not really limited to people,
 * can be any npc on the map
 */
export class GridCharacter extends MovableObjectGrid implements Puppet {
    facing: GridDirs = "down";
    beingControlled: boolean = false;
    /** Some known entities for easy creation */
    static instances: {[key: string]: GridCharacterConfig} = {
        "person1": {
            name: "person1",
            spriteConfig: {
                src: "assets/spritesheets/character.png"
            }
        }
    }
    /** Creates a known person */
    static getPerson(name: string): GridCharacter | null {
        let config = this.instances[name]
        return config ? new GridCharacter(config) : null
    }

    name: string
    scene: Scene

    constructor(config: GridCharacterConfig) {
        super(config)

        this.name = config.name
        this.scene = config.scene!
    }

    /** Does nothing */
    override update() {
        super.update()
    }

    async startBehavior(command: PuppetCommand): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            if(this.beingControlled) {
                reject()
                return
            }
            switch (command.action) {
                case "walk":
                    const next = utils.getNextCoord(this.gridPos, command.direction)
                    if(this.scene.isSpaceValid(next)) {
                        await this.startWalk(command.direction)
                        resolve()
                    } else {
                        reject()
                    }
                break
            
                case "stand":
                    await this.startStand(command.direction, command.duration!)
                    resolve()
                break
            }
        })
    }

    startWalk(dir: GridDirs): Promise<void> {
        return new Promise<void>((res) => {
            this.facing = dir
            this.makeMove(dir, res)
        })
    }

    startWalkTo(coord: Coord): Promise<void> {
        return new Promise<void>(async (res, rej) => {

            if(this.gridPos.x == coord.x && this.gridPos.y == coord.y) {
                res()
            } else {
                try {
                    const path = this.scene.pathFinder.findPath(
                        this.gridPos.x,
                        this.gridPos.y,
                        coord.x,
                        coord.y,
                        4
                    )
                    if(path.length != 0) {
                        for(const inst of path as GridDirs[]) {
                            this.isValid && await this.startWalk(inst)
                        }
                        console.log(this.gridPos);
                        
                        res()
                    } else { 
                        rej("no path")
                    }
                } catch (error) {
                    rej(error)
                }
            }

        })
    }

    startStand(dir: GridDirs, duration: number): Promise<void> {
        return new Promise<void>(async res => {
            this.facing = dir
            await this.scene.time.delay(duration)
            res()
        })
    }

    startInteraction(): Promise<void> {
        return new Promise<void>((res) => {

        })
    }
}
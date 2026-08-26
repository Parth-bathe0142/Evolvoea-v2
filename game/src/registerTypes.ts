import { GridCharacter } from "./engine/entities/GridCharacter";
import { Player } from "./engine/entities/Player";
import { GameObject } from "./engine/GameObject";
import Id from "./engine/IdGenerator";
import { HoverMarker } from "./engine/inputs/mouseInput";
import { MovableObjectFree, MovableObjectGrid } from "./engine/MovableObject";
import { TileMarker } from "./engine/scene/Tile";
import { TypeRegistry } from "./engine/TypeRegistry";

export function registerTypes() {
	const registry = new TypeRegistry();

	registry.register(GameObject);
	registry.register(MovableObjectGrid, GameObject)
	registry.register(MovableObjectFree, GameObject)
	registry.register(GridCharacter, MovableObjectGrid, GameObject)
	registry.register(Player, GridCharacter, MovableObjectGrid, GameObject)

	registry.register(TileMarker, GameObject)
	registry.register(HoverMarker, TileMarker, GameObject)

	Id.registry = registry
}

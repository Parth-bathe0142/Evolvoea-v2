// Matches PixelMap.ts's JSONInput exactly — do not rename these fields.
export interface Coord {
  x: number;
  y: number;
}

// Sprite Fusion (the tool you're authoring tiles in) supports an optional
// "attributes" object on any tile — arbitrary JSON your game can read.
// Current PixelMap.ts ignores unknown fields, so adding "attributes" is
// 100% backward compatible: old maps without it still load fine.
export interface TileAttributes {
  entity?: "player_spawn" | "slime_spawn";
  slimeType?: string;
  [key: string]: unknown;
}

export interface MapTile {
  id: string;
  x: number;
  y: number;
  attributes?: TileAttributes;
}

export interface MapLayer {
  name: string;
  tiles: MapTile[];
  collider: boolean;
}

export interface EvolvoeaMap {
  tileSize: number;
  mapWidth: number;
  mapHeight: number;
  goal: Coord;
  layers: MapLayer[];
}

// The exact layer names Scene.render() currently knows how to draw, in
// draw order (bottom to top). Adding a differently-named layer won't
// break anything — the game just won't render it, which is exactly what
// we want for the Spawns layer below (it's editor-only data).
export const RENDER_LAYERS = ["Water", "Ground", "main", "Roof"] as const;

// Not drawn by the game. Holds player/slime spawn markers as tiles with
// an `attributes.entity` tag. Scene.ts doesn't read this layer yet —
// that's a separate follow-up once you're ready to spawn from map data.
export const SPAWN_LAYER = "Spawns";
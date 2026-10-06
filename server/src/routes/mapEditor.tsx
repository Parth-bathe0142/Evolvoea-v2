import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { readdir, readFile, writeFile, mkdir, copyFile } from "node:fs/promises";
import path from "node:path";
import { MapEditorPage } from "../views/components/MapEditorPage";

export const mapEditorRoutes = new Hono();

// IMPORTANT: these point at game/assets — the real source your build.ts
// copies FROM. server/static/assets is a disposable build artifact that
// gets rm()'d and recreated on every `just build-game` — saving there
// would mean your maps vanish on the next build.
//
// process.cwd() is `server/` (that's where `bun run src/index.ts` runs
// from), so we go up one level to reach the project root, then into game/.
const MAPS_DIR = path.join(process.cwd(), "../game/assets/maps");
const TILESETS_DIR = path.join(process.cwd(), "../game/assets/tilesets");

// Nothing currently serves game/assets over HTTP — only server/static is
// exposed. This mirrors your existing app.ts pattern exactly:
//   app.use("/static/*", serveStatic({ root: "./" }))       -> serves server/static/*
//   mapEditorRoutes.use("/game/*", serveStatic({ root: ".." })) -> serves ../game/*
// (the mount prefix "game" has to literally be the real folder name,
// since this middleware appends the whole matched path onto root)
mapEditorRoutes.use("/game/*", serveStatic({ root: ".." }));

// ---------- Page ----------
mapEditorRoutes.get("/map-editor", (c) => c.html(<MapEditorPage />));

// ---------- List existing maps ----------
mapEditorRoutes.get("/map-editor/api/maps", async (c) => {
  const entries = await readdir(MAPS_DIR, { withFileTypes: true });
  return c.json(entries.filter((e) => e.isDirectory()).map((e) => e.name));
});

// ---------- List available tilesets ----------
mapEditorRoutes.get("/map-editor/api/tilesets", async (c) => {
  const entries = await readdir(TILESETS_DIR, { withFileTypes: true });
  return c.json(
    entries.filter((e) => e.isFile() && e.name.endsWith(".png")).map((e) => e.name)
  );
});

// ---------- Load one map's map.json ----------
mapEditorRoutes.get("/map-editor/api/maps/:name", async (c) => {
  const name = c.req.param("name");
  try {
    const file = await readFile(path.join(MAPS_DIR, name, "map.json"), "utf-8");
    return c.body(file, 200, { "Content-Type": "application/json" });
  } catch {
    return c.json({ error: "Map not found" }, 404);
  }
});

// ---------- Save (create or overwrite) a map ----------
// Body: { map: EvolvoeaMap, tilesetSource?: string }
// Writes straight into game/assets/maps/<name>/ — the real source.
// NOTE: this does NOT touch server/static, so the running game/dev server
// won't see the change until you rebuild (`just build-game`). That's
// expected and matches how your project already works for every other asset.
mapEditorRoutes.post("/map-editor/api/maps/:name", async (c) => {
  const name = c.req.param("name");
  const body = await c.req.json<{ map: unknown; tilesetSource?: string }>();
  const dir = path.join(MAPS_DIR, name);

  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, "map.json"), JSON.stringify(body.map, null, 2));

  if (body.tilesetSource) {
    await copyFile(
      path.join(TILESETS_DIR, body.tilesetSource),
      path.join(dir, "spritesheet.png")
    );
  }

  return c.json({ ok: true });
});
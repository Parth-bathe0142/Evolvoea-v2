export function MapEditorPage() {
  return (
    <html>
      <head>
        <meta charset="UTF-8" />
        <title>Map Editor — Evolvoea</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>{`
          body { background:#0a0a0a; color:#e5e5e5; font-family: ui-sans-serif, system-ui, sans-serif; }
          #canvas { image-rendering: pixelated; cursor: crosshair; }
          .tile-btn.selected { outline: 2px solid #ffcc00; }
          select, button { background:#1a1a1a; border:2px solid #ffcc00; color:#e5e5e5; border-radius:6px; padding:4px 8px; font-size:12px; }
          button:hover { background:#ffcc00; color:#111; cursor:pointer; }
          button.active { background:#ff4500; border-color:#ff4500; color:white; }
        `}</style>
      </head>
      <body class="min-h-screen flex flex-col">
        <header class="flex items-center gap-3 p-3 border-b-2 border-[#ffcc00] flex-wrap">
          <b class="text-[#ffcc00] text-sm">🗺 EVOLVOEA MAP EDITOR</b>
          <select id="mapSelect"><option value="">— new map —</option></select>
          <select id="tilesetSelect"></select>
          <label class="text-xs flex items-center gap-1">W <input id="mapW" type="number" value="21" class="w-14 bg-black border border-[#ffcc00]/50 rounded px-1" /></label>
          <label class="text-xs flex items-center gap-1">H <input id="mapH" type="number" value="22" class="w-14 bg-black border border-[#ffcc00]/50 rounded px-1" /></label>
          <button id="newBtn">New</button>
          <button id="loadBtn">Load</button>
          <button id="saveBtn">Save</button>
          <span id="status" class="text-xs text-gray-500 ml-2"></span>
        </header>

        <div class="flex flex-1 overflow-hidden">
          <aside class="w-48 p-2 border-r border-white/10 overflow-auto">
            <h2 class="text-[#ffcc00] text-xs uppercase mb-2">Palette</h2>
            <div id="palette" class="grid grid-cols-4 gap-1"></div>
          </aside>

          <main class="flex-1 overflow-auto p-4 flex items-start justify-center" style="background:#111;">
            <canvas id="canvas"></canvas>
          </main>

          <aside class="w-56 p-2 border-l border-white/10 overflow-auto">
            <h2 class="text-[#ffcc00] text-xs uppercase mb-2">Layers</h2>
            <div id="layers" class="flex flex-col gap-1 mb-4"></div>

            <h2 class="text-[#ffcc00] text-xs uppercase mb-2">Tools</h2>
            <div class="flex flex-col gap-1">
              <button id="tool-paint" class="active">🖌 Paint</button>
              <button id="tool-erase">🧹 Erase</button>
              <button id="tool-player">🐰 Player Spawn</button>
              <button id="tool-slime">🟢 Slime Spawn</button>
            </div>
            <p class="text-[10px] text-gray-500 mt-2">
              Player/Slime spawns are stored as a tile <code>attributes</code> tag on a hidden "Spawns" layer —
              the game doesn't render this layer, only reads it.
            </p>
          </aside>
        </div>

        <script dangerouslySetInnerHTML={{ __html: SCRIPT }}></script>
      </body>
    </html>
  );
}

// Kept as a raw string (not JSX) because it's plain client-side JS that
// has to run in the browser, not through Hono's JSX renderer.
const SCRIPT = `
(function () {
  "use strict";

  const RENDER_LAYERS = ["Water", "Ground", "main", "Roof"];
  const SPAWN_LAYER = "Spawns";
  const TILE = 16;   // matches PixelMap.ts's hardcoded 16x16 draw size
  const SCALE = 2;   // on-screen zoom only — never saved

  let mapW = 21, mapH = 22, tileset = null, tilesetCols = 1;
  let selectedTileId = "0";
  let activeLayer = "Ground";
  let activeTool = "paint";
  let currentMapName = "";

  // layers[name] = Map<"x,y", {id, attributes?}>  — same shape PixelMap.ts
  // itself uses internally, just easier to paint into than a flat array.
  let layers = {};
  function freshLayers() {
    layers = {};
    [...RENDER_LAYERS, SPAWN_LAYER].forEach(name => layers[name] = new Map());
  }
  freshLayers();

  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  function resizeCanvas() {
    canvas.width = mapW * TILE * SCALE;
    canvas.height = mapH * TILE * SCALE;
  }

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = false;

    // Same draw order as Scene.render(): Water, Ground, main, Roof.
    for (const name of RENDER_LAYERS) {
      const tiles = layers[name];
      if (!tiles) continue;
      for (const [key, tile] of tiles) {
        const [x, y] = key.split(",").map(Number);
        drawTile(tile.id, x, y);
      }
    }

    // Grid
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    for (let x = 0; x <= mapW; x++) { ctx.beginPath(); ctx.moveTo(x*TILE*SCALE,0); ctx.lineTo(x*TILE*SCALE,canvas.height); ctx.stroke(); }
    for (let y = 0; y <= mapH; y++) { ctx.beginPath(); ctx.moveTo(0,y*TILE*SCALE); ctx.lineTo(canvas.width,y*TILE*SCALE); ctx.stroke(); }

    // Spawns overlay (editor-only visualization, never drawn by the game)
    for (const [key, tile] of layers[SPAWN_LAYER]) {
      const [x, y] = key.split(",").map(Number);
      ctx.font = (TILE*SCALE*0.7) + "px sans-serif";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      const cx = x*TILE*SCALE + TILE*SCALE/2, cy = y*TILE*SCALE + TILE*SCALE/2;
      ctx.fillText(tile.attributes && tile.attributes.entity === "player_spawn" ? "🐰" : "🟢", cx, cy);
    }
  }

  function drawTile(id, x, y) {
    if (!tileset) return;
    const nid = parseInt(id, 10);
    const sx = (nid % tilesetCols) * TILE;
    const sy = Math.floor(nid / tilesetCols) * TILE;
    ctx.drawImage(tileset, sx, sy, TILE, TILE, x*TILE*SCALE, y*TILE*SCALE, TILE*SCALE, TILE*SCALE);
  }

  // ---------- Tileset + palette ----------
  function loadTileset(url) {
    const img = new Image();
    img.onload = () => {
      tileset = img;
      // Derived from the actual image, never hardcoded — same idea as
      // PixelMap's spritesheetCols, but measured instead of guessed.
      tilesetCols = Math.max(1, Math.floor(img.naturalWidth / TILE));
      const rows = Math.max(1, Math.floor(img.naturalHeight / TILE));
      buildPalette(rows);
      render();
    };
    img.src = url;
  }

  function buildPalette(rows) {
    const palette = document.getElementById("palette");
    palette.innerHTML = "";
    const total = tilesetCols * rows;
    for (let id = 0; id < total; id++) {
      const btn = document.createElement("button");
      btn.className = "tile-btn p-0 overflow-hidden";
      btn.style.width = "32px"; btn.style.height = "32px";
      const mini = document.createElement("canvas");
      mini.width = 32; mini.height = 32;
      const mctx = mini.getContext("2d");
      mctx.imageSmoothingEnabled = false;
      const sx = (id % tilesetCols) * TILE, sy = Math.floor(id / tilesetCols) * TILE;
      mctx.drawImage(tileset, sx, sy, TILE, TILE, 0, 0, 32, 32);
      btn.appendChild(mini);
      btn.title = "Tile " + id;
      btn.addEventListener("click", () => {
        selectedTileId = String(id);
        document.querySelectorAll(".tile-btn").forEach(b => b.classList.remove("selected"));
        btn.classList.add("selected");
      });
      palette.appendChild(btn);
    }
  }

  // ---------- Layer panel ----------
  function buildLayerPanel() {
    const el = document.getElementById("layers");
    el.innerHTML = "";
    [...RENDER_LAYERS, SPAWN_LAYER].forEach(name => {
      const row = document.createElement("button");
      row.textContent = name + (name === SPAWN_LAYER ? " (hidden in-game)" : "");
      row.style.textAlign = "left";
      if (name === activeLayer) row.classList.add("active");
      row.addEventListener("click", () => {
        activeLayer = name;
        document.querySelectorAll("#layers button").forEach(b => b.classList.remove("active"));
        row.classList.add("active");
      });
      el.appendChild(row);
    });
  }

  // ---------- Tools ----------
  ["paint","erase","player","slime"].forEach(tool => {
    document.getElementById("tool-" + tool).addEventListener("click", (e) => {
      activeTool = tool;
      document.querySelectorAll("[id^=tool-]").forEach(b => b.classList.remove("active"));
      e.currentTarget.classList.add("active");
    });
  });

  // ---------- Painting ----------
  function cellFromEvent(e) {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / (TILE*SCALE));
    const y = Math.floor((e.clientY - rect.top) / (TILE*SCALE));
    if (x<0||y<0||x>=mapW||y>=mapH) return null;
    return {x,y};
  }

  function applyToolAt(cell) {
    const key = cell.x + "," + cell.y;
    if (activeTool === "paint") {
      layers[activeLayer].set(key, { id: selectedTileId });
    } else if (activeTool === "erase") {
      layers[activeLayer].delete(key);
    } else if (activeTool === "player") {
      for (const [k,t] of layers[SPAWN_LAYER]) if (t.attributes && t.attributes.entity==="player_spawn") layers[SPAWN_LAYER].delete(k);
      layers[SPAWN_LAYER].set(key, { id: "0", attributes: { entity: "player_spawn" } });
    } else if (activeTool === "slime") {
      layers[SPAWN_LAYER].set(key, { id: "0", attributes: { entity: "slime_spawn", slimeType: "green" } });
    }
    render();
  }

  let painting = false;
  canvas.addEventListener("mousedown", e => { painting = true; const c = cellFromEvent(e); if (c) applyToolAt(c); });
  canvas.addEventListener("mousemove", e => { if (!painting) return; if (activeTool!=="paint"&&activeTool!=="erase") return; const c = cellFromEvent(e); if (c) applyToolAt(c); });
  window.addEventListener("mouseup", () => painting = false);

  // ---------- Serialize / deserialize ----------
  function mapToJSON() {
    return {
      tileSize: TILE,
      mapWidth: mapW,
      mapHeight: mapH,
      goal: { x: 0, y: 0 },
      layers: [...RENDER_LAYERS, SPAWN_LAYER].map(name => ({
        name,
        collider: false,
        tiles: [...layers[name]].map(([key, t]) => {
          const [x,y] = key.split(",").map(Number);
          return t.attributes ? { id: t.id, x, y, attributes: t.attributes } : { id: t.id, x, y };
        }),
      })),
    };
  }

  function loadFromJSON(json) {
    mapW = json.mapWidth; mapH = json.mapHeight;
    document.getElementById("mapW").value = mapW;
    document.getElementById("mapH").value = mapH;
    freshLayers();
    for (const layer of json.layers) {
      if (!layers[layer.name]) layers[layer.name] = new Map();
      for (const t of layer.tiles) {
        layers[layer.name].set(t.x + "," + t.y, { id: t.id, attributes: t.attributes });
      }
    }
    resizeCanvas();
    render();
  }

  // ---------- Toolbar actions ----------
  document.getElementById("newBtn").addEventListener("click", () => {
    mapW = parseInt(document.getElementById("mapW").value, 10) || 21;
    mapH = parseInt(document.getElementById("mapH").value, 10) || 22;
    freshLayers(); resizeCanvas(); render();
    currentMapName = "";
    document.getElementById("status").textContent = "New unsaved map";
  });

  document.getElementById("loadBtn").addEventListener("click", async () => {
    const name = document.getElementById("mapSelect").value;
    if (!name) return;
    const res = await fetch("/map-editor/api/maps/" + name);
    if (!res.ok) { alert("Could not load that map"); return; }
    loadFromJSON(await res.json());
    loadTileset("/static/assets/maps/" + name + "/spritesheet.png");
    currentMapName = name;
    document.getElementById("status").textContent = "Loaded " + name;
  });

  document.getElementById("saveBtn").addEventListener("click", async () => {
    let name = currentMapName;
    if (!name) {
      name = prompt("Map folder name (no spaces):", "my_map");
      if (!name) return;
    } else if (!confirm('Overwrite existing map "' + name + '"?')) {
      return;
    }
    const body = { map: mapToJSON() };
    if (!currentMapName) {
      const tilesetName = document.getElementById("tilesetSelect").value;
      if (tilesetName) body.tilesetSource = tilesetName;
    }
    const res = await fetch("/map-editor/api/maps/" + name, {
      method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify(body)
    });
    if (res.ok) { currentMapName = name; document.getElementById("status").textContent = "Saved " + name; }
    else alert("Save failed");
  });

  // ---------- Boot ----------
  async function boot() {
    buildLayerPanel();
    resizeCanvas();
    render();

    try {
      const mapsRes = await fetch("/map-editor/api/maps");
      if (mapsRes.ok) {
        const names = await mapsRes.json();
        const sel = document.getElementById("mapSelect");
        names.forEach(n => { const o=document.createElement("option"); o.value=n; o.textContent=n; sel.appendChild(o); });
      }
    } catch (e) {}

    try {
      const tilesetsRes = await fetch("/map-editor/api/tilesets");
      if (tilesetsRes.ok) {
        const names = await tilesetsRes.json();
        const sel = document.getElementById("tilesetSelect");
        names.forEach(n => { const o=document.createElement("option"); o.value=n; o.textContent=n; sel.appendChild(o); });
        if (names[0]) loadTileset("/static/assets/tilesets/" + names[0]);
      }
    } catch (e) {}
  }
  boot();
})();
`;
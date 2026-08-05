import { rm, mkdir, cp } from "node:fs/promises";
import { join } from "node:path";

const mode = Bun.argv[2] ?? "dev";
const production = mode === "prod";

const root = join(import.meta.dir, "..");
const outDir = join(root, "server", "static");
const assetsSrc = join(root, "game", "assets");
const assetsDst = join(outDir, "assets");
const wasmSrc = join(root, "wasm_target", "game_wasm_bg.wasm");
const wasmDst = join(outDir, "game_wasm_bg.wasm");

await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });

const result = await Bun.build({
    entrypoints: ["src/index.ts"],
    outdir: outDir,
    

    target: "browser",
    format: "esm",

    naming: {
        entry: "game.js",
    },

    minify: production,

    sourcemap: production ? "none" : "external",

    // Makes stack traces much nicer
    // (set to false if you want faster rebuilds)
    splitting: false,


    // Preserve readable names in dev
    // (Bun currently keeps names reasonably well without extra config)
});

if (!result.success) {
    console.error("Build failed");

    for (const log of result.logs)
        console.error(log);

    process.exit(1);
}

try {
    await cp(wasmSrc, wasmDst, {
        recursive: true,
    });
} catch {
    console.warn("No wasm package found.");
}

try {
    await cp(assetsSrc, assetsDst, {
        recursive: true,
    });
} catch {
    console.warn("No assets found.");
}

console.log(
    `✓ Built game (${production ? "production" : "development"})`
);

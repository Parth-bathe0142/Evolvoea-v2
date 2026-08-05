set shell := ["bash", "-cu"]

default:
    @just --list

# ----------------------------
# Build
# ----------------------------

build: build-rust build-game

build-rust:
    cd rust && wasm-pack build \
        --target web \
        --out-dir ../wasm_target
        
build-css:
    bunx @tailwindcss/cli -i ./src/input.css -o ./public/style.css --minify
        
build-game:
    cd game && bun run build.ts prod 

clean:
    rm -rf server/public/game.js
    rm -rf wasm_target
    cargo clean --manifest-path rust/Cargo.toml

# ----------------------------
# Development
# ----------------------------

# Watch and rebuild Tailwind CSS
dev-css:
    cd server && bunx @tailwindcss/cli -i ./src/input.css -o ./static/style.css --watch


dev-rust:
     cd rust && cargo watch \
        -s "wasm-pack build --target web --out-dir ../wasm_target"

dev-game:
    cd game && bun run --watch build.ts

dev-server:
	cd server && bun run --watch src/index.ts

# ----------------------------
# Individual commands
# ----------------------------

serve:
    cd server && bun run src/index.ts

fmt:
    cargo fmt --manifest-path rust/Cargo.toml
    cd game && bunx prettier -w .
    cd server && bunx prettier -w .

lint:
    cargo clippy --manifest-path rust/Cargo.toml
    cd game && bunx tsc --noEmit
    cd server && bunx tsc --noEmit
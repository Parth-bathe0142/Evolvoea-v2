import { runGame } from ".";
import type { Scene } from "./engine/scene";

declare global {
  interface Window {
    Alpine: typeof import("alpinejs");
  }
  const Alpine: Window["Alpine"];
}

type Screens = "title-screen" | "replay-screen" | "game-screen" | "";

declare module "alpinejs" {
	interface Stores {
		gameScreens: GameScreensStore
		inspector: InspectorStore
	}
}

export interface GameScreensStore {
	screen: Screens;
	goToGame(): void;
	goToTitle(): void;
	goToReplay(): void;
}

export interface InspectorStore {
	data: Record<string, string> | null
}

document.addEventListener('alpine:init', () => {
	console.log("alpine init")
	
	Alpine.store("gameScreens", {
		screen: "title-screen",
		goToGame() {
			this.screen = "game-screen";
			runGame();
		},

		goToTitle() {
			this.screen = "title-screen";
		},

		goToReplay() {
			this.screen = "replay-screen";
		},
	});

	Alpine.store("inspector", { data: null })
});

window.addEventListener("load", () => {
	Alpine.initTree(document.body)
})
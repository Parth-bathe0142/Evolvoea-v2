import { runGame } from ".";

declare global {
  interface Window {
    Alpine: typeof import("alpinejs");
  }
  const Alpine: Window["Alpine"];
}

type Screens = "title-screen" | "replay-screen" | "game-screen" | "";

declare module "alpinejs" {
	interface Stores {
		gameScreens: GameScreensStore;
	}
}

interface GameScreensStore {
	screen: Screens;
	goToGame(): void;
	goToTitle(): void;
	goToReplay(): void;
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
	} satisfies GameScreensStore);
});

window.addEventListener("load", () => {
	Alpine.initTree(document.body)
})
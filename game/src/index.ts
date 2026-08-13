import { Scene, type SceneConfig } from "./engine/scene";
import { registerTypes } from "./registerTypes.js";
import { ui } from "./ui.js";

ui.goToScreen("title-screen");

document
	.querySelector("#title-screen_button")
	?.addEventListener("click", async (_) => {
		ui.goToGame();
		runGame();
	});

document
	.querySelector("#replay-screen_button_back")
	?.addEventListener("click", async (_) => {
		ui.goToScreen("title-screen");
	});
document
	.querySelector("#replay-screen_button_replay")
	?.addEventListener("click", async (_) => {
		ui.goToGame();
		runGame();
	});

async function runGame() {
	const response = (
		await Promise.all([
			fetch("/static/assets/demo_scenes/scenes.json"),
			registerTypes(),
		])
	)[0];
	const json = await response.json();

	const scenes = Object.keys(json);
	const randomScene = scenes[Math.floor(scenes.length * Math.random())]!;

	const scene = new Scene(json[randomScene] as SceneConfig);
}

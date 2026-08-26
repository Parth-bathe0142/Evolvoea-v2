import { Scene, type SceneConfig } from "./engine/scene";
import { registerTypes } from "./registerTypes.js";
import "./alpineStores.js"

export async function runGame() {
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

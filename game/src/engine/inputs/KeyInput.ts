import type { GridCharacter } from "../entities/GridCharacter";
import type Id from "../IdGenerator";
import { Scene } from "../scene";
import type { GridDirs } from "../types";

export interface KeyInputConfig {
	scene: Scene;
	puppet?: Id<GridCharacter>;
}

export default class KeyInput {
	scene: Scene;
	puppet?: Id<GridCharacter>;
	controllingPuppet: boolean = false;

	inputQueue: string[] = [];

	private keydownListener?: (e: KeyboardEvent) => void;
	private keyupListener?: (e: KeyboardEvent) => void;

	constructor(config: KeyInputConfig) {
		this.scene = config.scene;
		this.puppet = config.puppet;
		this.bindListeners();
	}

	bindListeners() {
		document.addEventListener(
			"keydown",
			(this.keydownListener = (e) => {
				const cmd = e.key.toLowerCase();
				let acting = false;
				switch (true) {
					case cmd.startsWith("arrow"):
						const arrow = cmd.slice(5); // remove the word arrow
						if (this.puppet && !this.inputQueue.includes(arrow)) {
							this.inputQueue.push(arrow);
						}
						acting = true;
						break;

					case cmd == "escape":
						this.scene?.togglePause();
						break;

					case cmd == " ":
						if (this.puppet && !this.inputQueue.includes("interact")) {
							this.inputQueue.push("interact");
						}
						acting = true;
						break;
				}

				if (!this.controllingPuppet) {
					this.controlPuppet();
				}
			}),
		);

		document.addEventListener(
			"keyup",
			(this.keyupListener = (e) => {
				const cmd = e.key.toLowerCase();

				switch (true) {
					case cmd.startsWith("arrow"):
						const arrow = cmd.slice(5); // remove the word arrow
						if (this.puppet && this.inputQueue.includes(arrow)) {
							this.inputQueue.splice(this.inputQueue.indexOf(arrow), 1);
						}
						break;

					case cmd == " ":
						if (this.puppet && !this.inputQueue.includes("interact")) {
							this.inputQueue.splice(this.inputQueue.indexOf("interact"), 1);
						}
						break;
				}
			}),
		);
	}

	removeListeners() {
		this.keydownListener &&
			document.removeEventListener("keydown", this.keydownListener);
		this.keyupListener &&
			document.removeEventListener("keyup", this.keyupListener);
	}

	bindPuppet(puppet: Id<GridCharacter>) {
		this.puppet = puppet;
	}

	async controlPuppet() {
		if (this.controllingPuppet) {
			return;
		}
		this.controllingPuppet = true;

		while (this.inputQueue.length) {
			if (!this.puppet) break;
			
			let entity = this.scene?.getEntityById(this.puppet)
			if (!entity) break;
			
			const input = this.inputQueue[this.inputQueue.length - 1];
			if (input == "interact") {
			} else {
				try {
					await entity?.startBehavior({
						action: "walk",
						direction: input as GridDirs,
					});
				} catch (error) {
					this.inputQueue = [];
				}
			}
		}

		this.controllingPuppet = false;
	}
}

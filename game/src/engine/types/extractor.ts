import type { Scene } from "../scene";

export default abstract class Extractor<T> {
	abstract fromScene(scene: Scene): Promise<T>;
}


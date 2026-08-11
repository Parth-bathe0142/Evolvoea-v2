import type { GameObject } from "./GameObject";
import type { GameObjectClass } from "./types";

function* generator() {
	let id = 0;
	while (true) yield id++;
}

export default class Id<T extends GameObject = GameObject> {
	declare private readonly phantomType: T;

	private static idGenerator = generator();
	private static bookedIds = new Set<number>();

	static generateNewId(): number {
		let id = this.idGenerator.next().value!;
		while (true) {
			if (!this.bookedIds.has(id)) return id;
			else this.bookedIds.delete(id);
			id = this.idGenerator.next().value!;
		}
	}

	static bookId<T extends GameObject>(
		cls: GameObjectClass<T>,
		id: number,
	): Id<T> {
		if (this.bookedIds.has(id)) {
			console.warn(`Duplicate id requested ${id}`);
		}
		this.bookedIds.add(id);
		return new Id<T>(cls.typeName, id);
	}

	static create<T extends GameObject>(cls: GameObjectClass<T>): Id<T> {
		const id = this.generateNewId();
		this.bookedIds.add(id);
		return new Id<T>(cls.typeName, id);
	}

	static releaseId(id: number) {
		this.bookedIds.delete(id);
	}

	value: number;
	type: string;

	get key() {
		return `${this.type}:${this.value}`;
	}

	constructor(type: string);
	constructor(type: string, val: number);

	constructor(type: string, val?: number) {
		if (val !== undefined) {
			this.value = val;
			this.type = type;
		} else {
			this.type = type;
			this.value = Id.generateNewId();
		}
	}
}

export class IdMap {
	private map = new Map<string, GameObject>();

	get<T extends GameObject>(id: Id<T>): T | undefined {
		return this.map.get(id.key) as T | undefined;
	}

	set<T extends GameObject>(id: Id<T>, entity: T): this {
		this.map.set(id.key, entity);
		return this;
	}

	has(id: Id): boolean {
		return this.map.has(id.key);
	}

	delete(id: Id): boolean {
		return this.map.delete(id.key);
	}

	get size(): number {
		return this.map.size;
	}

	values(): IterableIterator<GameObject> {
		return this.map.values();
	}

	entries(): IterableIterator<[string, GameObject]> {
		return this.map.entries();
	}

	forEach(
		callback: (
			entity: GameObject,
			key: string,
			map: Map<string, GameObject>,
		) => void,
	): void {
		this.map.forEach(callback);
	}

	[Symbol.iterator]() {
		return this.map.values();
	}
}

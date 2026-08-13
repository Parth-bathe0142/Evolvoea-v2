import type { GameObject } from "./GameObject";
import type { TypeRegistry } from "./TypeRegistry";
import type { GameObjectClass, TypeId } from "./types";

function* generator() {
	let id = 0;
	while (true) yield id++;
}

export default class Id<T extends GameObject = GameObject> {
	declare private readonly phantomType: T

	// set once at startup, before any Id is created — see note below
	static registry: TypeRegistry

	private static idGenerator = generator()
	private static bookedIds = new Set<number>()

	static generateNewId(): number {
		let id = this.idGenerator.next().value!
		while (this.bookedIds.has(id)) {
			id = this.idGenerator.next().value!   // skip forward only — never evict an existing owner
		}
		return id
	}

	static bookId<T extends GameObject>(cls: GameObjectClass<T>, id: number): Id<T> {
		if (this.bookedIds.has(id)) {
			console.warn(`Duplicate id requested ${id}`)
		}
		this.bookedIds.add(id)
		return new Id<T>(cls, id)
	}

	static create<T extends GameObject>(cls: GameObjectClass<T>): Id<T> {
		const id = this.generateNewId()
		this.bookedIds.add(id)
		return new Id<T>(cls, id)
	}

	static releaseId(id: number) {
		this.bookedIds.delete(id)
	}

	readonly value: number
	readonly type: string
	readonly typeId: TypeId
	readonly key: bigint

	private constructor(cls: GameObjectClass<T>, val: number) {
		this.type = cls.typeName
		this.typeId = Id.registry.getId(cls)
		this.value = val
		// pack typeId (upper 32 bits) and value (lower 32 bits) into one bigint —
		// cheaper to hash/compare than building and interning a string every time
		this.key = (BigInt(this.typeId) << 32n) | BigInt(this.value)
	}
}

export class IdMap {
	private map = new Map<BigInt, GameObject>();

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

	entries(): IterableIterator<[BigInt, GameObject]> {
		return this.map.entries();
	}

	forEach(
		callback: (
			entity: GameObject,
			key: BigInt,
			map: Map<BigInt, GameObject>,
		) => void,
	): void {
		this.map.forEach(callback);
	}

	[Symbol.iterator]() {
		return this.map.values();
	}
}

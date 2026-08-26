import type { GameObject } from "./GameObject.js";
import type { GameObjectClass, TypeId, TypeInfo } from "./types";
import type Id from "./IdGenerator.js";

function hashTypeName(name: string): TypeId {
	let hash = 0x811c9dc5;
	for (let i = 0; i < name.length; i++) {
		hash ^= name.charCodeAt(i);
		hash = Math.imul(hash, 0x01000193);
	}
	return hash >>> 0;
}

export class TypeRegistry {
	private readonly byClass = new Map<GameObjectClass<any>, TypeInfo<any>>();

	private readonly byId = new Map<TypeId, TypeInfo<any>>();

	register<T extends GameObject>(
		cls: GameObjectClass<T>,
		...ancestors: GameObjectClass<any>[]
	): TypeId {
		if (this.byClass.has(cls)) {
			throw new Error(`Type "${cls.typeName}" is already registered`);
		}
		
		const id = hashTypeName(cls.typeName);
		const existing = this.byId.get(id);
		if (existing) {
			throw new Error(
				`Type ID collision: "${cls.typeName}" and "${existing.name}" both hash to ${id}`,
			);
		}
		
		const ancestorIds = new Set<TypeId>();
		for (const ancestor of ancestors) {
			const info = this.byClass.get(ancestor);
			
			if (!info) {
				throw new Error(
					`Cannot register "${cls.typeName}":  +
                    "${ancestor.typeName}" has not been registered`,
				);
			}
			ancestorIds.add(info.id);
		}
		
		// A type is also considered a type of itself.
		ancestorIds.add(id);
		const info: TypeInfo<T> = {
			id,
			name: cls.typeName,
			cls,
			ancestors: ancestorIds,
		};
		this.byClass.set(cls, info);
		this.byId.set(id, info);
		return id;
	}
	getId<T extends GameObject>(cls: GameObjectClass<T>): TypeId {
		const info = this.byClass.get(cls);
		if (!info) {
			throw new Error(`Type "${cls.typeName}" is not registered`);
		}
		return info.id;
	}
	getInfo(id: TypeId): TypeInfo {
		const info = this.byId.get(id);
		if (!info) {
			throw new Error(`Unknown type ID: ${id}`);
		}
		return info;
	}
	getClass(id: TypeId): GameObjectClass<any> {
		return this.getInfo(id).cls;
	}
	getName(id: TypeId): string {
		return this.getInfo(id).name;
	}
	isExactType<T extends GameObject>(id: Id, cls: GameObjectClass<T>): boolean {
		return id.typeId === this.getId(cls);
	}
	isType<T extends GameObject>(id: Id, cls: GameObjectClass<T>): boolean {
		return this.getInfo(id.typeId).ancestors.has(this.getId(cls));
	}
}

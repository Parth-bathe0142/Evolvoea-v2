function *generator() {
    let id = 0
    while(true) yield id++
}
const _idGenerator = generator()
const bookedIds = new Set<number>()

export const idGenerator = {
    generateNewId(): number {
        let id = _idGenerator.next().value!
        while(true) {
            if(!bookedIds.has(id))
                return id
            else bookedIds.delete(id)
            id++
        }
    },

    bookId(id: number): number {
        bookedIds.add(id)
        return id
    }
}
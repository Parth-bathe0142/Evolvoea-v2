type screens = "title-screen" | "replay-screen" | "game-screen" | ""

export const ui = {
    goToScreen(name: screens) {
        Array.from(document.getElementsByClassName("ui")).forEach(screen => {
            let element = screen as HTMLDivElement
            
            if(element.id == name) {
                element.classList.toggle("flex")
            } else {
                element.classList.toggle("hidden")
            }
        })
    },

    goToGame() {
        this.goToScreen("game-screen")
    },

    gameOver() {
        document.querySelector("#replay-screen_title")!.innerHTML = "Game Over"
        this.goToScreen("replay-screen")
    },
    
    gameWon() {
        document.querySelector("#replay-screen_title")!.innerHTML = "Game Won"
        this.goToScreen("replay-screen")
    }
}


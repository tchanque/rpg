import {Fighter} from "../character.js"

class Game {
    constructor(turns=10) {
        this.turn = 1
        this.turnsLeft = turns
        this.grace = new Fighter("Grace")
        this.ulder = new Paladin("Ulder")
        this.moana = new Monk("Moana")
        this.draven = new Berzerker("Draven")
        this.carl = new Assassin("Carl")

        this.playersArray = [this.grace, this.ulder, this.moana, this.draven, this.carl];
        this.alivePlayersArray = this.playersArray
    }

    launchNewTurn() {
        // At the start of a turn
        console.log(20*"*")
        console.log(`Starting turn ${this.turn}`)
       
        let playersYetToPlay = this.alivePlayersArray;
        // As long as there are players yet to play, then the turn goes on
        while (!playersYetToPlay.length != 0) {
            // Pick a random player in this list
            // let playingPlayer = this.randomPlayer(playersYetToPlay)
            let playingPlayer = playersYetToPlay[0] // Select Grave for test purpose

            console.log(`It's ${playingPlayer.name}'s turn`)

            // Update the list by removing the playing player
            playersYetToPlay = playersYetToPlay.filter((player) => player!= playingPlayer)

            // Define an array of players who can be attacked (everyone but the playing player)
            let canBeAttacked = this.alivePlayersArray.filter((player) => player != playingPlayer)

            spell = window.prompt("Test")
            // Select menu with Basic Attack or Special Attack


            // 

            // At the end of his/her turn:
            // - update this.alivePlayersArray to account if a player has died during the turn
            // - remove any dead players from the playersYetToPlay array since they are eliminated
        }


        // At the end of each turn, should:
        // - erase all the buffs and reactions active for the active turn (0)
        // - decrement by one all the primary keys in the buff and reaction jsons (1 is passed to 0 and so on...)
        console.log(`End of turn ${this.turn}`)
        this.turn += 1;

        this.turnsLeft -= 1;
        console.log(`Remaining turns : ${this.turnsLeft}`)

    }

    launchGame() {
        // Win condition : if only one player remaining OR turnLeft reach 0
    }

    updateAlivePlayers() {
        this.alivePlayersArray = this.alivePlayersArray.filter((player) => player.status === "alive");
    }

    // Function to pick a random player to play
    randomPlayer(playerArray) {
        // Use Math.random() to generate a random number between 0 and 1,
        // multiply it by the length of the array, and use Math.floor() to round down to the nearest integer
        return playerArray[Math.floor(Math.random() * playerArray.length)];
    }

}

let game = new Game(turns=1)
game.launchNewTurn()

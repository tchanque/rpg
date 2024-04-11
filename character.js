// Character 
// Attributes: [hp, dmg, mana, status]
// Method: take Damage, dealDamage

class Character {
    constructor(name, hp, dmg, mp) {
        this.name = name;

        this.maxHP = hp;
        this.hp = hp;

        this.dmg = dmg; // Damage for basic attack
        
        this.maxMP = mp;
        this.mp = mp;
        this.status = "alive";

        this.pendingAttack = [];

        this.reactionOnHit = {
            // "0": [
            //     {
            //         "increaseDefense": 2,
            //         "increaseAttack": 1
            //     }
            // ]
        }

        this.buff = {
            "0": [
                {
                    "attack": 1
                }
            ],
            "1": [
                {
                    "defense": 1
                }
            ]
        }
    }

    searchBuff(buffAttribute) {
        if (this.buff["0"]) {
            // The character has buffs for this turn
            // Let's find out if there is a buff related to the buffAttribute (attack, defense or others) 
            const buffsOnTurn = this.buff["0"][0]
            const buffEntry = Object.entries(buffsOnTurn).find(([key, value]) => key == buffAttribute);

            if (buffEntry !== undefined) {
                const [buffedAttribute, buffedBy] = buffEntry
                console.log(`${this.name} has a ${buffAttribute} buff of ${buffedBy} during this turn.`);
                return buffedBy;
            } 
            else {
                console.log(`${this.name} has buffs for this turn, but no buff corresponds to ${buffAttribute}`);
            }
        }
        return 0; // return 0 if no buff is found
    }
    
    takeDamage(receivedDmg) {
        // First let's find if there is any defense buff
        let defenseBuffedBy = this.searchBuff("defense")
        receivedDmg = Math.max(receivedDmg - defenseBuffedBy, 0)

        // this.hp takes a new value, equal or greater than 0
        console.log(`${this.name} loses ${receivedDmg} health points`)
        this.hp = Math.max(this.hp - receivedDmg, 0); 
        this.updateStatus()
        this.printStatus()

        // now should trigger all the reactions on hit for the receiver if he/she has any:
        if (this.reactionOnHit.hasOwnProperty("0")) {
            let reactionsList = this.reactionOnHit["0"] // is the array containing all the couples {reaction: effect} (hash)
            
            let reactionNames = [];
            reactionsList.map((reaction) => {
                for(var reactionName in reaction) {
                    reactionNames.push(reactionName)
                    console.log(`Triggering buff ${reactionName}`)
                    this.triggerReaction(reactionName, 0, reaction[reactionName])
                }
            })
            // console.log(`The attack on ${this.name} has triggered the following reactions: ${reactionNames}`)
        }
    }

    dealDamage(victim, dmg=this.dmg) {
        // Default behavior is a normal attack, hence why dmg=this.dmg

        // First, search if the character has a damage buff applied to the attack
        let damageBuffedBy = this.searchBuff("attack"); // returns 0 if no buff found
        dmg += damageBuffedBy;

        console.log(`${this.name} should deal ${dmg} damage(s) to ${victim.name}`);

        // Inflict damage on the victim
        victim.takeDamage(dmg);
        
        // Check if victim is dead and restore 20 MP if so
        if (victim.status=="dead") {
            console.log(`${victim.name} has died following the attack... Restoring 20 MP for the attacker`)
            this.restoreMP(20);
        }
    }

    updateStatus() {
        if (this.hp == 0)
            this.status = "dead"
    }

    printStatus() {
        if (this.status=="dead")
            console.log(`${this.name} is ${this.status}`)
        else 
            console.log(`${this.name} has ${this.hp} health points`)
    }

    checkEnoughMP(cost) {
        if (this.mp < cost) {
            console.log("The player can't cast the spell because mana is too low")
            return false;
        } else {
            return true;
        }
    }

    restoreHP(restoredHP=0) {
        this.hp = Math.min(this.hp + restoredHP, this.maxHP);
        console.log(`${this.name} has received ${restoredHP} HP which is now ${this.hp}`)
    }

    restoreMP(restoredMP=0) {
        this.mp = Math.max(this.mp + restoredMP, this.maxMP);
        console.log(`${this.name} has received ${restoredMP} MP which is now ${this.mp}`)
    }

    consumeMP(consumedMP=0) {
        // Should never be negative since we check the player has enough MP before casting a spell
        this.mp -= consumedMP;
        console.log(`${this.name} uses ${consumedMP} MP to cast the spell`)
    }

    consumeHP(consumedHP=0) {
        // We can add a condition checking if the character hp reaches 0, which would cancel the spell for instance or lead to death
        this.hp = Math.max(this.hp - consumedHP, 0);
        this.updateStatus;
        console.log(`${this.name} self inflicts ${consumedHP} HP`)
    }

    triggerReaction(reaction, turn, effect) {
        switch (reaction) {
            case 'increaseDefense':
                console.log("The attack has triggered a defense buff")
                this.increaseBuff(turn, effect, "defense")
                break;
            case 'increaseAttack':
                console.log("The attack has triggered an attack buff")
                this.increaseBuff(turn, effect, "attack")
                break;
        }
    }

    increaseBuff(turn=0, by=0, buffType="attack") {
        let turnString = turn.toString();
        if (this.buff[turnString]) { // then the specific turn contains buffs, let's see if there is any associated to the buffType
            const buffOnTurn = this.buff[turnString][0]; // Selecting the object containing the pair {buffedFeature: buffValue}
            if (buffOnTurn[buffType]) { // there is an existing buff for the buffType
                this.buff[turnString][0][buffType] += by; // we just increment the buff by the value of "by"
            } else {
                this.buff[turnString][0][buffType] = by; // else we just create a new buff for the buffType
            }
        } else { // if no buff is existing for this turn, we create a new entry for the turn
            this.buff[turnString] = [{ [buffType]: by }];
        }
        console.log(`The ${buffType} has been buffed by ${by}`);
        console.log(`The buff JSON is now : ${JSON.stringify(this.buff, null, 2)}`)
    }

    deleteCurrentTurnEffects(effectsJSON) {
        if (Object.keys(effectsJSON).length != 0) { // if not empty
            effectsJSON = Object.fromEntries(
                Object.entries(effectsJSON).filter(([key, value]) => key !== "0")
            );
            // Object.keys(effectsJSON).filter(objKey => objKey!== "0");
            console.log(`${this.name}'s effects for the current turn have been destroyed`);
            console.log(`The new JSON after dropping current turn effects : ${JSON.stringify(effectsJSON, null, 2)}`)
        } else {
            console.log(`${this.name} had no active effects of this kind during this turn`);
        }

        return effectsJSON
    }

    updateBuffTurns(effectsJSON) {
        // This method will update the turns in the provided JSON containing the effects such as buffs or reactions on hit.
        // At the end of each turn, we must decrement by one the keys of the JSON so that we move on in the turns.
        // Ex: The current turn is over, we prepare the next one. As a result, we need to update the key "1" (active for the next turn) so it becomes "0" (active for the current turn)
        // Same goes for the following turns, key "2" (active for the turn after the next one) becomes "1" (active for the next turn) and so on...
        console.log(`Updating the turns of the JSON for ${this.name}`)
        if (Object.keys(effectsJSON).length!=0) { //if not empty
            effectsJSON = Object.keys(effectsJSON).reduce((newObj, key) => {
                let newKey = (parseInt(key)-1).toString();
                newObj[newKey] = effectsJSON[key];
                return newObj;
            }, {});
            console.log(`The player's JSON after the turn update is as follow : ${JSON.stringify(effectsJSON, null, 2)}`)
        }
        else {
            console.log("The player's JSON for this kind of effects is empty.")
        }
        return effectsJSON;
    }
}

class Fighter extends Character {
    constructor(name) {
        super(name, 12, 4, 40)
        console.log(`Introducing the new player ${this.name}`)
    }

    castDarkVision(victim) {
        // Is missing : during the next turn, the fighter reduces the damage dealt on him by 2 points everytime someone attacks him/her
        if (super.checkEnoughMP(20)) {
            console.log(`${this.name} attacks ${victim.name} with the special attack Dark Vision`)
            super.consumeMP(20);
            super.dealDamage(victim, 5)
            // then the warrior triggers a buff for the next turn where he increases his defense by 2 points everytime he receives damages
            console.log(`Dark Vision will add a defense buff on ${this.name} everytime he/she is being hit during the next turn`)
            // Check if the fighter already has a reaction on hit for the next turn
            // 1 being the number meaning "next turn"
            const hasReaction = this.reactionOnHit["1"];
            if (!hasReaction) {
                // no reaction on hit for the next turn, so we can create one and initalize it with increaseDefense
                this.reactionOnHit["1"] = [
                    {"increaseDefense": 2}
                ];
            }
            
            else {
                const reactionsNextTurn = this.reactionOnHit["1"][0];
                const hasDefenseReaction = reactionsNextTurn["increaseDefense"]

                if (hasDefenseReaction) {
                    console.log(`${this.name} already has a defense reaction next turn, his/her defense reaction is being increased by 2`)
                    // if the fighter already has a defense buff on hit for the next turn
                    // then we just increase the value of the buff by 2
                    this.reactionOnHit["1"][0]["increaseDefense"] += 2;
                }

                else {
                    console.log(`${this.name} has no defense reaction next turn, his/her defense reaction is being set to 2`)
                    // There is a reaction on hit for the next turn but not a defense buff
                    // Then we can create one
                    this.reactionOnHit["1"][0]["increaseDefense"] = 2;
                }
            }
        };
    };
}

class Paladin extends Character {
    constructor(name) {
        super(name, 16, 3, 160)
        console.log(`Introducing the new player ${this.name}`)
    }

    castHealingLighting(victim) {
        if (super.checkEnoughMP(40)) {
            console.log(`${this.name} attacks ${victim.name} with Healing Lighting`)
            super.consumeMP(40);
            super.dealDamage(victim, 4)
            super.restoreHP(5)
        }
    }
}

class Monk extends Character {
    constructor(name) {
        super(name, 8, 2, 200)
        console.log(`Introducing the new player ${this.name}`)
    }

    castHeal() {
        if (super.checkEnoughMP(25)) {
            console.log(`${this.name} uses Heal`)
            super.restoreHP(8);
        }
    }
}

class Berzerker extends Character {
    constructor(name) {
        super(name, 8, 4, 0)
        console.log(`Introducing the new player ${this.name}`)
    }

    castRage() {
        console.log(`${this.name} uses Rage which increases his attack by 1 until the end of the game`)
        this.dmg += 1;
        super.consumeHP(1);
    }
}

class Assassin extends Character {
    constructor(name) {
        super(name, 6, 6, 20)
        console.log(`Introducing the new player ${this.name}`)
    }

    castShadowHit() {
        if (this.checkEnoughMP(20)) {
            // Increase the next attack by 1 (from 6 to 7) and the defense by 100 (invulnerable)
            console.log(`${this.name} uses Shadow Hit, the next attack will cause 7 of damages`)
            super.consumeMP(20);
            super.increaseBuff(1, 1, "attack");
            super.increaseBuff(1, 100, "defense");
            this.pendingAttack.push(this.triggerShadowHit);
        }
    }

    triggerShadowHit(victim) {
        // the damages will automatically be enhanced with the attack buff (or we can directly pass 7 as an argument)
        this.dealDamage(victim)

        if (victim.status != "dead") {
            // If the victim is not dead after the blow, then it deals back 7 damages to the player
            console.log(`The victim is not dead despite the Shadow Hit... Therefore ${this.name} loses 7 HP`)
            this.consumeHP(7)
        } 

    }
}

class Wizard extends Character {
    constructor(name) {
        super(name, 10, 2, 200)
        console.log(`Introducing the new player ${this.name}`)
    }

    castFireBall(victim) {
        if (this.checkEnoughMP(25)) {
            console.log(`${this.name} uses Fireball on ${victim.name}`);
            this.dealDamage(victim)
        }
    }
}


class Game {
    constructor(turns) {
        this.turn = 1
        this.turnsLeft = turns

        this.playersArray = [
            new Fighter("Grace"), 
            // new Paladin("Ulder"),
            // new Monk("Moana"),
            // new Berserker("Draven")
            new Assassin("Carl")
        ];
        this.alivePlayersArray = this.playersArray
    }

    launchNewTurn() {
        // At the start of a turn
        console.log("*".repeat(20))
        console.log(`Starting turn ${this.turn}`)
       
        let playersYetToPlay = this.alivePlayersArray;
        // As long as there are players yet to play, then the turn goes on
        while (playersYetToPlay.length != 0) {

            // --- PLAYER SELECTION AND LIST UPDATES ---

            // Pick a random player in this list
            // let playingPlayer = this.randomPlayer(playersYetToPlay)
            let playingPlayer = playersYetToPlay[0] // Select the first player of the list for test purpose
            playersYetToPlay = playersYetToPlay.filter((player) => player!= playingPlayer) // Update the list by removing the playing player
            let canBeAttacked = this.alivePlayersArray.filter((player) => player != playingPlayer) // Define an array of players who can be attacked (everyone but the playing player)
            
            console.log(`--- It's ${playingPlayer.name}'s turn ---`)

            // --- END OF PLAYER SELECTION ---


            // ---- ATTACK PHASE WITH PROMPT SELECTION ----

            // ATTACK SELECTION
            // Will need to skip the first prompt if there is a pending attack (in pendingAttack)
            let spell = 0
            if (playingPlayer.pendingAttack.length>0) {
                spell = 3
                alert(`An attack was pending: ${player.pendingAttack}`)
            }
            else { // Normal behavior, pick 1 for basic attack or 2 for special attack
                spell = parseInt(prompt("Pick an action: 1 for Basic Attack, 2 for Special Attack"));
                while (spell !== 1 && spell !== 2) {
                    spell = parseInt(prompt("Wrong input. Pick an action: 1 for Basic Attack, 2 for Special Attack"));
                }
            };
            
            // VICTIM SELECTION
            let possibleVictimsIndex = [];
            for (var index=0; index < canBeAttacked.length; index++) { // Restriction on the victim choice
                possibleVictimsIndex.push(index)
            } 

            let victimIndex = parseInt(prompt(`Choose a victim with a number between ${possibleVictimsIndex[0]} and ${possibleVictimsIndex.slice(-1)}`))
            while (!possibleVictimsIndex.includes(victimIndex)) {
                victimIndex = parseInt(prompt(`Wrong input. Pick a victim with a number between ${possibleVictimsIndex[0]} and ${possibleVictimsIndex.slice(-1)}`))
            }
            
            let victim = canBeAttacked[victimIndex]

            alert(`${victim.name} has been chosen`)

            // ATTACK EXECUTION
            switch (spell) {
                case 1: // Basic Attack
                    console.log(`${playingPlayer.name} attacks ${victim.name} with a Basic Attack`)
                    playingPlayer.dealDamage(victim)
                    break;
                case 2: // Special Attack
                    console.log(`${playingPlayer.name} attacks ${victim.name} with his/her Special Attack`)
                    let playerClass = playingPlayer.constructor.name

                    switch (playerClass) {
                        case "Fighter":
                            playingPlayer.castDarkVision(victim);
                            break;
                        case "Paladin":
                            playingPlayer.castHealingLighting(victim);
                            break;
                        case "Monk":
                            playingPlayer.castHeal();
                            break;
                        case "Berzerker":
                            playingPlayer.castRage();
                            break;
                        case "Assassin": 
                        playingPlayer.castShadowHit();
                            break;
                    }
                case 3: // Pending attack
                    switch (typeof playingPlayer) {
                        case "Assassin": 
                            playingPlayer.triggerShadowHit(victim);
                            playingPlayer.pendingAttack = []; // clear the pending attack from the pendingAttack array since the action was executed
                            break;
                    }
            }

            // --- END OF ATTACK PHASE ---


            // --- UPDATING THE LISTS ---
            // At the end of each player's turn:
            this.alivePlayersArray = this.keepAlivePlayers(this.alivePlayersArray) // update this.alivePlayersArray to account for any dead player during the turn
            playersYetToPlay = this.keepAlivePlayers(playersYetToPlay) // remove any dead players from the playersYetToPlay array since they are eliminated

            console.log(`--- This is the end of ${playingPlayer.name}'s turn ---`)

            // --- END PLAYER'S TURN ---
            
        }

        
        // --- END OF ATTACK PHASE ---

        console.log(`--- End of attack phase for ${this.turn} ---`)
        console.log(`Now resetting the parameters to prepare the next turn`)
        // At the end of each turn, it should:
        // - delete all the buffs and reactions for the active turn (0)
        this.cleanAllPlayersEffects();

        // - decrement by one all the turn keys in the buff and reaction jsons (1 is passed to 0 and so on...)
        console.log(`--- End of turn ${this.turn} ---`)
        this.turn += 1;

        this.turnsLeft -= 1;
        console.log(`Remaining turns : ${this.turnsLeft}`)

    }

    launchGame() {
        // Win condition : if only one player remaining OR turnLeft reach 0
        while (this.turnsLeft>0 && this.alivePlayersArray.length>1) {
            alert(`This is turn ${this.turn} and there is ${this.turnsLeft} turns left`)
            this.launchNewTurn();
        }
    }

    keepAlivePlayers(playersArray) {
        return playersArray.filter((player) => player.status === "alive");
    }

    // Function to pick a random player to play
    randomPlayer(playerArray) {
        // Use Math.random() to generate a random number between 0 and 1,
        // multiply it by the length of the array, and use Math.floor() to round down to the nearest integer
        return playerArray[Math.floor(Math.random() * playerArray.length)];
    }

    cleanAllPlayersEffects() {
        this.alivePlayersArray.map((player) => {
            console.log(`--> Cleaning up the buffs on ${player.name}`)
            player.buff = player.deleteCurrentTurnEffects(player.buff)
            player.buff = player.updateBuffTurns(player.buff)

            console.log(`--> Cleaning up the reactions on hit on ${player.name}`)
            player.reactionOnHit = player.deleteCurrentTurnEffects(player.reactionOnHit)
            player.reactionOnHit = player.updateBuffTurns(player.reactionOnHit)
        })
    }

}

// let game = new Game(turns=2)
// game.launchGame()

let carl = new Berzerker("Carl")
let moana = new Paladin("Moana")
carl.castRage()
carl.buff = carl.deleteCurrentTurnEffects(carl.buff)
carl.buff = carl.updateBuffTurns(carl.buff)
carl.dealDamage(moana)
// carl.triggerShadowHit(moana)
moana.castHealingLighting(carl)
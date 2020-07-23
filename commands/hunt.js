const PlayerLevel = require('../models/playerLevel.js')
const Creature = require('../models/creature.js')
const utility = require('../utility.js')
let battleOrderIndex = 0

module.exports = {
  name: 'hunt',
  description: 'search for monsters to slay in order to gain exp',
  aliases: ['h'],
  cooldown: 5,
  async execute (client, user, message, args) {
    const battleLogMessage = []
    if (user.stats.stamina === 0) {
      message.reply('You are out of stamina! Try buying a meal from the `shop`.')
    } else if (user.stats.hp < 1) {
      message.reply('You don\'t have enough health to hunt. Try buying a health potion from the `shop`.')
    } else {
      const availableStamina = user.stats.stamina
      const levelInfo = await PlayerLevel.findOne({ level: { $eq: user.stats.level } }).catch(err => console.log(err))

      // based off level and available stamina, find a random creature for the player to fight
      const combatCreature = await Creature.aggregate([
        {
          $match: {
            exp: {
              $lte: levelInfo.maxEncounterExp
            },
            staminaCost: {
              $lte: availableStamina
            }
          }
        }, {
          $sample: {
            size: 1
          }
        }
      ]).catch(err => console.log(err))
      const creature = combatCreature[0]

      // roll creature health
      let creatureHp = 0
      for (let index = 0; index < creature.hp.dieCount; index++) {
        const maxInt = creature.hp.dieSides + 1
        const dieRoll = utility.getRandomInt(maxInt)
        creatureHp += dieRoll
      }
      creatureHp += creature.hp.modifier

      battleLogMessage.push(`You found a **${creature.name}** with **${creatureHp}** HP!`)

      // roll initiative
      const creatureInit = utility.getRandomInt(21)
      const characterInit = utility.getRandomInt(21) + levelInfo.proficiencyModifier

      const battleOrder = [{ key: creatureInit, isCreature: true },
        { key: characterInit, isCreature: false }]
        .sort((a, b) => a.key - b.key)

      performBattle(battleOrder, user, creature, creatureHp, levelInfo.proficiencyModifier)

      if (user.stats.hp <= 0) {
        const rollForDisengage = utility.getRandomInt(21) + 1 + levelInfo.proficiencyModifier
        if (rollForDisengage > utility.getRandomInt(21)) {
          battleLogMessage.push(`You were nearly defeated by ${creature.name}, but managed to flee in time! You have gained no exp.`)
        } else {
          battleLogMessage.push(`You were defeated by the ${creature.name}! You lost a total of **${creature.exp}** exp.`)

          // level down
          if (user.stats.exp - creature.exp < 0 && user.stats.level > 1) {
            user.stats.level -= 1
            battleLogMessage.push(`You have lost a level! You are now level ${user.stats.level}`)
            const newLevelInfo = await PlayerLevel.findOne({ level: { $eq: user.stats.level } }).catch(err => console.log(err))
            user.stats.stamina = newLevelInfo.stamina
            user.stats.exp = newLevelInfo.expToNextLvl - creature.exp
          } else {
            user.stats.exp = 0
          }
        }
        user.stats.hp = 0
        user.stats.stamina -= creature.staminaCost
      } else {
        battleLogMessage.push(`You defeated the ${creature.name}! You gained a total of **${creature.exp}** exp.`)
        // level up
        if (user.stats.exp + creature.exp > levelInfo.expToNextLvl) {
          const newExp = user.stats.exp + creature.exp - levelInfo.expToNextLvl
          user.stats.level += 1
          battleLogMessage.push(`You have gained a level! You are now level ${user.stats.level}`)
          const newLevelInfo = await PlayerLevel.findOne({ level: { $eq: user.stats.level } }).catch(err => console.log(err))
          user.stats.stamina = newLevelInfo.stamina
          user.stats.exp = newExp
        } else {
          user.stats.exp += creature.exp
        }

        user.stats.stamina -= creature.staminaCost
      }
      battleLogMessage.push(`**Current Stats:**\n ${utility.getEmojiId('tbhealthpot2', client)} \`${user.stats.hp} / ${levelInfo.hp}\` ${utility.getEmojiId('tbstamina', client)} \`${user.stats.stamina} / ${levelInfo.stamina}\` ${utility.getEmojiId('tbexp', client)} \`${user.stats.exp} / ${levelInfo.expToNextLvl}\``)
      await user.save()
      message.reply(battleLogMessage.join('\n'))
    }
  }
}

function performBattle (battleOrder, user, creature, creatureHp, userProficiencyModifier) {
  while (user.stats.hp > 0 || creatureHp > 0) {
    if (user.stats.hp <= 0 || creatureHp <= 0) { break }

    const attacker = battleOrder[battleOrderIndex]
    const hit = utility.getRandomInt(21) + 1

    if (attacker.isCreature === true) {
      if (hit > (user.stats.armor + userProficiencyModifier)) {
        console.log(`creature's ${hit} initiative is greater than ${user.stats.armor + userProficiencyModifier}`)
        // which attack to use?
        const creatureAttack = creature.dmg[utility.getRandomInt(creature.dmg.length)]
        // how much dmg?
        let creatureAtkDmg = 0
        for (let index = 0; index < creatureAttack.dieCount; index++) { creatureAtkDmg += utility.getRandomInt(creatureAttack.dieSides) + 1 }
        creatureAtkDmg += creatureAttack.modifier
        console.log(creatureAttack)
        // strike
        user.stats.hp -= creatureAtkDmg
        console.log(`creature hit user for ${creatureAtkDmg}. User health is now ${user.stats.hp}`)
      }
    } else {
      if ((hit + userProficiencyModifier) > creature.armor) {
        console.log(`users's ${hit + userProficiencyModifier} initiative is greater than ${creature.armor}`)
        // how much dmg?
        const userAtkDmg = (utility.getRandomInt(21) + 1) + userProficiencyModifier + user.stats.atk
        // strike
        creatureHp -= userAtkDmg
        console.log(`user hit creature for ${userAtkDmg}. Creature health is now ${creatureHp}`)
      }
    }
    battleOrderIndex = battleOrderIndex >= battleOrder.length - 1 ? 0 : battleOrderIndex + 1
    console.log(`battle order index now ${battleOrderIndex}`)
  }
}

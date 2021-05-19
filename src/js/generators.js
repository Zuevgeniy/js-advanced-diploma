/**
 * Generates random characters
 *
 * @param allowedTypes iterable of classes
 * @param maxLevel max character level
 * @returns Character type children (ex. Magician, Bowman, etc)
 */

import Character from './Character';

export function* characterGenerator(allowedTypes, maxLevel) {
  const { length } = allowedTypes;
  while (true) {
    yield new allowedTypes[
      Math.floor(Math.random() * length)](Math.floor(1 + Math.random() * maxLevel));
  }
}

export function* classGenerator(options) {
  for (let i = 0; i < options.length; i += 1) {
    const option = options[i];
    yield class extends Character {
      constructor(level) {
        super(level);
        this.attack = option.attack;
        this.defence = option.defence;
        this.type = option.type;
        this.atkradius = option.atkradius;
        this.moveradius = option.moveradius;
      }
    };
  }
}

export function generateTeam(allowedTypes, maxLevel, characterCount) {
  const newCharacters = [];
  if (maxLevel === 1) { allowedTypes.splice(2); }
  const characters = characterGenerator(allowedTypes, maxLevel);
  for (let i = 0; i < characterCount; i += 1) {
    newCharacters.push(characters.next().value);
  }
  return newCharacters;
}

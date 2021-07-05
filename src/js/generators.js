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


export function classGenerator(type, boardSize = 8) {
  return new Array(boardSize).fill(0).reduce((acc, prev, index) => {
    if (type ==='player') {
      acc.push(index * boardSize, index * boardSize + 1);
    } else {
      acc.push(index * boardSize + boardSize -2, index * boardSize + boardSize - 1);
    }
    return acc;
  }, []);
}


export function generateTeam(allowedTypes, maxLevel, characterCount, boardSize) {
  const playerCoordinates = classGenerator('player', boardSize);
  const npcCoordinates = classGenerator('npc', boardSize);
  let position;
  let idx;
  const teams = [];
  for (let key = 0; key < characterCount; key += 1) {
    const { value } = characterGenerator(allowedTypes, maxLevel).next();
    if (value.isPlayer) {
      idx = Math.floor(Math.random() * playerCoordinates.length);
      position = playerCoordinates[idx];
      playerCoordinates.splice(idx, 1);
    } else {
      idx = Math.floor(Math.random() * npcCoordinates.length);
      position = npcCoordinates[idx];
      npcCoordinates.splice(idx, 1);
    }
    teams.push(new PositionedCharacter(value, position));
  }
  return teams;
}
/* eslint-disable max-len */
import GamePlay from './GamePlay';
import Team from './Team';
import { generateTeam, classGenerator, characterGenerator } from './generators';
import PositionedCharacter from './PositionedCharacter';
import GameState from './GameState';
import Themes from './themes';
import cursors from './cursors';

const playerClasses = [
  {
    attack: 40, defence: 10, type: 'swordsman', atkradius: 1, moveradius: 4,
  },
  {
    attack: 25, defence: 25, type: 'bowman', atkradius: 2, moveradius: 2,
  },
  {
    attack: 10, defence: 40, type: 'magician', atkradius: 4, moveradius: 1,
  },
];

const enemyClasses = [
  {
    attack: 40, defence: 10, type: 'undead', atkradius: 1, moveradius: 4,
  },
  {
    attack: 25, defence: 25, type: 'vampire', atkradius: 2, moveradius: 2,
  },
  {
    attack: 10, defence: 40, type: 'zombie', atkradius: 4, moveradius: 1,
  },
];

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.playerteam = new Team('player', generateTeam([...classGenerator(playerClasses)], 1, 2));
    this.enemyteam = new Team('enemy', generateTeam([...classGenerator(enemyClasses)], 1, 2));
    this.boardSize = 8;
    this.positions = [...Array(this.boardSize ** 2).keys()];
    this.themes = [...new Themes()];
    this.positionTeams(1);
    this.addCellEnterEvent();
    this.addCellLeaveEvent();
    this.addCellClickEvent();
    this.gameState = new GameState(this.playerteam, this.enemyteam, this.positions);
  }

  positionTeam(team, positions) {
    for (let i = 0; i < team.characters.length; i += 1) {
      let pos;
      if (!(team.characters[i] instanceof PositionedCharacter)) {
        pos = positions[Math.floor((Math.random() * positions.length))];
        if (team.side === 'player') this.playerteam.characters[i] = new PositionedCharacter(team.characters[i], pos);
        else this.enemyteam.characters[i] = new PositionedCharacter(team.characters[i], pos);
      } else { pos = team.characters[i].position; positions.splice(positions.indexOf(pos), 1); }
      if (this.positions.includes(pos)) {
        this.positions.splice(this.positions.indexOf(pos), 1);
      }
    }
  }

  positionTeams(lvl) {
    let allowedPlayerPositions = this.positions;
    let allowedEnemyPositions = [];
    const size = this.boardSize;

    if (lvl === 1) {
      allowedPlayerPositions = this.positions.filter((pos) => (pos % size === 0 || pos % size === 1));
    }

    this.positionTeam(this.playerteam, allowedPlayerPositions);

    if (lvl === 1) {
      allowedEnemyPositions = this.positions.filter((pos) => (pos % size === 7 || pos % size === 6));
    } else { allowedEnemyPositions = this.positions; }

    this.positionTeam(this.enemyteam, allowedEnemyPositions);
  }

  init() {
    this.gamePlay.drawUi(this.themes[0]);
    this.gamePlay.redrawPositions(this.playerteam.characters.concat(this.enemyteam.characters));
    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService
  }

  levelUp() {
    const playerteam = this.playerteam.characters;

    playerteam.forEach((c, i) => {
      this.gameState.score += c.character.health;
      this.playerteam.characters[i].character.level += 1;
      this.playerteam.characters[i].character.health += 80;
      this.playerteam.characters[i].character.attack = Math.max(c.character.attack, c.character.attack * ((1.8 - c.character.health) / 100));
      if (c.character.health >= 100) this.playerteam.characters[i].character.health = 100;
    });

    this.enemyteam = new Team('enemy', generateTeam([...classGenerator(enemyClasses)], this.gameState.level + 1, this.playerteam.characters.length));
    const newPlayerChar = characterGenerator([...classGenerator(playerClasses)], this.gameState.level);
    this.playerteam.characters.push(newPlayerChar.next().value);

    this.gameState.level += 1;

    this.gamePlay.drawUi(this.themes[0]);
    this.positions = [...Array(this.boardSize ** 2).keys()];
    this.positionTeams(this.gameState.level);
    this.gamePlay.redrawPositions(this.playerteam.characters.concat(this.enemyteam.characters));
    this.gameState.stage = 'select';
  }

  selectChar(char, index) {
    if (this.gameState.selectedChar) {
      this.gamePlay.deselectCell(this.gameState.selectedChar.position);
    }
    this.gamePlay.selectCell(index);
    this.gameState.selectedChar = char;
    this.gameState.stage = 'move';
  }

  findRange(char, index, actionAttack) {
    const range = new Set();
    let r;
    if (actionAttack) { r = char.character.atkradius; } else { r = char.character.moveradius; }
    for (let i = -r; i <= r; i += 1) {
      for (let j = -r; j <= r; j += 1) {
        if (actionAttack) range.add(index + i * this.boardSize + j);
        else if ((Math.abs(i) === Math.abs(j)) || (i === 0) || (j === 0)) {
          range.add(index + i * this.boardSize + j);
        }
      }
    }
    return Array.from(range).filter((i) => (i >= 0 && i < (this.boardSize ** 2) && i !== index));
  }

  onCellClick(index) {
    const { stage } = this.gameState;
    if (stage === 'select') {
      if (!this.positions.includes(index)) {
        const char = this.playerteam.characters.filter((c) => c.position === index)[0];
        if (!char) GamePlay.showError('Выберите персонажа СВОЕЙ команды!');
        else this.selectChar(char, index);
      }
    }

    if (stage === 'move' || stage === 'botmove') {
      let allies = [];
      let enemies = [];
      if (stage === 'move') { allies = this.playerteam.characters; enemies = this.enemyteam.characters; } else { allies = this.enemyteam.characters; enemies = this.playerteam.characters; }
      if (!this.positions.includes(index)) {
        const char = allies.filter((c) => c.position === index)[0];
        if (char) this.selectChar(char, index);
        else {
          const attacker = this.gameState.selectedChar;
          const target = enemies.filter((c) => c.position === index)[0];
          if (this.findRange(attacker, attacker.position, true).includes(index)) {
            const damage = Math.max(attacker.character.attack - target.character.defence, attacker.character.attack * 0.1);
            this.gamePlay.showDamage(index, damage);
            target.character.health -= damage;
            this.gamePlay.redrawPositions(allies.concat(enemies));
            if (target.character.health <= 0) {
              this.positions.push(index);
              if (stage === 'move') this.enemyteam.characters.splice(this.enemyteam.characters.indexOf(target), 1);
              else this.playerteam.characters.splice(this.playerteam.characters.indexOf(target), 1);
              if (stage === 'move' && this.enemyteam.characters.length === 0) this.levelUp();
              else this.gamePlay.redrawPositions(allies.concat(enemies));
            } else if (this.playerteam.characters.length === 0) {
              // lose
            } else {
              this.gameState.stage = 'select';
              this.gamePlay.deselectCell(attacker.position);
              this.gamePlay.redrawPositions(allies.concat(enemies));
            }
          } else GamePlay.showError('Цель слишком далеко!');
        }
      } else {
        const char = this.gameState.selectedChar;
        if (this.findRange(char, char.position, false).includes(index)) {
          this.gamePlay.deselectCell(char.position);
          this.positions.push(char.position);
          this.positions = this.positions.filter((i) => i !== index);
          char.position = index;
          this.gamePlay.redrawPositions(this.playerteam.characters.concat(this.enemyteam.characters));

          // TODO: bot logic goes here
        } else GamePlay.showError('Недоступно!');
      }
    }
  }

  addCellClickEvent() {
    this.onCellClick = this.onCellClick.bind(this);
    this.gamePlay.addCellClickListener(this.onCellClick);
  }

  onCellEnter(index) {
    if (!this.positions.includes(index)) {
      const char = this.playerteam.characters.concat(this.enemyteam.characters).filter((c) => c.position === index)[0].character;
      this.gamePlay.showCellTooltip(`🎖 ${char.level} ⚔ ${char.attack} 🛡 ${char.defence} ❤ ${char.health} `, index);
      if (this.gameState.stage === 'move') {
        const attacker = this.gameState.selectedChar;
        const target = this.enemyteam.characters.filter((c) => c.position === index)[0];
        if (target) {
          if (this.findRange(attacker, attacker.position, true).includes(index)) {
            this.gamePlay.setCursor(cursors.crosshair);
            this.gamePlay.selectCell(index, 'red');
          } else { this.gamePlay.setCursor(cursors.notallowed); }
        } else { this.gamePlay.setCursor(cursors.pointer); }
      } else if (this.playerteam.characters.filter((c) => c.position === index)[0]) {
        this.gamePlay.setCursor(cursors.pointer);
      } else { this.gamePlay.setCursor(cursors.notallowed); }
    } else {
      const char = this.gameState.selectedChar;
      if (char && this.findRange(char, char.position, false).includes(index)) {
        this.gamePlay.setCursor(cursors.pointer);
      } else { this.gamePlay.setCursor(cursors.notallowed); }
    }
  }

  addCellEnterEvent() {
    this.onCellEnter = this.onCellEnter.bind(this);
    this.gamePlay.addCellEnterListener(this.onCellEnter);
  }

  onCellLeave(index) {
    if (this.gameState.stage === 'select' || this.gameState.selectedChar.position !== index) {
      this.gamePlay.deselectCell(index);
    }
    this.gamePlay.hideCellTooltip(index);
    this.gamePlay.setCursor(cursors.auto);
  }

  addCellLeaveEvent() {
    this.onCellLeave = this.onCellLeave.bind(this);
    this.gamePlay.addCellLeaveListener(this.onCellLeave);
  }
}

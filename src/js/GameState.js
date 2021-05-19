export default class GameState {
  constructor(playerteam, enemyteam, positions) {
    this.playerteam = playerteam;
    this.enemyteam = enemyteam;
    this.positions = positions;
    this.stage = 'select';
    this.level = 1;
    this.score = 0;
    this.topScore = 0;
  }
}

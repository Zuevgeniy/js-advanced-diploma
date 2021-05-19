export default class Themes {
  constructor() {
    this.themes = [
      'prairie',
      'desert',
      'arctic',
      'mountain',
    ];
  }

  * [Symbol.iterator]() {
    const { length } = this.themes;

    yield this.themes[Math.floor(Math.random() * length)];
  }
}

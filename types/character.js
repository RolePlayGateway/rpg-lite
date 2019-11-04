'use strict';

class Character {
  constructor (settings = {}) {
    this.settings = Object.assign({}, settings);
  }
}

module.exports = Character;
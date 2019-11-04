'use strict';

class Player {
  constructor (settings = {}) {
    this.settings = Object.assign({}, settings);
  }
}

module.exports = Player;
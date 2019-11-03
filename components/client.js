'use strict';

const Component = require('@fabric/http/components/component');
const Canvas = require('./canvas');

class LiteClient extends Component {
  constructor (settings = {}) {
    this.settings = Object.assign({
      handle: 'rpg-lite-client'
    }, settings);
    this.canvas = new Canvas();
  }

  _getInnerHTML () {
    return `<div id="rpg-lite-client"><canvas></canvas></div>`;
  }
}

module.exports = LiteClient;
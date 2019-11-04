'use strict';

// Internal Types
const RPG = require('../');
const Canvas = require('../types/canvas');
const Component = require('@fabric/http/types/component');

class LiteClient extends Component {
  constructor (settings = {}) {
    super(settings);

    this.settings = Object.assign({
      handle: 'rpg-lite-client'
    }, settings);

    this.canvas = new Canvas();
    this.rpg = new RPG(this.settings);

    this.rpg.subscribe('/', this._handleRootMessage.bind(this));

    this._state = {};
  }

  _handleRootMessage (msg) {
    console.log('[RPG:LITE]', '[CLIENT]', 'Root message (in component):', msg);
  }

  _getInnerHTML () {
    let html = ``;

    html += `<div id="rpg-lite-client">`;
    html += `<h1>hello game world!</h1>`
    html += `<canvas></canvas>`;
    html += `</div>`;

    return html;
  }

  async start () {
    await this.canvas._draw();
    await this.canvas._appendTo(document.body);
    await this.rpg.start();
  }
}

module.exports = LiteClient;
'use strict';

const canvas = require('canvas');
const Component = require('@fabric/http/types/component');

class Canvas extends Component {
  constructor (settings = {}) {
    super(settings);

    this.settings = Object.assign({
      dimensions: {
        x: 256,
        y: 256,
        x: 256
      }
    }, settings);

    this.canvas = canvas.createCanvas();
    this.context = this.canvas.getContext('2d');

    this.context.font = '11px Impact';

    this._state = {};
  }

  _writeText (input) {
    let text = this.context.measureText(input);

    // this.context.rotate(0.1);
    this.context.fillText(input, 50, 100);
  }

  async _draw () {
    console.log('PRETENDING TO DRAW...');
    this._writeText('yo dawg');
    console.log('<img src="' + this.canvas.toDataURL() + '" />')
  }
}

module.exports = Canvas;
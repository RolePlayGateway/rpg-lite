'use strict';

const canvas = require('canvas');

class Canvas {
  constructor (settings = {}) {
    this.settings = Object.assign({
      dimensions: {
        x: 256,
        y: 256,
        x: 256
      }
    }, settings);

    this.canvas = canvas.createCanvas();
    this.context = this.canvas.getContext('2d');

    this._state = {};
  }

  _writeText (text) {
    this.context.font = '30px Impact';
    // this.context.rotate(0.1);
    this.context.fillText(text, 50, 100);
  }

  _draw () {
    this._writeText('yo dawg');
    console.log('<img src="' + this.canvas.toDataURL() + '" />')
  }
}

module.exports = Canvas;
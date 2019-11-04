'use strict';

const canvas = require('canvas');
const Component = require('@fabric/http/types/component');

class Canvas extends Component {
  constructor (settings = {}) {
    super(settings);

    this.settings = Object.assign({
      antialiasing: false,
      dimensions: {
        x: 256,
        y: 256,
        x: 256
      }
    }, settings);

    this.canvas = canvas.createCanvas(this.settings.dimensions.x, this.settings.dimensions.y);
    this.context = this.canvas.getContext('2d');

    this.context.font = '11px "Visitor"';
    this.context.fillStyle = '#000';
    this.context.imageSmoothingEnabled = (this.settings.antialiasing === true);

    this._state = {};
  }

  _drawClock () {
    let context = this.canvas.getContext('2d');
    let text = context.measureText(input);

    this.context.fillStyle = '#fff';
    this.context.fillText(input, 50, 100);
    this.context.fillStyle = '#000';
  }

  _drawLoadingScreen () {
    let width = 120;
    let height = 18;
    let origin = {
      x: (this.settings.dimensions.x / 2),
      y: (this.settings.dimensions.y / 2)
    }

    this.context.fillStyle = '#ccc';
    this.context.fillRect(origin.x - (width / 2), origin.y - (height / 2), width, height);

    // TODO: dynamic loading messages...
    let message = 'Loading...';
    this.context.fillStyle = '#000';
    let text = this.context.measureText(message);
    this.context.fillText(message, origin.x, origin.y);
  }

  _writeText (input) {
    let context = this.canvas.getContext('2d');
    let text = context.measureText(input);

    // this.context.rotate(0.1);
    this.context.fillStyle = '#fff';
    this.context.fillText(input, 50, 100);
    this.context.fillStyle = '#000';
  }

  _appendTo (element) {
    element.appendChild(this.canvas);
  }

  async _draw () {
    this._drawLoadingScreen();
    this._writeText('yo dawg');
    console.log('<img src="' + this.canvas.toDataURL() + '" />')
  }
}

module.exports = Canvas;
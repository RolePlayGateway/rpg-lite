'use strict';

const Collection = require('@fabric/core/types/collection');
const Remote = require('@fabric/core/types/remote');
const Service = require('@fabric/core/types/service');

class RPG extends Service {
  constructor (settings = {}) {
    super(settings);

    this.settings = Object.assign({
      authority: 'localhost:9999'
    }, settings);

    // Internals
    this.remote = new Remote(this.settings);

    // Collections
    this.universes = new Collection();

    this._state = {
      universes: []
    };
  }

  get handles () {
    return [
      `universes`
    ];
  }

  async start () {
    console.log('[RPG:LITE]', 'Starting...');
    this.status = 'starting';

    await this._sync();

    this.status = 'started';
    console.log('[RPG:LITE]', 'Started!');
  }

  async _sync () {
    console.log('[RPG:LITE]', 'Syncing...');
    this.status = 'starting';

    let exchange = this;

    console.log('[RPG:LITE]', 'Remote used:', this.remote);

    // TODO: use async map
    /* let result = await Promise.all(this.handles.map(x => {
      return exchange.remote._GET(`/${x}`);
    })); */

    for (let i = 0; i < this.handles.length; i++) {
      let handle = this.handles[i];
      let response = await this.remote._GET(`/${handle}`);
      console.log('response for handle', handle, 'was:', response);
    }

    this.status = 'started';
    console.log('[RPG:LITE]', 'Synced!');
  }
}

module.exports = RPG;
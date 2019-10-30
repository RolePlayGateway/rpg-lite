'use strict';

const Collection = require('@fabric/core/types/collection');
const Remote = require('@fabric/core/types/remote');
const Service = require('@fabric/core/types/service');

class RPG extends Service {
  constructor (settings = {}) {
    super(settings);

    this.settings = Object.assign({
      authority: 'localhost:9999'
    });

    // Internals
    this.remote = new Remote();

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

    let data = await this.remote._GET('/universes');
    console.log('[RPG:LITE]', 'got data:', data);
    
    this.status = 'started';
    console.log('[RPG:LITE]', 'Synced!');
  }
}

module.exports = RPG;
'use strict';

// ### Types
// Types are mostly imported from `@fabric/core` — an SDK for
// building distributed applications.  We'll cover this in more
// detail later, but there's [an entire site dedicated to docs][docs]
// if you're interested in learning more now.
const Collection = require('@fabric/core/types/collection');
const Entity = require('@fabric/core/types/entity');
const Remote = require('@fabric/core/types/remote');
const Service = require('@fabric/core/types/service');

const Queue = require('./queue');

/**
 * The core {@link RPG} class provides all functions necessary
 * for interacting with the game world, as powered by {@link Verse}.
 */
class RPG extends Service {
  /**
   * Instantiate an instance of {@link RPG} using `new RPG(settings)`, where
   * `settings` is an `Object` containing various optional settings.
   * @param {Object} [settings]
   * @param {String} [settings.authority=localhost:9999] Host and port combination reflecting intended authority. 
   */
  constructor (settings = {}) {
    super(settings);

    this.settings = Object.assign({
      authority: 'localhost:9999'
    }, settings);

    // Internals
    this.cache = [];
    this.queue = new Queue();
    this.remote = new Remote(this.settings);

    // Collections
    this.universes = new Collection();

    // Typecasting
    this.queue.use(RPG);
    this.queue.use(Collection);

    // Flags
    this.status = 'waiting';

    // State
    this._state = {};
  }

  /**
   * Provides a simple list of named {@link Collection} types to manage.
   */
  get handles () {
    // TODO: document public APIs for api.roleplaygateway.com
    return [
      `universes`,
      `authors`,
      `characters`
    ];
  }

  /**
   * Provides an {@link Entity} representing the current game state.
   * @property {String} id Hex-encoded unique identifier for the game state.
   */
  get state () {
    let state = {
      status: this.status,
      queue: this.queue
    };

    for (let i = 0; this.handles.length; i++) {
      state[this.handles[i]] = this._state[this.handles[i]];
    }

    return new Entity(state);
  }

  set state (obj) {
    if (!this.cache) this.cache = [];
    /* this.cache.push({
      '@method': 'SET',
      '@params': [`/state`, obj]
    }); */
    return this;
  }

  log (...msg) {
    console.log.apply(null, [ `@[${Date.now()}]` ].concat(msg));
  }

  /**
   * Call `start()` to begin processing the game state, including
   * the clock beginning to advance for the in-game world.
   */
  async start () {
    console.log('[RPG:LITE]', '[ENGINE]', 'Starting...');
    this.status = 'starting';

    await this._sync();

    this.status = 'started';
    console.log('[RPG:LITE]', '[ENGINE]', 'Started!');
  }

  /**
   * Load information from the configured {@link Authority}.
   */
  async _sync () {
    this.log('[RPG:LITE]', '[ENGINE]', 'Syncing...');
    this.status = 'syncing';

    this.queue._addWork({
      method: `_syncLoad`
    });

    this.status = 'synced';
    this.log('[RPG:LITE]', '[ENGINE]', 'Synced!');
  }

  async _syncLoad () {
    let exchange = this;

    console.log('[RPG:LITE]', '[ENGINE]', 'Remote used:', this.remote);

    // TODO: use async map
    /* let result = await Promise.all(this.handles.map(x => {
      return exchange.remote._GET(`/${x}`);
    })); */

    for (let i = 0; i < this.handles.length; i++) {
      let handle = this.handles[i];

      try {
        let response = await this.remote._GET(`/${handle}`);
      } catch (E) {
        console.error('[RPG:LITE]', '[ENGINE]', 'Could not sync:', E);
      }

      // TODO: handle errors!
      this._state[handle] = response;
    }
  }
}

module.exports = RPG;

// fabric: https://github.com/FabricLabs/fabric
// docs: https://dev.fabric.pub
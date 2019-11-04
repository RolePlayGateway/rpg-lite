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

// #### Internal Types
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
      authority: 'localhost:9999',
      sync: false
    }, settings);

    // Internals
    this.cache = [];
    this.queue = new Queue();
    this.remote = new Remote(this.settings);

    // Collections
    this.universes = new Collection();
    this.messages = new Collection();

    // Typecasting
    this.queue.use(RPG);
    this.queue.use(Collection);

    // Flags
    this.status = 'waiting';

    // State
    this._state = {
      clocks: {
        last: Date.now()
      }
    };
  }

  log (...msg) {
    let params = [ `@[${Date.now()}]` ].concat(msg);
    let entity = this.messages.create({
      '@type': 'Event',
      '@data': { params }
    });

    // TODO: document & upstream
    console.log.apply(null, params);
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

  async _connectSwarm () {
    // TODO: implement
  }

  /**
   * Call `start()` to begin processing the game state, including
   * the clock beginning to advance for the in-game world.
   */
  async start () {
    console.log('[RPG:LITE]', '[ENGINE]', 'Starting...');
    this.status = 'starting';

    // run dependencies
    if (this.settings.sync) await this._sync();
    if (this.settings.fabric) await this._connectSwarm();

    this.status = 'started';
    console.log('[RPG:LITE]', '[ENGINE]', 'Started!');
  }

  /**
   * Load information from the configured {@link Authority}.
   */
  async _sync () {
    this.log('[RPG:LITE]', '[ENGINE]', 'Syncing...');
    this.status = 'syncing';

    console.log('[RPG:LITE]', '[ENGINE]', 'Remote used:', this.remote);

    for (let i = 0; i < this.handles.length; i++) {
      let handle = this.handles[i];

      try {
        this._state[handle] = await this.remote._GET(`/${handle}`);
      } catch (E) {
        console.error('[RPG:LITE]', '[ENGINE]', 'Could not sync:', E);
      }
    }

    this.status = 'synced';
    this.log('[RPG:LITE]', '[ENGINE]', 'Synced!');
  }
}

module.exports = RPG;

// fabric: https://github.com/FabricLabs/fabric
// docs: https://dev.fabric.pub
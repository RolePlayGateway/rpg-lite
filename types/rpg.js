'use strict';

// ### Types
// Types are mostly imported from `@fabric/core` — an SDK for
// building distributed applications.  We'll cover this in more
// detail later, but there's [an entire site dedicated to docs][docs]
// if you're interested in learning more now.
const Collection = require('@fabric/core/types/collection');
const Entity = require('@fabric/core/types/entity');
const Key = require('@fabric/core/types/key');
const Remote = require('@fabric/core/types/remote');
const Service = require('@fabric/core/types/service');

// #### `@fabric/rpg
// As a core dependency, `@fabric/rpg` provides many useful types
// for downstream designers.
const Verse = require('@fabric/rpg');

// HTTP
const Swarm = require('@fabric/http/types/swarm');

// #### Internal Types
const Queue = require('./queue');
const Character = require('./character');
const Player = require('./player');
const Universe = require('./universe');

/**
 * The core {@link RPG} class provides all functions necessary
 * for interacting with the game world, as powered by {@link Verse}.
 * @property {Collection} entities
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
      framerate: 1,
      sync: false
    }, settings);

    // Internals
    this.cache = [];
    this.timer = null;
    this.queue = new Queue();
    this.remote = new Remote(this.settings);
    this.swarm = new Swarm(this.settings.swarm);

    // Collections
    this.characters = new Collection({
      type: Character
    });

    this.players = new Collection({
      type: Player
    });

    this.universes = new Collection({
      type: Universe
    });

    // internal collections
    this.entities = new Collection();
    this.messages = new Collection();

    // Assign Job Types
    this.queue.use(this.boot);
    this.queue.use(this.tick);

    // Flags
    this.status = 'waiting';

    // State
    this._state = {
      clocks: {
        last: Date.now()
      }
    };
  }

  /**
   * Provides a simple list of named {@link Collection} types to manage.
   */
  get handles () {
    // TODO: document public APIs for api.roleplaygateway.com
    return [
      `universes`,
      `authors`,
      `characters`,
      `snippets`
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

  async _registerPlayer (player) {
    let actor = await this.players.create(player);
  }

  /**
   * Call `start()` to begin processing the game state, including
   * the clock beginning to advance for the in-game world.
   */
  async start () {
    // console.log('[RPG:LITE]', '[ENGINE]', 'Starting...');
    this.status = 'starting';

    let exchange = this;

    // run dependencies
    if (this.settings.sync) await this._sync();
    if (this.settings.fabric) await this._connectSwarm();

    this.queue.on('job', function (work) {
      console.log('incoming:', work);
    });

    this.queue.on('work', function (work) {
      console.log('prod:', work);
    });

    this.queue._addWork({
      method: 'boot'
    });

    await this.queue._setState(this._state);
    await this.queue.start();
    await this.swarm.start();

    this.timer = setInterval(function () {
      exchange.queue._addWork({
        method: 'tick'
      });
    }, this.settings.framerate * 1000);

    this.status = 'started';
    // console.log('[RPG:LITE]', '[ENGINE]', 'Started!');
  }

  async stop () {
    if (this.timer) clearInterval(this.timer);
    await this.swarm.stop();
    await this.queue.stop();
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

  async _write () {
    for (let i = 0; i < this.handles.length; i++) {
      let handle = this.handles[i];
    }
  }


  boot () {
    console.log('[RPG:LITE]', '[BOOT]', 'Booting...');
    this.status = 'booting';
    let seed = new Key();
    this._state.seed = seed.toObject();
    this.status = 'booted';
    return this._state;
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

  tick () {
    let now = Date.now();
    let dt = (now - this._state.clocks.last) / 1000.0;

    // this._advanceClockSeconds(dt);
    // this.render();

    this._state.clocks.last = now;
    // this._requestAnimationFrame();
  }

  _advanceClockSeconds (dt) {
    // update game state and entities here...
    console.log('Advancing clock seconds... delta:', dt);
  }

  _requestAnimationFrame () {
    console.log('Requesting animation frame...');
    requestAnimFrame(this.tick.bind(this));
  }
}

module.exports = RPG;

// fabric: https://github.com/FabricLabs/fabric
// docs: https://dev.fabric.pub
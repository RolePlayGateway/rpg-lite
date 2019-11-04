'use strict';

const EncryptedPromise = require('@fabric/core/types/promise');
const Entity = require('@fabric/core/types/entity');
const Service = require('@fabric/core/types/service');

/**
 * Manage a list of jobs.
 */
class Queue extends Service {
  /**
   * Create an instance of a {@link Queue}.
   * @param {Object} settings 
   * @param {Boolean} settings.debug
   */
  constructor (settings = {}) {
    super(settings);

    this.settings = Object.assign({
      debug: false,
      limits: {
        rate: 60 // limit to 60 frames per second
      }
    }, settings);

    this.stack = [];

    this._entities = {};
    this._methods = {};
    this._promises = {};
    this._state = {
      clock: 0
    };
    
    this.use(this.tick);
    this.status = 'ready';
  }

  tick () {
    if (!this._state) this._state = { clock: 0 };
    this._state.clock++;
    return new Entity({
      '@type': 'State',
      '@data': this._state
    });
  }

  /**
   * Add a {@link Job} to the {@link Queue} for processing.
   * @param {Job} job 
   * @param {String} job.method 
   * @param {Array} job.params 
   */
  async _addWork (job) {
    let promise = new EncryptedPromise();
    let state = {
      start: Date.now(),
      job: job
    };

    try {
      await promise._assignState(state);
      // console.log('[RPG:QUEUE]', '_addWork', 'assigned promise:', promise);
      // console.log('[RPG:QUEUE]', '_addWork', 'assigned promise state:', promise.state);
      let work = {
        '@method': job.method || 'call',
        '@params': job.params || []
      };

      this._promises[promise.id] = promise;
      this.stack.push(work);

      this.emit('promise', promise);
      this.emit('job', work);
    } catch (E) {
      console.error('[RPG:LITE]', '[QUEUE]', 'Could not add work:', job, E);
    }

    return promise;
  }

  async _getWork () {
    if (!this.stack.length) return null;
    // await this.tick();
    return this.stack.pop();
  }

  async _processWork (job) {
    if (this.settings.debug) console.log('[RPG:QUEUE]', 'Worker processing incoming job:', job);
    if (!job.params) job.params = [];
    let entity = new Entity(job);
    let result = await this.route(job);
    this._entities[entity.id] = entity;
    this.emit('work', { result });
    return result;
  }

  async _setState (state) {
    this._state = state;
  }

  async route (msg) {
    let result = null;

    if (!msg['@method']) throw new Error('Message property "@method" is required.');

    switch (msg['@method']) {
      default:
        if (this._methods[msg['@method']]) {
          result = this._methods[msg['@method']].call({
            _state: this._state
          }, ...msg['@params']);
        }
        break;
    }

    return result;
  }

  async use (method) {
    // console.log('assigning method:', method.name, method);
    let entity = new Entity(JSON.stringify(method));
    this._methods[method.name] = method;
    this._entities[entity.id] = entity;
  }

  async start () {
    this.status = 'starting';
    this.worker = this.on('job', this._processWork.bind(this));
    this.status = 'started';
  }
}

module.exports = Queue;
'use strict';

const EncryptedPromise = require('@fabric/core/types/promise');
const Entity = require('@fabric/core/types/entity');

class Queue {
  constructor (settings = {}) {
    this.settings = Object.assign({
      limits: {
        rate: 60 // limit to 60 frames per second
      }
    }, settings);

    this.stack = [];

    this._methods = {};
    this._state = {
      clock: 0,
      clocks: {
        last: Date.now()
      }
    };
    
    this.use(this.tick);
    this.status = 'ready';
  }

  async tick () {
    if (!this._state) this._state = { clock: 0 };
    this._state.clock++;
    let now = Date.now();
    let delta = now - (this._state.clocks.last || 1);
    let frames = Math.floor(delta / 60);
    this._state.clocks.last = now;
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
      console.log('[RPG:QUEUE]', '_addWork', 'assigned promise:', promise);
      console.log('[RPG:QUEUE]', '_addWork', 'assigned promise state:', promise.state);
      this.stack.push({
        '@method': job.method || 'call',
        '@params': job.params || []
      });
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

  async _setState (state) {
    this._state = state;
  }

  async route (msg) {
    switch (msg['@method']) {
      default:
        console.log('DYNAMIC WORK TYPE:', msg['@method']);
        console.log('DYNAMIC WORK TYPE, methods known:', Object.keys(this._methods));
        if (this._methods[msg['@method']]) {
          console.log('method exists:', this._methods[msg['@method']]);
          console.log('state used:', this._state);
          let product = this._methods[msg['@method']].call({
            _state: this._state
          }, msg['@params']);
          console.log('product:', product);
        }
        break;
    }
  }

  async use (method) {
    console.log('assigning method:', method.name, method);
    this._methods[method.name] = method;
  }

  async work () {
    let job = await this._getWork();
    if (!job) {
      await this._addWork({
        method: 'tick',
        params: [],
        state: this._state
      });
      return this.work();
    }

    console.log('got work:', job);
    let result = await this.route(job);
    return result;
  }

  async start () {
    this.status = 'starting';
    this.worker = this.work();
    this.status = 'started';
  }
}

module.exports = Queue;
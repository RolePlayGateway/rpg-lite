'use strict';

const EncryptedPromise = require('@fabric/core/types/promise');
const Entity = require('@fabric/core/types/entity');

class Queue {
  constructor (settings = {}) {
    this.settings = Object.assign({}, settings);
    this._methods = {};
    this._state = {
      clock: 0,
      stack: []
    };
    this.use(this.tick);
    this.status = 'ready';
  }

  async tick () {
    if (!this._state) this._state = { clock: 0 };
    this._state.clock++;
    this._state.time = Date.now();
    return new Entity({
      '@type': 'State',
      '@data': this._state
    });
  }

  async _addWork (job) {
    let promise = new EncryptedPromise();
    let state = {
      start: Date.now(),
      job: job
    };

    try {
      await promise._assignState(state);
      console.log('assigned promise:', promise);
      console.log('assigned promise state:', promise.state);
      this._state.stack.push({
        '@method': job.method || 'call',
        '@params': job.params || []
      });
    } catch (E) {
      console.error('[RPG:LITE]', '[QUEUE]', 'Could not add work:', job, E);
    }

    return promise;
  }

  async _getWork () {
    if (!this._state.stack.length) return null;
    return this._state.stack.pop();
  }

  async route (msg) {
    switch (msg['@method']) {
      default:
        console.log('DYNAMIC WORK TYPE:', msg['@method']);
        console.log('DYNAMIC WORK TYPE, methods known:', Object.keys(this._methods));
        if (this._methods[msg['@method']]) {
          console.log('method exists:', this._methods[msg['@method']]);
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
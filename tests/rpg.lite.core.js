'use strict';

require('jsdom-global')();
// require('debug-trace')({ always: true });

const assert = require('assert');
const RPG = require('../');
const Canvas = require('../types/canvas');
const Queue = require('../types/queue');

describe('RPG Lite', function () {
  describe('RPG', function () {
    it('should expose a constructor', function () {
      assert.equal(RPG instanceof Function, true);
    });

    it('can call start()', async function () {
      let rpg = new RPG();

      try {
        await rpg.start();
        await rpg.stop();
      } catch (E) {
        assert.fail(E);
      }

      assert.ok(rpg);
      assert.equal(rpg.status, 'started');
    });
  });

  describe('Canvas', function () {
    it('should expose a constructor', function () {
      assert.equal(Queue instanceof Function, true);
    });
  });

  describe('Queue', function () {
    it('should expose a constructor', function () {
      assert.equal(Queue instanceof Function, true);
    });

    it('can process basic work', function (done) {
      async function test () {
        let queue = new Queue();
        let target = 'Hello, game world!';
  
        await queue.use(function exampleJob () {
          return target;
        });

        queue.on('work', async function (work) {
          assert.equal(work.result, target);

          // cleanup
          await queue.stop();
          assert.equal(queue.status, 'stopped');
  
          // signal done
          done();
        });
  
        try {
          await queue.start();
          await queue._addWork({ method: 'exampleJob' });
          assert.equal(queue.status, 'started');
        } catch (E) {
          assert.fail(E);
        }
      }

      test().catch(assert.fail);
    });

    it('can process work with parameters', function (done) {
      async function test () {
        let queue = new Queue();
        let target = 2;
  
        await queue.use(function addOne (num = 0) {
          return parseInt(num) + 1;
        });

        queue.on('work', async function (work) {
          assert.equal(work.result, target);

          // cleanup
          await queue.stop();
          assert.equal(queue.status, 'stopped');
  
          // signal done
          done();
        });
  
        try {
          await queue.start();
          await queue._addWork({
            method: 'addOne',
            params: [ 1 ]
          });
          assert.equal(queue.status, 'started');
        } catch (E) {
          assert.fail(E);
        }
      }

      test().catch(assert.fail);
    });

    it('can process work with multiple parameters', function (done) {
      async function test () {
        let queue = new Queue();
        let target = Math.pow(2, 21);
  
        await queue.use(function nthpower (i = 0, n = 1) {
          return Math.pow(parseInt(i), parseInt(n));
        });

        queue.on('work', async function (work) {
          assert.equal(work.result, target);

          // cleanup
          await queue.stop();
          assert.equal(queue.status, 'stopped');
  
          // signal done
          done();
        });
  
        try {
          await queue.start();
          await queue._addWork({
            method: 'nthpower',
            params: [ 2, 21 ]
          });
          assert.equal(queue.status, 'started');
        } catch (E) {
          assert.fail(E);
        }
      }

      test().catch(assert.fail);
    });
  });
});
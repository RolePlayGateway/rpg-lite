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
  });
});
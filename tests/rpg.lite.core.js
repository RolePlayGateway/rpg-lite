'use strict';

const assert = require('assert');
const RPG = require('../');
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
      } catch (E) {
        assert.fail(E);
      }

      assert.ok(rpg);
      assert.equal(rpg.status, 'started');
    });
  });

  describe('Queue', function () {
    it('should expose a constructor', function () {
      assert.equal(Queue instanceof Function, true);
    });

    it('can process basic work', async function () {
      let queue = new Queue();

      try {
        await queue.use(function exampleJob () {
          return `Hello, world!`;
        });
        await queue.start();
      } catch (E) {
        assert.fail(E);
      }

      console.log('queue:', queue);
      console.log('queue state:', queue.state);
      console.log('queue queue:', queue.queue);

      assert.ok(queue);
      assert.equal(queue.status, 'started');
    });
  });
});
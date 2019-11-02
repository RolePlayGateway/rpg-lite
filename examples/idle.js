'use strict';

const RPG = require('../');

async function main () {
  let rpg = new RPG();

  rpg.subscribe(`/`, async function (msg) {
    console.log('[RPG:EXAMPLES]', 'IdleRPG received core message:', msg);
  });

  await rpg.start();
}

main();
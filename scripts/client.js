'use strict';

const RPG = require('../');
const settings = require('../settings/default');

async function main () {
  window.rpg = new RPG(settings);

  await rpg.start();
  console.log('[RPG:LITE]', '[CLIENT]', 'Booted!  Now waiting for player input...');
}

main();
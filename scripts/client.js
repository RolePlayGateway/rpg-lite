'use strict';

const RPG = require('../');
const Client = require('../components/client');
const settings = require('../settings/default');

async function main () {
  let element = document.querySelector('rpg-lite-client');

  window.rpg = new Client(settings);
  window.rpg.subscribe('/', _handleRootMessage.bind(this));

  if (element) {
    window.rpg._bind(element);
  }

  await rpg.start();
  console.log('[RPG:LITE]', '[CLIENT]', 'Booted!  Now waiting for player input...');
}

async function _handleRootMessage (msg) {
  // TODO: use Fabric.Router
  console.warn('[RPG:LITE]', '[CLIENT]', 'Handling root message:', msg);
}

main();
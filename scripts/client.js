'use strict';

const RPG = require('../');
const Client = require('../components/client');
const settings = require('../settings/default');

async function main () {
  let element = document.querySelector('rpg-lite-client');

  window.client = new Client(settings);
  window.client.register();
  window.client.subscribe('/', _handleRootMessage.bind(this));

  if (element) {
    window.client._bind(element);
  }

  await window.client.start();
  console.log('[RPG:LITE]', '[CLIENT]', 'Client started!  Now waiting for player input...');
}

async function _handleRootMessage (msg) {
  // TODO: use Fabric.Router
  console.warn('[RPG:LITE]', '[CLIENT]', 'Handling root message:', msg);
}

main();
'use strict';

const RPGLite = require('../types/rpg');
const config = {
  authority: 'api.roleplaygateway.com:9999'
};

async function main () {
  let rpg = new RPGLite(config);
  console.log('[RPG:LITE]', 'Script<Server>', 'Starting...');
  await rpg.start();
  console.log('[RPG:LITE]', 'Script<Server>', 'Started...');
 
}

main();
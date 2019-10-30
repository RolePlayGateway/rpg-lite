'use strict';

const RPGLite = require('../types/rpg');
const config = {
  authority: 'api.roleplaygateway.com:9999'
};

async function main () {
  let rpg = new RPGLite(config);
  await rpg.start();
}

main();
'use strict';

const RPG = require('../types/rpg');

async function main () {
  const rpg = new RPG({
    authority: 'api.roleplaygateway.com:443'
  });

  await rpg.start();

  console.log('NODE STARTED! Data:', rpg);
  console.log('NODE STARTED! State:', rpg.state);
}

main();

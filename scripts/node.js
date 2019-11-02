'use strict';

const RPG = require('../types/rpg');
// const Swarm = require('@fabric/core/types/swarm');

async function main () {
  let rpg = new RPG({
    authority: 'api.roleplaygateway.com:443'
  });
  // let swarm = new Swarm();

  await rpg.start();
  // await swarm.start();

  console.log('NODE STARTED! Data:', rpg);
  console.log('NODE STARTED! State:', rpg.state);
}

main();
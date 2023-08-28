const friendsData = require('../seed-data/friends');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  await knex('friend').del();
  await knex('friend').insert(friendsData);
};

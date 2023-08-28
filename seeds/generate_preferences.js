const prefsData = require('../seed-data/preferences');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  await knex('preference').del();
  await knex('preference').insert(prefsData);
};

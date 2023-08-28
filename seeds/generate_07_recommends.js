const recsData = require('../seed-data/recommends');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  await knex('recommend').del();
  await knex('recommend').insert(recsData);
};

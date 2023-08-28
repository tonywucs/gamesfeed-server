const usersData = require('../seed-data/users');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  await knex('user').del();
  await knex('user').insert(usersData);
};

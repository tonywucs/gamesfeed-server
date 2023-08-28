const userPrefsData = require('../seed-data/user_preferences');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('user_preference').del();
  await knex('user_preference').insert(userPrefsData);
};

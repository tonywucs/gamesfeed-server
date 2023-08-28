const newsarticlePrefsData = require('../seed-data/newsarticle_preferences');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  await knex('newsarticle_preference').del();
  await knex('newsarticle_preference').insert(newsarticlePrefsData);
};

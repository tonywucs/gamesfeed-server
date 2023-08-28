const newsArticles  = require('../seed-data/newsarticles')

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('table_name').del()
  const pokemonNews = await newsArticles.getNewsData('pokemon', 20)
  const zeldaNews = await newsArticles.getNewsData('pokemon', 20)
  const marioNews = await newsArticles.getNewsData('pokemon', 20)
  
  await knex('table_name').insert([
    {id: 1, colName: 'rowValue1'},
    {id: 2, colName: 'rowValue2'},
    {id: 3, colName: 'rowValue3'}
  ]);
};

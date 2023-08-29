const newsArticles  = require('../seed-data/newsarticles')

const processNews = (news) => {
  const filteredNews = news.articles
    .filter((article) => {
      return article.urlToImage
    })
    .map((article) => {
      return {
        source: article.source.name,
        author: article.author ? article.author : article.source.name,
        title: article.title,
        description: article.description ? article.description : article.content.split('.')[0],
        url: article.url,
        url_to_image: article.urlToImage,
        published_at: article.publishedAt
      }
    });

  return filteredNews;
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('newsarticle').del();

  let records = []
  let articleNum = []
  const preferenceOptions = await knex('preference').select("*")
  const pokemonNews = await newsArticles.getNewsData(preferenceOptions[0].name.toLowerCase(), 20);
  const zeldaNews = await newsArticles.getNewsData(preferenceOptions[1].name.toLowerCase(), 20)
  const marioNews = await newsArticles.getNewsData(preferenceOptions[2].name.toLowerCase(), 20)
  
  await knex('newsarticle').insert(processNews(pokemonNews));

  records = await knex('newsarticle').select("id")
  await Promise.all(records.map(async (record) => {
    await knex('newsarticle_preference').insert([
      { newsarticle_id: record.id, preference_id: preferenceOptions[0].id }
    ]);
  }))

  await knex('newsarticle').insert(processNews(zeldaNews));
    
  articleNum = await knex('newsarticle_preference').select("id")
  records = await knex('newsarticle').select("id").where('id', '>', `${articleNum.length}`)
  await Promise.all(records.map(async (record) => {
    await knex('newsarticle_preference').insert([
      { newsarticle_id: record.id, preference_id: preferenceOptions[1].id }
    ]);
  }))

  await knex('newsarticle').insert(processNews(marioNews));

  articleNum = await knex('newsarticle_preference').select("id")
  records = await knex('newsarticle').select("id").where('id', '>', `${articleNum.length}`)
  await Promise.all(records.map(async (record) => {
    await knex('newsarticle_preference').insert(
      { newsarticle_id: record.id, preference_id: preferenceOptions[2].id }
    );
  }))
};

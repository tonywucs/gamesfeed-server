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
        description: article.description,
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
  const pokemonNews = await newsArticles.getNewsData('pokemon', 20);
  // const zeldaNews = await newsArticles.getNewsData('zelda', 20)
  // const marioNews = await newsArticles.getNewsData('mario', 20)
  
  await knex('newsarticle').insert(processNews(pokemonNews));
  // await knex('newsarticle').insert(processNews(zeldaNews));
  // await knex('newsarticle').insert(processNews(marioNews));
};

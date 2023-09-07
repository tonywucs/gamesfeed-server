const knex = require('knex')(require('../knexfile'));
const newsArticles = require('../seed-data/newsarticles');
const fs = require('fs');

const processNews = (news) => {
  const numOfChars = 200;
  const cpm = 1000; // average human reads 200 wpm, with an average word length of 5 characters
  let readingTime = 0;

  const filteredNews = news.articles
    .filter((article) => {
      return article.urlToImage && (article.content.split('[+').length === 2)
    })
    .map((article) => {
      if (article.content) {
        const content = article.content.split('[+');
        const contentBriefCount = content[0].split('').length;
        const contentCharCount = Number(content[1].split(' ')[0]);
        readingTime = Math.floor((contentBriefCount + contentCharCount) / cpm);
      }

      return {
        source: article.source.name,
        author: article.author ? article.author : article.source.name,
        title: article.title,
        description: article.description ? article.description : article.content.substring(0, numOfChars),
        read_time: readingTime || -1,
        url: article.url,
        url_to_image: article.urlToImage,
        published_at: article.publishedAt
      }
    });

  return filteredNews;
}

const populateNewsPreferences = async (preference, pageSize, sortBy) => {
  try {
    const news = await newsArticles.getNewsData(`${preference.name.toLowerCase()} ${preference.company.toLowerCase()}`, pageSize, sortBy);
    const count = await knex('newsarticle').count("* as total_count")
    await knex('newsarticle').insert(processNews(news))
    const newsArticleList = await knex('newsarticle').select("id").offset(count[0].total_count || 0)

    for (const article of newsArticleList) {
      await knex('newsarticle_preference').insert([
        { newsarticle_id: article.id, preference_id: preference.id }])
    }

  } catch (err) {
    console.log(err)
  }
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function (knex) {
  await knex('newsarticle').del();

  // const pageSize = 50;
  // const sortBy = 'relevancy';
  // const preferenceOptions = await knex('preference').select("*");

  // for (const pref of preferenceOptions) {
  //   await populateNewsPreferences(pref, pageSize, sortBy)
  // }

  const newsArticlesPath = './newsarticles.json';
  const newsPrefsPath = './newsarticles_prefs.json';
  // const newsArticlesData = await knex('newsarticle')
  // .select('title', 'author', 'source', 'description', 'read_time', 'url', 'url_to_image', 'published_at')
  // fs.writeFileSync(newsArticlesPath, JSON.stringify(newsArticlesData))
  // const newsPrefsData = await knex('newsarticle_preference')
  // .select('newsarticle_id', 'preference_id')
  // fs.writeFileSync(newsPrefsPath, JSON.stringify(newsPrefsData))

  const newsArticlesData = JSON.parse(fs.readFileSync(newsArticlesPath));
  await knex('newsarticle').insert(newsArticlesData);
  const newsPrefsData = JSON.parse(fs.readFileSync(newsPrefsPath));
  await knex('newsarticle_preference').insert(newsPrefsData);

};

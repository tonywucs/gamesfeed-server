const knex = require('knex')(require('../knexfile'));

exports.getNews = async (req, res) => {
  const userId = req.jwtDecoded.id;
  const { num_of_articles, preferences, sort_by, sort_type, page_number } = req.headers;
  const numOfResults = {};

  try {
    // Join news_pref and user_pref tables to get a list of news_id's and their associated user_id.
    // Then join the user_pref with preference tables to set each record with a name.
    // Then join news_pref with newsarticle tables to obtain the associated news article information.
    //
    // Two where conditions set in place to filter by user_id and preferences required by the user.
    // Sort by user choice, by default, news article publish date ordered by most recent
    // Pagination is available as well with limit() and offset() methods
    const newsArticles = await knex('newsarticle_preference')
      .join('user_preference', 'newsarticle_preference.preference_id', '=', 'user_preference.preference_id')
      .join('preference', 'preference.id', '=', 'user_preference.preference_id')
      .join('newsarticle', 'newsarticle.id', '=', 'newsarticle_id')
      .select('preference.id as pref_id', 'name as preference', 'title', 'author', 'source', 'description', 'url', 'url_to_image', 'published_at')
      .whereIn("user_id", [userId])
      .whereIn("name", preferences.split(" "))
      .orderBy(sort_by || 'published_at', sort_type || 'desc')
      .limit(num_of_articles || 10)
      .offset(page_number * num_of_articles || 0);

    newsArticles.forEach((article) => {
      if (!numOfResults[`${article.preference}`]) {
        numOfResults[`${article.preference}`] = 1
      } else {
        numOfResults[`${article.preference}`] += 1
      }
    });

    res
      .status(200)
      .json({
        total_results: Object.values(numOfResults).reduce((acc, curr) => acc + curr),
        results: numOfResults,
        articles: newsArticles
      });

  } catch (err) {
    res
      .status(400)
      .json({
        success: false,
        message: 'No news found'
      });
  }
}

exports.getRecommendNews = async (req, res) => {
  const userId = req.jwtDecoded.id;

  try {
    // Determine the existence of friends and select their ids
    const friends = await knex('friend')
      .join('user', 'user2_id', '=', 'user.id')
      .select('user.id', 'username')
      .where({ user1_id: userId })

    if (friends.length === 0) {
      return res
        .status(400)
        .json({
          success: false,
          message: 'No friends were found'
        })
    }

    // Find all recommended newsarticle ids for each friend
    const recommendedList = await Promise.all(friends.map(async (friend) => {
      const recommended = await knex('recommend')
        .select('newsarticle_id')
        .where({ user_id: friend.id })

      return {
        username: friend.username,
        articles: recommended,
      }
    }))

    // Find all newsarticles from the recommended list
    const newsArticles = await Promise.all(recommendedList.map(async (friend) => {
      const newsArticlesList = friend.articles.map((article) => {
        return article.newsarticle_id
      })

      const recommendedNewsArticles = await knex('newsarticle')
        .whereIn('id', newsArticlesList)

      return {
        username: friend.username,
        articles: recommendedNewsArticles
      }
    }))

    res
      .status(200)
      .json({
        recommended_articles: newsArticles
      })

  } catch (err) {
    res
      .status(400)
      .json({
        success: false,
        message: 'No friend recommendations found'
      })
  }
}

exports.getUnauthenticatedNews = async (req, res) => {
  const { num_of_articles } = req.body

  try {
    const newsArticles = await knex('newsarticle')
      .select("*")
      .orderBy('published_at', 'desc')
      .limit(num_of_articles || 10)

    res
      .status(200)
      .json({
        articles: newsArticles
      })

  } catch (err) {
    console.log(err)
    res
      .status(400)
      .json({
        success: false,
        message: 'No new articles found'
      })
  }
}
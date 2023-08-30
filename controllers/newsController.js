const knex = require('knex')(require('../knexfile'));

// Gets news associated with a user.
// Take in num_of_articles int and preference string
// to select a number of articles
exports.getNews = async (req, res) => {
  const userId = req.jwtDecoded.id;
  const { num_of_articles, preference } = req.headers;

  try {
    // Determine existence of a preference and select its id
    const prefId = preference ?
      (
        await knex('preference')
          .select('id')
          .where({ name: preference })
      )
      :
      ([null])

    if (prefId.length === 0) {
      return res
        .status(400)
        .json({
          success: false,
          message: "No preference was found"
        });
    }

    const userPrefs = await knex("user_preference")
      .join("preference", "preference_id", "=", "preference.id")
      .select("preference.id", "name")
      .where({ user_id: userId })

    const newsArticleList = preference ?
      (
        {
          preferece: preference,
          articles: await knex('newsarticle_preference')
            .join('user_preference', 'newsarticle_preference.preference_id', '=', 'user_preference.preference_id')
            .select('newsarticle_id')
            .where({ user_id: userId })
            .andWhere('newsarticle_preference.preference_id', prefId[0].id)
            .limit(num_of_articles || 10)
        }
      )
      :
      (
        await Promise.all(userPrefs.map(async (pref) => {
          const newsArticleSet = await knex('newsarticle_preference')
            .join('user_preference', 'newsarticle_preference.preference_id', '=', 'user_preference.preference_id')
            .select('newsarticle_id')
            .where({ user_id: userId })
            .andWhere('newsarticle_preference.preference_id', pref.id)
            .limit(num_of_articles || 10)

          return {
            preference: pref.name,
            articles: newsArticleSet
          }
        }))
      )

    if (preference && (newsArticleList.articles === 0)) {
      return res
        .status(400)
        .json({
          success: false,
          message: "No news articles found with that those preference"
        });
    }

    const newsArticles = preference ?
      (
        await knex('newsarticle')
          .whereIn('id', newsArticleList.articles.map((article) => {
            return article.newsarticle_id
          }))
      )
      :
      (
        await Promise.all(newsArticleList.map(async (pref) => {
          const newsArticleIds = pref.articles.map((article) => {
            return article.newsarticle_id
          })

          const newsArticlesByPref = await knex('newsarticle')
            .whereIn('id', newsArticleIds);

          return {
            preference: pref.preference,
            articles: newsArticlesByPref
          }
        }))
      )

    res.status(200).json({
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
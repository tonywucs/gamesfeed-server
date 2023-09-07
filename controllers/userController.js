const knex = require('knex')(require('../knexfile'));
const jwt = require('jsonwebtoken');

exports.signUp = async (req, res) => {
  const { username, password } = req.body;

  if (!(username && password)) {
    return res
      .status(400)
      .json({
        success: false,
        message: "No Request Body: Sign up failed."
      });
  }

  const exists = await knex('user').where({ username: username });

  if (exists.length > 0) {
    return res
      .status(400)
      .json({
        success: false,
        message: "A user with that username already exists."
      });
  }

  try {

    await knex('user').insert([
      { username: username, password: password, new_user: true }
    ]);

    res
      .status(200)
      .json({
        success: true,
        message: "A user has been successfully created."
      });

  } catch (err) {
    res
      .status(400)
      .json({
        success: false,
        message: "Something went wrong creating a user"
      });
  }
}

exports.login = async (req, res) => {
  const { username, password } = req.body;

  const user = await knex('user')
    .select("*")
    .where({ username: username })

  if (user.length === 0) {
    return res
      .status(403)
      .json({
        success: false,
        message: 'User was not found'
      });
  }

  if (user && user[0].password === password) {

    // use jwt.sign to create a new JWT token. Takes two arguments, the payload and the secret key. We keep out secret key in ".env" file for safety
    const token = jwt.sign({
      id: user[0].id,
      loginTime: Date.now()
    },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({ token });

  } else {
    res.status(403).json({
      success: false,
      message: 'Username/password combination is wrong'
    });
  }
}

exports.setup = async (req, res) => {
  const userId = req.jwtDecoded.id;
  const { new_user } = req.body;

  try {
    await knex('user')
      .where({ id: userId })
      .update({ new_user: (new_user === "true") })

    res
      .status(200)
      .json({
        success: true,
        message: "Changed user status"
      });

  } catch (err) {
    res
      .status(400)
      .json({
        success: false,
        message: "Missing new user flag"
      });
  }
}

exports.getUser = async (req, res) => {
  const userId = req.jwtDecoded.id;

  try {
    const user = await knex('user')
      .where({ id: userId })

    res
      .status(200)
      .json({
        username: user[0].username,
        new_user: user[0].new_user
      });

  } catch (err) {
    res
      .status(400)
      .json({
        success: false,
        message: "No such user exists"
      });
  }
}

exports.delUser = async (req, res) => {
  const userId = req.jwtDecoded.id;

  try {
    const hasDeleted = await knex('user')
      .where({ id: userId })
      .del()

    if (hasDeleted.length === 0) {
      return res
        .status(403)
        .json({
          success: false,
          message: 'No user was found to delete'
        });
    }

    res
      .status(204)
      .send()

  } catch (err) {
    res
      .status(400)
      .json({
        success: false,
        message: 'No user was found'
      });
  }
}

exports.setPref = async (req, res) => {
  const userId = req.jwtDecoded.id;
  const selectedPrefs = req.body.preferences;

  try {
    const userPrefs = await knex("user_preference")
      .join("preference", "preference_id", "=", "preference.id")
      .select("preference_id", "name")
      .where({ user_id: userId })

    const selectedPrefsList = await knex("preference")
      .whereIn('name', selectedPrefs)

    if (userPrefs.length === 0) {
      await knex("user_preference")
        .insert(selectedPrefsList.map((pref) => {
          return {
            user_id: userId,
            preference_id: pref.id
          }
        }));
    }

    const delPrefs = userPrefs
      .filter((pref) => !selectedPrefsList.map((pref) => pref.name).includes(pref.name))

    const addPrefs = selectedPrefsList
      .filter((pref) => !userPrefs.map((pref) => pref.name).includes(pref.name))

    if (delPrefs.length > 0) {
      await knex('user_preference')
        .whereIn('user_id', [userId])
        .whereIn('preference_id', delPrefs.map((pref) => pref.preference_id))
        .del()
    }

    if (addPrefs.length > 0) {
      await knex("user_preference")
        .insert(addPrefs.map((pref) => {
          return {
            user_id: userId,
            preference_id: pref.id
          }
        }));

      const updatedPrefs = await knex("user_preference")
      .join("preference", "preference_id", "=", "preference.id")
      .select("preference_id", "name")
      .where({ user_id: userId })

      return res
        .status(200)
        .json({
          preferences: updatedPrefs.map((pref) => pref.name)
        });
    }

    res
      .status(200)
      .json({ message: "Preferences Unchanged" });

  } catch (err) {
    res
      .status(400)
      .json({
        success: false,
        message: 'User preferences failed to complete'
      });
  }
}

exports.getPref = async (req, res) => {
  const userId = req.jwtDecoded.id;

  try {
    // Find all preferences of the user
    const userPrefs = await knex("user_preference")
      .join("preference", "preference_id", "=", "preference.id")
      .select("preference_id", "name")
      .where({ user_id: userId })

    if (userPrefs.length === 0) {
      return res
        .status(200)
        .json({
          preferences: []
        });
    }

    const prefs = userPrefs.map((userPref) => {
      return {
        id: userPref.preference_id,
        name: userPref.name
      }
    })

    res
      .status(200)
      .json({
        preferences: prefs
      });

  } catch (err) {
    res
      .status(400)
      .json({
        success: false,
        message: 'No user was found with preferences'
      });
  }
}

exports.getAllPref = async (_req, res) => {
  try {
    const preferences = await knex('preference')
      .select("id", "name")

    if (preferences.length === 0) {
      return res
        .status(400)
        .json({
          success: false,
          message: "No preferences found"
        })
    }

    res
      .status(200)
      .json({
        preferences: preferences
      })
  } catch (err) {
    res
      .status(400)
      .json({
        success: false,
        message: "No preferences in the database"
      })
  }
}

exports.setFriends = async (req, res) => {
  const userId = req.jwtDecoded.id;
  const friendUsername = req.body.username;

  try {
    // Determine the existence of a friend
    const friendId = await knex('user')
      .select("id")
      .where({ username: friendUsername })



    if (friendId.length === 0) {
      return res
        .status(400)
        .json({
          success: false,
          message: 'No user was found'
        });
    }

    if (friendId[0].id === userId) {
      return res
        .status(400)
        .json({
          success: false,
          message: 'No user was added'
        });
    }

    // Determine the if the user already has this friend
    const hasFriend = await knex('friend')
      .where({ user1_id: userId })
      .andWhere({ user2_id: friendId[0].id })

    if (hasFriend.length === 0) {
      await knex('friend')
        .insert({
          user1_id: userId,
          user2_id: friendId[0].id
        })

      return res
        .status(200)
        .json({
          success: true,
          message: 'Friend was added'
        });
      }

    res
      .status(400)
      .json({
        success: false,
        message: 'Already friends'
      })

  } catch (err) {
    res
      .status(400)
      .json({
        success: false,
        message: 'No user was found with friends'
      });
  }
}

exports.getFriends = async (req, res) => {
  const userId = req.jwtDecoded.id;
  const { random } = req.headers;
  let nums = {};
  let randNum = 0;

  if (random) {
    while (Object.keys(nums).length < 6) {
      randNum = Math.floor(Math.random() * 9 + 1)
      nums[`${randNum}`] = true
    }
  }

  try {
    const friends = !random ? await knex('friend')
      .join('user', 'user2_id', '=', 'user.id')
      .select('username', 'user2_id as id')
      .where({ user1_id: userId })
      :
      await knex('user')
        .select('username', 'id')
        .whereIn('id', Object.keys(nums))

    res
      .status(200)
      .json({
        friends: friends
      })

  } catch (err) {
    res
      .status(400)
      .json({
        success: false,
        message: 'No user was found with friends'
      });
  }
}

exports.setUserRecommended = async (req, res) => {
  const userId = req.jwtDecoded.id;
  const { newsarticle_id } = req.body;

  try {
    const newsArticleList = await knex('recommend')
      .select('newsarticle_id')
      .where({ user_id: userId })

    const newsArticleListIds = await Promise.all(newsArticleList.map(async (article) => {
      return article.newsarticle_id
    }))

    if (newsArticleListIds.includes(Number(newsarticle_id))) {
      await knex('recommend')
        .where({ user_id: userId })
        .andWhere({ newsarticle_id: newsarticle_id })
        .del()

      return res
        .status(204)
        .send()
    }

    await knex('recommend')
      .insert([
        { user_id: userId, newsarticle_id: newsarticle_id }
      ])

    res
      .status(200)
      .json({
        success: true,
        message: 'Successfully recommended!'
      })

  } catch (err) {
    res
      .status(400)
      .json({
        success: true,
        message: 'No recommendations set'
      })
  }
}

exports.getUserRecommended = async (req, res) => {
  const userId = req.jwtDecoded.id;

  try {
    const newsArticleList = await knex('recommend')
      .select('newsarticle_id')
      .where({ user_id: userId })

    const newsArticleListIds = await Promise.all(newsArticleList.map(async (article) => {
      return article.newsarticle_id
    }))

    const newsArticles = await knex('newsarticle')
      .whereIn('id', newsArticleListIds)

    res
      .status(200)
      .json({
        articles: newsArticles
      })

  } catch (err) {
    res
      .status(400)
      .json({
        success: false,
        message: "No news articles recommended"
      })
  }
}
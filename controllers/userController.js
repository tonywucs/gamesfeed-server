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
      { username: username, password: password }
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
      { expiresIn: '20m' }
    );

    res.status(200).json({ token });

  } else {
    res.status(403).json({
      success: false,
      message: 'Username/password combination is wrong'
    });
  }
}

exports.createPref = async (req, res) => {
  const userId = req.jwtDecoded.id;
  const selectedPrefs = req.body.preferences;

  try {

    const userPrefs = await knex("user_preference")
      .join("preference", "preference_id", "=", "preference.id")
      .select("preference_id", "name")
      .where({ user_id: userId })
    
    const prefList = await knex("preference")
      .whereIn('name', selectedPrefs)

    if (userPrefs.length === 0) {
      await knex("user_preference")
        .insert(prefList.map((pref) => {
          return {
            user_id: userId,
            preference_id: pref.id
          }
        }));
      }

    const userPrefsArr = userPrefs.map((pref) => pref.name)

    const delPrefs = userPrefsArr
      .filter((pref) => !selectedPrefs.includes(pref))

    const addPrefs = selectedPrefs
      .filter((pref) => !userPrefsArr.includes(pref))
    
    if (delPrefs.length > 0) {
      delList = userPrefs.filter((pref) => {
        return delPrefs.includes(pref.name)
      })

      delList.forEach(async (pref) => {
        await knex('user_preference')
          .where({ user_id: userId })
          .andWhere({ preference_id: pref.preference_id})
          .del()
      })
    }

    if (addPrefs.length > 0) {
      addList = prefList.filter((pref) => {
        return addPrefs.includes(pref.name)
      })

      await knex("user_preference")
        .insert(prefList.map((pref) => {
          return {
            user_id: userId,
            preference_id: pref.id
          }
        }));
      
        return res
          .status(200)
          .json({
            success: true,
            message: 'User preferences updated'
          });
    }


    res
      .status(200)
      .json({ message: "User preferences updated" });

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
    const userPrefs = await knex("user_preference")
      .join("preference", "preference_id", "=", "preference.id")
      .select("user_id", "name")
      .where({ user_id: userId })

    if (userPrefs.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No user preferences were set'
      });
    }

    const prefs = userPrefs.map((user) => {
      return user.name;
    })

    res.status(200).json({
      preferences: prefs
    });

  } catch (err) {
    res.status(400).json({
      success: false,
      message: 'No user was found with preferences'
    });
  }
}

exports.createFriends = async (req, res) => {
  const userId = req.jwtDecoded.id;
  const friendUsername = req.body.username;

  try {

    const friendId = await knex('user')
      .select('id')
      .where({ username: friendUsername })


    if (friendId.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No user was found'
      });
    }

    const hasFriend = await knex('friend')
      .where({ user1_id: userId })

    if (hasFriend.length === 0) {
      await knex('friend')
        .insert({
          user1_id: userId,
          user2_id: friendId
        })

      return res.status(200).json({
        success: true,
        message: 'Friend of was added'
      });
    }

    const isFriend = hasFriend.find((friend) => {
      return friend.user2_id === friendId
    })

    if (isFriend) {
      return res.status(400).json({
        success: false,
        message: 'Friend already exists'
      });
    }

    await knex('friend')
      .insert([{
        user1_id: userId,
        user2_id: friendId[0].id
      }])

    res
      .status(200)
      .json({
        friend_username: friendUsername
      })

  } catch (err) {
    res.status(400).json({
      success: false,
      message: 'No user was found with friends'
    });
  }
}

exports.getFriends = async (req, res) => {
  const userId = req.jwtDecoded.id;

  try {

    const friends = await knex('friend')
      .join('user', 'user2_id', '=', 'user.id')
      .select('username')
      .where({ user1_id: userId })

    res
      .status(200)
      .json({
        friends: friends
      })

  } catch (err) {
    res.status(400).json({
      success: false,
      message: 'No user was found with friends'
    });
  }
}

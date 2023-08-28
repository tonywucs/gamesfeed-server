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
      { expiresIn: '5m' }
    );

    res.status(200).json({ token });

  } else {
    res.status(403).json({
      success: false,
      message: 'Username/password combination is wrong'
    });
  }
}

//body {preferences: ["Pokemon", "Zelda"]}

exports.createPref = async (req, res) => {
  const userId = req.jwtDecoded.id;
  const selectedPrefs = req.body.preferences;

  console.log(selectedPrefs);

  try {
    const prefs = await knex("preference")
      .select("id")
      .whereIn('name', selectedPrefs);

    console.log(prefs);

    await knex("user_preference")
      .insert(prefs.map((pref) => {
        return {
          user_id: userId,
          preference_id: pref.id
        }
      }));

    res
      .status(200)
      .json({ preferences: prefs });
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

exports.setPref = async (req, res) => {

}

exports.getFriends = async (req, res) => {

}

exports.setFriends = async (req, res) => {

}



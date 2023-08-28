const knex = require('knex')(require('../knexfile'));

exports.signUp = (req, res) => {
    console.log('signup', req.body);
}

exports.login = (req, res) => {
    console.log('login', req.body);
}
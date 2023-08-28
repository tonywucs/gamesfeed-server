const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const authorizeMiddleware = require('../middleware/authorize');

router.route('/signup').post(userController.signUp);
router.route('/login').post(userController.login);
router.route('/prefs').get(authorizeMiddleware.authorize, userController.getPref);
router.route('/prefs').post(authorizeMiddleware.authorize, userController.createPref);


module.exports = router;
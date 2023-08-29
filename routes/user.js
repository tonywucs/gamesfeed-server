const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const authorizeMiddleware = require('../middleware/authorize');

router.route('/signup').post(userController.signUp);
router.route('/login').post(userController.login);
router.route('/').delete(authorizeMiddleware.authorize, userController.delUser)
router.route('/prefs')
    .get(authorizeMiddleware.authorize, userController.getPref)
    .post(authorizeMiddleware.authorize, userController.setPref);
router.route('/friends')
    .get(authorizeMiddleware.authorize, userController.getFriends)
    .post(authorizeMiddleware.authorize, userController.setFriends);


module.exports = router;
const express = require('express');
const router = express.Router();

const newsController = require('../controllers/newsController');
const authorizeMiddleware = require('../middleware/authorize');

router.route('/').get(authorizeMiddleware.authorize, newsController.getNews);
router.route('/unregistered').get(newsController.getUnauthenticatedNews);
router.route('/recommend').get(authorizeMiddleware.authorize, newsController.getRecommendNews);
// router.route('/login').post(userController.login);

module.exports = router;
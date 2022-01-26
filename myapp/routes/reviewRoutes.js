const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');
const travelController = require('../controllers/travelController');

const router = express.Router()

router.get('/', reviewController.getAllReviews);
router.get('/:id', reviewController.getReview);

router.use(authController.protect)


router.route('/:id')
    .post(authController.restrictTo('user'),
        reviewController.setTravelUserIds,
        reviewController.createReview)
    .patch(reviewController.verify,
        reviewController.updateReview)
    .delete(authController.restrictTo('user', 'admin'),
        reviewController.deleteReview)


module.exports = router
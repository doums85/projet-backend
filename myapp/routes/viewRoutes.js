const express = require('express');
const viewController = require('../controllers/viewController');

const router = express.Router();
router.get('/', viewController.getHome);

router.get('/overview', viewController.getOverview);
router.get('/overview/:slug', viewController.getTravel);

module.exports = router;

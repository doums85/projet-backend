const express = require('express');
const travelController = require('../controllers/travelController');
const authController = require('../controllers/authController');

const router = express.Router();

router.route('/')
    .get(travelController.getAllTravels)
    .post(authController.protect,
        travelController.uploadTravelImages,
        travelController.resizeTravelImages,
        travelController.findId,
        travelController.createTravel);

router.get('/:id', travelController.getTravel)

router.use(authController.protect)

router.route('/:id')
    .patch(
        travelController.verify,
        travelController.updateTravel)
    .delete(
        travelController.verify,
        travelController.deleteTravel);


module.exports = router;
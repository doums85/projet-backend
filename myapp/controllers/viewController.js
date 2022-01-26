const Travel = require("../models/travelModel");
const User = require("../models/userModel");
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.getHome = (req, res, next) => {
    // res.status(200).render('homePage', {
    //     title: 'Corner Road | Home'
    // });
    res.status(200).render('homePage', {
        title: 'Corner Road | Home',

    });
    next();
};


exports.getOverview = catchAsync(async (req, res, next) => {
    const travels = await Travel.find();

    res.status(200).render('overview', {
        title: 'Corner Road | Home',
        data: travels
    });

});

exports.getTravel = catchAsync(async (req, res, next) => {
    const travel = await Travel.findOne({
        slug: req.params.slug
    });

    if (!travel) {
        return next(new AppError('There isn\'t travel with that name.', 404));
    }


    res.status(200).render('travel', {
        title: travel.name,
        data: travel
    });

});
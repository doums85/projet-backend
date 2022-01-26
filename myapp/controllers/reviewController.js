const Review = require("../models/reviewModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const factory = require("./handlerFactory");


exports.setTravelUserIds = (req, res, next) => {
    // Allow nested routes
    if (!req.body.travel) req.body.travel = req.params.id;
    if (!req.body.user) req.body.user = req.user.id;
    next();
};



// CRUD

exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.verify = factory.verifyUpdateOne(Review);
exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
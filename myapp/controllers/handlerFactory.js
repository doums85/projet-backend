// C =>  CREER UN ModelS , CARTES DE VOYAGES , REVIEWS
// R => VOIR TOUS ModelS , LES CARTES DE VOYAGES, TOUS REVIEW | VOIR 1 Model , VOIR 1 CARTE, REVIEW
// U => UPDATE Model, 1 CARTE DE VOYAGE (Model QUI LA CRÉER OU ADMIN), REVIEW (USEER QUI LA CRÉER OU ADMIN)
// D => DELETE Model (Model CONNECTÉ OU ADMIN), 1 CARTE DE VOYAGE (Model QUI LA CRÉER OU ADMIN), REVIEW (USER QUI LA CRÉER OU ADMIN)

const APIFeatures = require("../utils/apiFeatures");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync")
const slugify = require("slugify");
const multer = require("multer");

// Create Method
exports.createOne = Model => catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);

    res.status(201).json({
        status: 'success',
        data: {
            data: doc
        }
    });
});



exports.getAll = Model => catchAsync(async (req, res, next) => {
    let filter = {};
    if (req.params.travelId) filter = {
        travel: req.params.travelId
    };

    const features = new APIFeatures(Model.find(filter), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();

    const doc = await features.query;

    res.status(200).json({
        status: 'success',
        results: doc.length,
        data: {
            data: doc
        }
    });
})



// Read method
exports.getOne = Model => catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);

    const doc = await query;
    console.log(doc);
    if (!doc) {
        return next(new AppError('No document found with that ID', 404))
    }

    res.status(200).json({
        status: 'success',
        data: {
            data: doc
        }
    });
});


exports.updateOne = Model => catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!doc) {
        return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            data: doc
        }
    });
});


exports.verifyUpdateOne = Model => catchAsync(async (req, res, next) => {
    if (req.body.name) req.body.slug = slugify(req.body.name);

    const doc = await Model.findById(req.params.id);
    const docId = doc.user._id;

    if (docId == null) {
        next(new AppError('This document doesn\'t exist', 404));
    }
    // console.log("DocID", doc);
    // console.log("REQUSER", req.user);
    const idUser = req.user;
    if (docId != idUser.id && idUser.role == "user") {
        next(new AppError('You can\'t change this document', 404));
    }
    next();
});


exports.deleteOne = Model =>
    catchAsync(async (req, res, next) => {
        const doc = await Model.findByIdAndDelete(req.params.id);

        if (!doc) {
            return next(new AppError('No document found with that ID', 404));
        }

        res.status(204).json({
            status: 'success',
            data: null
        });
    });



// FUNCTION MULTER
const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) cb(null, true)
    else {
        cb(new AppError('Not an image! Please upload only images', 400), false);
    }
};

exports.multerUpload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});
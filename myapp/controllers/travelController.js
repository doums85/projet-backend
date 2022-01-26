const sharp = require("sharp");
const { default: slugify } = require("slugify");
const { find } = require("../models/travelModel");
const Travel = require("../models/travelModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const factory = require('./handlerFactory');

exports.findId = (req, res, next) => {
    // console.log(req.user.id);
    req.body.user = req.user.id
    next()
}

/////////////////////////////////// Multer multi Controller ////////////////////////////

const upload = factory.multerUpload;

exports.uploadTravelImages = upload.fields([{
        name: 'imageCover',
        maxCount: 1
    },
    {
        name: 'images',
        maxCount: 4
    }
]);

exports.resizeTravelImages = catchAsync(async (req, res, next) => {
    if (!req.files.imageCover || !req.files.images) return next();
    // console.log(req.files.imageCover[0].buffer);
    // 1) Cover image
    req.body.imageCover = `travel-${slugify(req.body.name)}-${Date.now()}-cover.jpeg`;
    await sharp(req.files.imageCover[0].buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({
            quality: 90
        })
        .toFile(`public/images/travels/${req.body.imageCover}`);

    // 2) Images
    req.body.images = [];

    await Promise.all(
        req.files.images.map(async (file, i) => {
            const filename = `travel-${slugify(req.body.name)}-${Date.now()}-${i + 1}.jpeg`;

            await sharp(file.buffer)
                .resize(2000, 1333)
                .toFormat('jpeg')
                .jpeg({
                    quality: 90
                })
                .toFile(`public/images/travels/${filename}`);

            req.body.images.push(filename);
        })
    );

    next();
});

/////////////////////////////////// End of Multer multi Controller ////////////////////////////

exports.validateByAdmin = catchAsync(async(req, res, next) =>{
    const travel = await Travel.findOneAndUpdate({active: false, _id: req.params.id})

    if(!travel) next(new AppError('there isn\'t document to validate ', 400))

})


// CRUD ❤️
exports.createTravel = factory.createOne(Travel);
exports.getAllTravels = factory.getAll(Travel);
exports.getTravel = factory.getOne(Travel);
exports.verify = factory.verifyUpdateOne(Travel)
exports.updateTravel = factory.updateOne(Travel);
exports.deleteTravel = factory.deleteOne(Travel);
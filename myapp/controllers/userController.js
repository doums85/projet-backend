const factory = require('./handlerFactory');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sharp = require('sharp');


/////////////////////////////////// Multer Controller ////////////////////////////

const upload = factory.multerUpload;

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
    if (!req.file) return next();

    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

    await sharp(req.file.buffer)
        .resize(500, 500)
        .toFormat('jpeg')
        .jpeg({
            quality: 90
        })
        .toFile(`public/images/users/${req.file.filename}`);

    next();
})
/////////////////////////////////// End of Multer Controller ////////////////////////////






/////////////////////////////////// Get Me Controller ////////////////////////////
exports.getMe = (req, res, next) => {
    console.log(req.user);
    req.params.id = req.user.id;
    next();
}
/////////////////////////////////// 🎉 END Get Me Controller ////////////////////////////




/////////////////////////////////// Update Me Controller ////////////////////////////

const filterObj = (obj, ...allowdFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if (allowdFields.includes(el)) newObj[el] = obj[el]
    });
    return newObj;
};

//❌  IL NE PEUT PAS UPDATE SON MOT DE PASSE
exports.updateMe = catchAsync(async (req, res, next) => {
    // 1) Create error if user POSTs password data
    if (req.body.password || req.body.passwordConfirm) {
        return next(new AppError('This oute is\'t for password update. Please use /updateMyPassword', 400))
    }

    // 2) Filtered out unwanted fields names that are not allowed to be updated
    const filteredBody = filterObj(req.body, 'name', 'email');
    if (req.file) filteredBody.photo = req.file.filename;

    // 3) Update User document
    const updateUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        status: 'success',
        data: {
            user: updateUser
        }
    });
});


/////////////////////////////////// 🎉  End of Update Me Controller ////////////////////////////



///////////////////////////////////  Delete Me Controller ////////////////////////////
exports.deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndDelete(req.user.id, {
        active: false
    });

    res.status(204).json({
        status: 'success',
        data: null
    });
});
/////////////////////////////////// 🎉  End of Delete Me Controller ////////////////////////////




///////////////////////////////////  Create Controller ////////////////////////////
exports.createUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route isn\'t definied! please use /signup instead'
    });
};

/////////////////////////////////// 🎉  End of Create Controller ////////////////////////////

// Factory
exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
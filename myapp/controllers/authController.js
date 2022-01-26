const User = require('../models/userModel');
const {
    promisify
} = require('util')
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const crypto = require('crypto');
const randomProfile = require('random-profile-generator');


/////////////////////////////////// 🍪 JWT Controller ////////////////////////////
const signToken = id => {
    return jwt.sign({
        id
    }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
    catc
};

const createSendToken = (user, statusCode, req, res) => {
    const token = signToken(user._id);
    const cookieOptions = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
        ),
        httpOnly: true
    };
    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

    res.cookie('jwt', token, cookieOptions);

    // Remove Password & email
    user.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    });
};
/////////////////////////////////// 🎉 End of JWT Controller ////////////////////////////



/////////////////////////////////// Signup Controller ////////////////////////////
exports.signup_Get = (req, res) => {

};

exports.signup_Post = catchAsync(async (req, res) => {
    const avatar = randomProfile.avatar()

    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        photo: avatar
    });
    createSendToken(newUser, 201, req, res);
});

/////////////////////////////////// 🎉 End of Signup Controller ////////////////////////////



/////////////////////////////////// Login Controller ////////////////////////////
exports.login_Get = (req, res) => {

};


exports.login_Post = catchAsync(async (req, res, next) => {
    const {
        email,
        password
    } = req.body;

    // 1) Check if email & password exist
    if (!email || !password) {
        return next(new AppError('Please provide email and password!', 400));
    }

    // 2) Check if user exist & password is correct
    const user = await User.findOne({
        email
    }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Incorrect email or password', 401))
    }

    // 3) If eveything is good, send token to client
    createSendToken(user, 200, req, res);
});

/////////////////////////////////// 🎉 End of Login Controller ////////////////////////////


/////////////////////////////////// Log Out Controller ////////////////////////////
exports.logout = (req, res) => {
    res.cookie('jwt', 'loggedout', {
        exprires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });
    res.status(200).json({
        status: 'success'
    });
};
/////////////////////////////////// 🎉 End of Log Out Controller ////////////////////////////


/////////////////////////////////// 🔐 Protect Controller ////////////////////////////
exports.protect = catchAsync(async (req, res, next) => {
    // 1) Getting token and check of it's there
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }

    if (!token) {
        return next(new AppError('You aren\'t logged in !  Please log in to get access', 401));
    }

    // 2) Verification token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    // console.log(decoded);

    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
        return next(new AppError('The user belonging to this token doesn\'t longer exist.', 401));
    }

    // 4) Check if user changed password after the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next(new AppError('Uer recently changed password! Please log in again.', 401));
    }

    // GRANT ACCESS TO PROTECTED ROUTE ✅
    req.user = currentUser;
    res.locals.user = currentUser;
// console.log(req.user);
    next();
});

/////////////////////////////////// 🎉  End of Protect Controller ////////////////////////////



/////////////////////////////////// 🔐 isLoggedIn Controller ////////////////////////////
exports.isLoggedIn = async (req, res, next) => {
    if (res.cookies.jwt) {
        try {
            // 1) Verify token
            const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

            // 2) Check if user still exists
            const currentUser = await User.findById(decoded.id);

            if (!currentUser) {
                return next();
            }

            // 3) Check if user changed password after the token was issued
            if (currentUser.changedPasswordAfter(decoded.iat)) {
                return next();
            }

            // There is a logged in user ✅
            res.locals.user = currentUser;

            return next();
        } catch (error) {
            return next();
        }
    }
    next();
}

/////////////////////////////////// 🎉  End of isLoggedIn Controller ////////////////////////////



/////////////////////////////////// 🔐 RestrictTo Controller ////////////////////////////
exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        // roles : [admin, user]
        // console.log("le role 🎖 ", req.user.role);
        if (!roles.includes(req.user.role)) {
            return next(new AppError('You don\'t have permission to perform this ', 403))
        }

        next();
    }
}

/////////////////////////////////// 🎉  End of RestrictTo Controller ////////////////////////////


/////////////////////////////////// forgotPasssword Controller ////////////////////////////
exports.forgotPasssword = catchAsync(async (req, res, next) => {
    // 1) Get user based on posted email
    const user = await User.findOne({
        email: req.body.email
    });
    // console.log(user);
    // si l'email(req.body.email) de l'utilisateur n'existe pas
    if (!user) {
        return next(new AppError('You don\'t have an account yet', 404));
    }

    // 2) Generate the random reset token
    user.createPasswordResetToken();
    await user.save({
        validateBeforeSave: false
    });

    // 3) Send it to user's email
    res.status(200).json({
        status: 'success',
        message: 'Reset token send'
    })

    // // a suivre apres module email ❌
    // try {

    // } catch (error) {

    // }
})
/////////////////////////////////// 🎉  End of forgotPasssword Controller ////////////////////////////



/////////////////////////////////// Reset password Controller ////////////////////////////
exports.resetPassword = catchAsync(async (req, res, next) => {
    // 1) Get user based on the token
    const token = req.params.token;
    // console.log(req.params.token);
    const user = await User.findOne({
        passwordResetToken: token,
        passwordResetExpires: {
            $gt: Date.now()
        }
    });

    // 2) If token hasn't expired and there is user , set the new password
    if (!user) {
        return next(new AppError('Token is invalid or has expired', 400));
    }
    // console.log(req.body);
    // 3) Update changedPasswordAt property for the user
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // console.log(user);
    // 4) Log the user in, send JWT
    createSendToken(user, 200, req, res);
});

/////////////////////////////////// 🎉  End of Reset password Controller ////////////////////////////



/////////////////////////////////// Update Password Controller ////////////////////////////

exports.updatePassword = catchAsync(async (req, res, next) => {
    // 1) Get user from collection

    const user = await User.findById(req.user.id).select('+password');

    // 2) Check if POSTed current password is correct
    if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
        return next(new AppError('Your current password is wrong', 401));
    }
    // 3) If so, Update password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();
    // 4) Log user in, send JWT
    createSendToken(user, 200, req, res);
});


/////////////////////////////////// 🎉  End of Update Password Controller ////////////////////////////
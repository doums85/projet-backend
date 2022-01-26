const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController.js')
const userController = require('../controllers/userController.js')


router.post('/signup', authController.signup_Post);
router.post('/login', authController.login_Post);
router.get('/logout', authController.logout);

router.post('/forgotPassword', authController.forgotPasssword);
router.patch('/resetPassword/:token', authController.resetPassword);

// a verifier avec Maud
router.get('/:id', userController.getUser);

router.use(authController.protect);

router.patch('/updateMyPassword', authController.protect, authController.updatePassword);
router.get('/me', userController.getMe, userController.getUser);
router.patch('/updateMe',
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  userController.updateMe);
router.delete('/deleteMe', userController.deleteMe);


// uniquement l'admin peut y accéder
router.use(authController.restrictTo('admin'));

router.route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router.route('/:id')
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
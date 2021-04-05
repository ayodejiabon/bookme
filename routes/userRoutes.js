const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');

const router = express.Router(); 

router.post('/signup', authController.signup)
router.post('/login', authController.login)
router.get('/logout', authController.logout)
router.post('/forgotpassword', authController.forgotPassword)
router.patch('/resetpassword/:token', authController.resetPassword)

router.use(authController.protect);

router.patch('/updatepassword', authController.updatePassword)
router.get('/me', userController.getMe, userController.getUser)
router.patch('/updateme', userController.uploadPhoto, userController.resizePhoto, userController.updateMe)
router.delete('/deleteme', userController.deleteMe);

router.use(authController.restrictTo('admin'));

router.route('/')
.get(userController.getAllUsers)
.post(userController.createUser)

router.route('/:id')
.get(userController.getUser)
.patch(userController.updateUser)

module.exports = router;

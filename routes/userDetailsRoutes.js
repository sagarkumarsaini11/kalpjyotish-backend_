const express = require('express');
const router = express.Router();
const userController = require('../controllers/userDetailsController.js'); // adjust path

// CREATE
router.post('/users', userController.createUser);

// READ
router.get('/users', userController.getAllUsers);
router.get('/users/:id', userController.getUserById);
// router.get('/users/uid/:uid', userController.getUserByUid);

// UPDATE
router.put('/users/:id', userController.updateUser);
router.put('/users/:id/wallet', userController.updateWalletBalance);
router.put('/users/:id/follow', userController.toggleFollowAstrologer);
router.put('/users/:id/fcm-token', userController.updateFcmToken);
router.put('/users/:id/deactivate', userController.softDeleteUser);

// DELETE
router.delete('/users/:id', userController.deleteUser);

module.exports = router;
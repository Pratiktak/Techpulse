const express = require('express');
const authController = require('../controllers/auth.controller.js');
const authMiddleware = require('../middleware/auth.middleware.js');

const router = express.Router();

// user api
router.post('/user/register', authController.registerUser);
router.post('/user/login', authController.loginUser);
router.get('/user/logout', authController.logoutUser);
router.get("/user/me", authMiddleware.protectRoute, authController.getMe);

module.exports = router;
const express = require('express');

const router = express.Router();

const authController = require(
    '../controllers/auth.controller'
);

const authMiddleware = require(
    '../middlewares/auth.middleware'
);

const { requireRole } = require(
    '../middlewares/role.middleware'
);

router.post(
    '/login',
    authController.login
);

router.post(
    '/register',
    authMiddleware,
    requireRole('ADMIN'),
    authController.register
);

router.get(
    '/profile',
    authMiddleware,
    authController.profile
);

router.patch(
    '/profile',
    authMiddleware,
    authController.updateProfile
);

router.post(
    '/change-password',
    authMiddleware,
    authController.changePassword
);

module.exports = router;
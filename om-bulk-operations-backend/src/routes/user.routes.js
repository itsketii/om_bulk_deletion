const express = require('express');

const router = express.Router();

const userController = require(
    '../controllers/user.controller'
);

const authMiddleware = require(
    '../middlewares/auth.middleware'
);

const { requireRole } = require(
    '../middlewares/role.middleware'
);

router.use(authMiddleware);
router.use(requireRole('ADMIN'));

router.get(
    '/',
    userController.listUsers
);

router.post(
    '/',
    userController.createUser
);

router.patch(
    '/:id/reset-password',
    userController.resetPassword
);

module.exports = router;

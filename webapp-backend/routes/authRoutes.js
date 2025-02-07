const express = require('express');
const userController = require('../controllers/userController');
const router = express.Router();
const { authenticate } = require("../utils/jwtUtils");

router.post('/login', async (req, res) => {
    const result = await userController.login(req, res);
    res.status(result.status).json({ message: result.message, token: result.token, userId: result.userId });
});

router.post('/register', async (req, res) => {
    const result = await userController.register(req, res);
    res.status(result.status).json({ message: result.message });
});

router.post('/logout', authenticate, async (req, res) => {
    const result = await userController.logout(req, res);
    res.status(result.status).json({ message: result.message });
});

router.post('/validate-token', authenticate, async (req, res) => {
    res.status(200).json({ message: 'Token valido' });
})

module.exports = router;
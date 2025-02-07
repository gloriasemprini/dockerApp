const express = require('express');
const router = express.Router();
const { authenticate } = require('../utils/jwtUtils');
const userController = require('../controllers/userController');

router.put('/:userId/profile/update-name-surname', authenticate, async (req, res) => {
    const result = await userController.updateNameSurname(req, res);
    res.status(result.status).json({ message: result.message });
});

router.put('/:userId/profile/update-username', authenticate, async (req, res) => {
    const result = await userController.updateUsername(req, res);
    res.status(result.status).json({ message: result.message });
});

router.put('/:userId/profile/update-email', authenticate, async (req, res) => {
    const result = await userController.updateEmail(req, res);
    res.status(result.status).json({ message: result.message });
});

router.put('/:userId/profile/change-password', authenticate, async (req, res) => {
    const result = await userController.changePassword(req, res);
    res.status(result.status).json({ message: result.message });
});

router.delete('/:userId/profile/deleteAccount', authenticate, async (req, res) => {
    try {
        await userController.deleteUserAccount(req, res);
    } catch (error) {
        res.status(500).json({ message: 'Errore nell\'eliminazione dell\'account.' });
    }
});

router.get('/:userId/profile', authenticate, async (req, res) => {
    const result = await userController.getProfile(req, res);
    if (result.user) {
        res.status(result.status).json(result.user);
    } else {
        res.status(result.status).json({ message: result.message });
    }
});

module.exports = router;

const express = require('express');
const router = express.Router();

// Home page
router.get('/', (req, res) => {
    res.status(200).json({ message: 'Welcome to the home page!' });
});

module.exports = router;

const express = require('express');
const { googleLogin } = require('../controllers/userController');
const authenticate = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/login',authenticate, googleLogin);


module.exports = router;

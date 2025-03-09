const express = require('express');
const { getAllCards, createCard, deleteCard, duplicateCard, reportCard, updateCard } = require('../controllers/cardController');
const authenticate = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getAllCards);
router.post('/', authenticate, createCard);
router.delete('/:id', authenticate, deleteCard);
router.post('/duplicate/:id', authenticate, duplicateCard);
router.put('/report/:id', authenticate, reportCard); // ✅ Changed to PUT
router.put('/:id', authenticate, updateCard);
module.exports = router;

const express = require('express');
const router = express.Router();
const {
  issueBook,
  returnBook,
  getTransactions,
  exportTransactions,
} = require('../controllers/transactionController');

router.post('/issue', issueBook);
router.post('/return', returnBook);
router.get('/', getTransactions);
router.get('/export', exportTransactions);

module.exports = router;
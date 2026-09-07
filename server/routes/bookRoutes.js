const express = require('express');
const router = express.Router();
const {
  createBook,
  getBooks,
  getBook,
  updateBook,
  deleteBook,
} = require('../controllers/bookController');
const { bookValidation } = require('../middleware/validation');

// POST /api/books - create a book (with validation)
router.post('/', bookValidation, createBook);

// GET /api/books - list all books
router.get('/', getBooks);

// GET /api/books/:id - single book
router.get('/:id', getBook);

// PUT /api/books/:id - update book
router.put('/:id', updateBook);

// DELETE /api/books/:id - delete book
router.delete('/:id', deleteBook);

module.exports = router;
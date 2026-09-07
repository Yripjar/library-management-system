const Book = require('../models/Book');
const Transaction = require('../models/Transaction');
const { validationResult } = require('express-validator');

function escapeRegex(value = '') {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    '\\$&'
  );
}

const createBook = async (req, res) => {
  const errors =
    validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      message:
        'Please fix the highlighted fields.',
      errors: errors.array(),
    });
  }

  const {
    title,
    author,
    isbn,
    category,
    totalCopies,
  } = req.body;

  try {
    const cleanTitle =
      String(title).trim();

    const cleanAuthor =
      String(author).trim();

    const cleanIsbn =
      String(isbn).trim();

    const cleanCategory =
      String(category).trim();

    const copies =
      Number(totalCopies);

    const existingBook =
      await Book.findOne({
        isbn: cleanIsbn,
      });

    if (existingBook) {
      return res.status(409).json({
        message:
          `A book with ISBN / Book ID "${cleanIsbn}" already exists.`,
      });
    }

    const book =
      await Book.create({
        title: cleanTitle,
        author: cleanAuthor,
        isbn: cleanIsbn,
        category: cleanCategory,
        totalCopies: copies,
        availableCopies: copies,
      });

    return res.status(201).json(book);
  } catch (err) {
    console.error(
      'CREATE BOOK ERROR:',
      err
    );

    if (err.code === 11000) {
      return res.status(409).json({
        message:
          'A book with this ISBN or QR identity already exists.',
      });
    }

    if (
      err.name ===
      'ValidationError'
    ) {
      return res.status(400).json({
        message:
          Object.values(
            err.errors
          )
            .map(
              (item) =>
                item.message
            )
            .join(', '),
      });
    }

    return res.status(500).json({
      message:
        err.message ||
        'Unable to create the book.',
    });
  }
};

const getBooks = async (
  req,
  res
) => {
  const {
    title,
    author,
    category,
    availability,
  } = req.query;

  const filter = {};

  if (title) {
    filter.title = {
      $regex: escapeRegex(title),
      $options: 'i',
    };
  }

  if (author) {
    filter.author = {
      $regex: escapeRegex(author),
      $options: 'i',
    };
  }

  if (category) {
    filter.category = {
      $regex: escapeRegex(category),
      $options: 'i',
    };
  }

  if (availability === 'available') {
    filter.availableCopies = {
      $gt: 0,
    };
  }

  if (availability === 'issued') {
    filter.availableCopies = {
      $lte: 0,
    };
  }

  try {
    const books =
      await Book.find(filter)
        .sort({
          createdAt: -1,
        });

    res.json(books);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: 'Server error.',
      error: err.message,
    });
  }
};

const getBook = async (
  req,
  res
) => {
  try {
    const book =
      await Book.findById(
        req.params.id
      );

    if (!book) {
      return res.status(404).json({
        message: 'Book not found.',
      });
    }

    res.json(book);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: 'Server error.',
    });
  }
};

const updateBook = async (
  req,
  res
) => {
  try {
    const book =
      await Book.findById(
        req.params.id
      );

    if (!book) {
      return res.status(404).json({
        message: 'Book not found.',
      });
    }

    const {
      title,
      author,
      isbn,
      category,
      totalCopies,
    } = req.body;

    if (isbn && isbn !== book.isbn) {
      const duplicate =
        await Book.findOne({
          isbn,
          _id: {
            $ne: book._id,
          },
        });

      if (duplicate) {
        return res.status(409).json({
          message:
            'Another book already uses this ISBN.',
        });
      }
    }

    if (
      totalCopies !== undefined &&
      Number(totalCopies) < 1
    ) {
      return res.status(400).json({
        message:
          'Total copies must be at least 1.',
      });
    }

    const issuedCopies =
      book.totalCopies -
      book.availableCopies;

    if (
      totalCopies !== undefined &&
      Number(totalCopies) < issuedCopies
    ) {
      return res.status(400).json({
        message:
          `Cannot reduce total copies below ${issuedCopies}; those copies are currently issued.`,
      });
    }

    book.title =
      title?.trim() || book.title;

    book.author =
      author?.trim() || book.author;

    book.isbn =
      isbn?.trim() || book.isbn;

    book.category =
      category?.trim() ||
      book.category;

    if (totalCopies !== undefined) {
      const newTotal =
        Number(totalCopies);

      book.totalCopies =
        newTotal;

      book.availableCopies =
        newTotal -
        issuedCopies;
    }

    await book.save();

    res.json(book);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: 'Server error.',
      error: err.message,
    });
  }
};

const deleteBook = async (
  req,
  res
) => {
  try {
    const book =
      await Book.findById(
        req.params.id
      );

    if (!book) {
      return res.status(404).json({
        message: 'Book not found.',
      });
    }

    const activeIssues =
      await Transaction.countDocuments({
        book: book._id,
        status: 'issued',
      });

    if (activeIssues > 0) {
      return res.status(409).json({
        message:
          'Cannot delete a book while copies are currently issued.',
      });
    }

    await Book.findByIdAndDelete(
      req.params.id
    );

    res.json({
      message:
        'Book removed successfully.',
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: 'Server error.',
      error: err.message,
    });
  }
};

module.exports = {
  createBook,
  getBooks,
  getBook,
  updateBook,
  deleteBook,
};
const Book = require('../models/Book');
const Transaction = require('../models/Transaction');
const { Parser } = require('json2csv');

const issueBook = async (
  req,
  res
) => {
  const {
    qrCodeData,
    borrowerName,
  } = req.body;

  if (
    !qrCodeData ||
    !borrowerName?.trim()
  ) {
    return res.status(400).json({
      message:
        'QR code data and borrower name are required.',
    });
  }

  try {
    const book =
      await Book.findOne({
        qrCodeData,
      });

    if (!book) {
      return res.status(404).json({
        message:
          'Invalid QR code: book not found.',
      });
    }

    if (book.availableCopies <= 0) {
      return res.status(409).json({
        message:
          'No copies of this book are currently available.',
      });
    }

    const activeTransactions =
      await Transaction.countDocuments({
        book: book._id,
        status: 'issued',
      });

    if (
      activeTransactions >=
      book.totalCopies
    ) {
      return res.status(409).json({
        message:
          'All copies of this book are currently issued.',
      });
    }

    const transaction =
      await Transaction.create({
        book: book._id,
        borrowerName:
          borrowerName.trim(),
        issueTimestamp: new Date(),
        status: 'issued',
        dueDate: new Date(
          Date.now() +
            14 *
              24 *
              60 *
              60 *
              1000
        ),
      });

    book.availableCopies -= 1;

    await book.save();

    await transaction.populate(
      'book',
      'title author isbn'
    );

    res.status(201).json(
      transaction
    );
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: 'Server error.',
      error: err.message,
    });
  }
};

const returnBook = async (
  req,
  res
) => {
  const { qrCodeData } =
    req.body;

  if (!qrCodeData) {
    return res.status(400).json({
      message:
        'QR code data is required.',
    });
  }

  try {
    const book =
      await Book.findOne({
        qrCodeData,
      });

    if (!book) {
      return res.status(404).json({
        message:
          'Invalid QR code: book not found.',
      });
    }

    const transaction =
      await Transaction.findOne({
        book: book._id,
        status: 'issued',
      }).sort({
        issueTimestamp: 1,
      });

    if (!transaction) {
      return res.status(409).json({
        message:
          'No active issue record found for this book.',
      });
    }

    transaction.status =
      'returned';

    transaction.returnTimestamp =
      new Date();

    await transaction.save();

    book.availableCopies =
      Math.min(
        book.totalCopies,
        book.availableCopies + 1
      );

    await book.save();

    await transaction.populate(
      'book',
      'title author isbn'
    );

    res.json(transaction);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: 'Server error.',
      error: err.message,
    });
  }
};

const getTransactions = async (
  req,
  res
) => {
  const {
    status,
    search,
    borrowerName,
  } = req.query;

  const filter = {};

  if (status) {
    filter.status = status;
  }

  if (borrowerName) {
    filter.borrowerName = {
      $regex: borrowerName,
      $options: 'i',
    };
  }

  try {
    if (search) {
      const books =
        await Book.find({
          $or: [
            {
              title: {
                $regex: search,
                $options: 'i',
              },
            },
            {
              author: {
                $regex: search,
                $options: 'i',
              },
            },
            {
              isbn: {
                $regex: search,
                $options: 'i',
              },
            },
          ],
        }).select('_id');

      filter.book = {
        $in: books.map(
          (book) => book._id
        ),
      };
    }

    const transactions =
      await Transaction.find(
        filter
      )
        .populate(
          'book',
          'title author isbn'
        )
        .sort({
          issueTimestamp: -1,
        });

    res.json(transactions);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: 'Server error.',
      error: err.message,
    });
  }
};

const exportTransactions = async (
  req,
  res
) => {
  try {
    const transactions =
      await Transaction.find()
        .populate(
          'book',
          'title author isbn'
        )
        .lean();

    const data =
      transactions.map(
        (transaction) => ({
          'Book Title':
            transaction.book
              ?.title || '',

          Author:
            transaction.book
              ?.author || '',

          'Book ID':
            transaction.book
              ?.isbn || '',

          'Issued To':
            transaction.borrowerName,

          'Issue Timestamp':
            transaction.issueTimestamp
              ? transaction.issueTimestamp.toISOString()
              : '',

          'Return Timestamp':
            transaction.returnTimestamp
              ? transaction.returnTimestamp.toISOString()
              : '',

          'Current Status':
            transaction.status,
        })
      );

    const fields = [
      'Book Title',
      'Author',
      'Book ID',
      'Issued To',
      'Issue Timestamp',
      'Return Timestamp',
      'Current Status',
    ];

    const parser =
      new Parser({
        fields,
      });

    const csv =
      parser.parse(data);

    res.header(
      'Content-Type',
      'text/csv'
    );

    res.attachment(
      'transactions.csv'
    );

    res.send(csv);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: 'Server error.',
      error: err.message,
    });
  }
};

module.exports = {
  issueBook,
  returnBook,
  getTransactions,
  exportTransactions,
};
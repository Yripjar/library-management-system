const mongoose = require('mongoose');
const crypto = require('crypto');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    author: {
      type: String,
      required: true,
      trim: true,
    },

    isbn: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    totalCopies: {
      type: Number,
      required: true,
      min: 1,
    },

    availableCopies: {
      type: Number,
      required: true,
      min: 0,
    },

    qrCodeData: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

/*
 * Mongoose 9:
 * pre middleware no longer receives next().
 * Use an async function instead.
 */
bookSchema.pre('validate', function () {
  if (this.isNew) {
    this.availableCopies = Number(
      this.totalCopies
    );

    this.qrCodeData =
      `BOOK-${crypto.randomUUID()}`;
  }
});

module.exports =
  mongoose.model('Book', bookSchema);
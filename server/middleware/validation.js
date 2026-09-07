const { body } = require('express-validator');

/*
 * Accept:
 *
 * ISBN-10
 * 123456789X
 *
 * ISBN-13
 * 9781234567897
 *
 * Hyphens and spaces are allowed.
 *
 * Examples:
 * 9781847941831        ✅
 * 978-1-845-?          depends on digits
 * 123                  ❌
 * abc                  ❌
 */

const isValidISBN = (value) => {
  const cleaned = String(value || '')
    .replace(/[-\s]/g, '')
    .toUpperCase();

  /*
   * ISBN-10
   */
  if (/^\d{9}[\dX]$/.test(cleaned)) {
    return true;
  }

  /*
   * ISBN-13
   */
  if (/^\d{13}$/.test(cleaned)) {
    return true;
  }

  return false;
};


const bookValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage(
      'Book title is required.'
    ),

  body('author')
    .trim()
    .notEmpty()
    .withMessage(
      'Author is required.'
    ),

  body('isbn')
    .trim()
    .notEmpty()
    .withMessage(
      'ISBN / Book ID is required.'
    )
    .custom(isValidISBN)
    .withMessage(
      'ISBN / Book ID must be a valid ISBN-10 or ISBN-13.'
    ),

  body('category')
    .trim()
    .notEmpty()
    .withMessage(
      'Category is required.'
    ),

  body('totalCopies')
    .isInt({ min: 1 })
    .withMessage(
      'Total copies must be at least 1.'
    ),
];

module.exports = {
  bookValidation,
};
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    borrowerName: { type: String, required: true, trim: true },
    borrowerId: { type: String, default: '' }, // optional user ID
    issueTimestamp: { type: Date, required: true },
    returnTimestamp: { type: Date, default: null },
    status: {
      type: String,
      enum: ['issued', 'returned'],
      default: 'issued',
    },
    dueDate: { type: Date }, // optional: for overdue calculation
  },
  { timestamps: true }
);

module.exports = mongoose.model('Transaction', transactionSchema);
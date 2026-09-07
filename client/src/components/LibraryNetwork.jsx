import { useMemo } from 'react';
import { Link } from 'react-router-dom';

const POSITIONS = [
  [17, 27],
  [31, 18],
  [46, 31],
  [61, 17],
  [77, 29],
  [23, 55],
  [39, 47],
  [55, 58],
  [72, 49],
  [86, 62],
  [13, 78],
  [31, 77],
  [49, 82],
  [68, 75],
  [87, 82],
];

export default function LibraryNetwork({
  books = [],
  transactions = [],
  selectedId = null,
  onSelect,
  compact = false,
}) {
  const visibleBooks = useMemo(
    () => books.slice(0, 15),
    [books]
  );

  const nodes = visibleBooks.map((book, index) => ({
    book,
    x: POSITIONS[index % POSITIONS.length][0],
    y: POSITIONS[index % POSITIONS.length][1],
  }));

  const activeIds = new Set(
    transactions
      .filter((transaction) => transaction.status === 'issued')
      .map(
        (transaction) =>
          transaction.book?._id || transaction.book
      )
      .filter(Boolean)
  );

  return (
    <div
      className={`network-field ${
        compact ? 'network-field--compact' : ''
      }`}
      aria-label="Interactive library circulation map"
    >
      <div className="network-field__grid" />

      <svg
        className="network-field__svg"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient
            id="networkSignal"
            x1="0"
            y1="0"
            x2="1"
            y2="1"
          >
            <stop
              offset="0%"
              stopColor="currentColor"
              stopOpacity="0.08"
            />
            <stop
              offset="100%"
              stopColor="currentColor"
              stopOpacity="0.7"
            />
          </linearGradient>
        </defs>

        {nodes.slice(1).map((node, index) => {
          const previous = nodes[index];

          const isActive =
            activeIds.has(node.book._id) ||
            activeIds.has(previous.book._id);

          return (
            <line
              key={`edge-${node.book._id}`}
              x1={previous.x}
              y1={previous.y}
              x2={node.x}
              y2={node.y}
              className={
                isActive
                  ? 'network-edge network-edge--active'
                  : 'network-edge'
              }
            />
          );
        })}
      </svg>

      <div className="network-field__origin">
        <span className="network-field__origin-ring" />
        <span className="network-field__origin-dot" />
      </div>

      {nodes.map(({ book, x, y }, index) => {
        const selected = selectedId === book._id;
        const active = activeIds.has(book._id);

        return (
          <button
            key={book._id}
            type="button"
            className={`network-node ${
              selected ? 'network-node--selected' : ''
            } ${active ? 'network-node--active' : ''}`}
            style={{
              left: `${x}%`,
              top: `${y}%`,
              animationDelay: `${index * 80}ms`,
            }}
            onClick={() => onSelect?.(book)}
            aria-label={`${book.title}, ${book.availableCopies} of ${book.totalCopies} available`}
          >
            <span className="network-node__pulse" />
            <span className="network-node__dot" />

            <span className="network-node__label">
              <strong>{book.title}</strong>
              <small>
                {book.availableCopies}/{book.totalCopies} available
              </small>
            </span>
          </button>
        );
      })}

      {books.length === 0 && (
        <div className="network-field__empty">
          <span className="eyebrow">No circulation data</span>

          <h3>The field is quiet.</h3>

          <p>
            Add a book to establish the first node in your library.
          </p>

          <Link to="/add" className="text-link">
            Add a book ↗
          </Link>
        </div>
      )}
    </div>
  );
}
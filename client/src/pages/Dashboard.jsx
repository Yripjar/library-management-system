import { useEffect, useMemo, useState } from 'react';

import {
  Download,
  RefreshCw,
  Search,
  ArrowUpRight,
} from 'lucide-react';

import { Link } from 'react-router-dom';

import api from '../api';
import LibraryNetwork from '../components/LibraryNetwork';

export default function Dashboard() {
  const [books, setBooks] =
    useState([]);

  const [transactions, setTransactions] =
    useState([]);

  const [selectedBook, setSelectedBook] =
    useState(null);

  const [search, setSearch] =
    useState('');

  const [statusFilter, setStatusFilter] =
    useState('');

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      const [
        booksResponse,
        transactionsResponse,
      ] = await Promise.all([
        api.get('/books'),
        api.get('/transactions'),
      ]);

      const freshBooks =
        booksResponse.data || [];

      setBooks(
        freshBooks
      );

      setTransactions(
        transactionsResponse.data ||
          []
      );

      if (selectedBook) {
        const freshSelected =
          freshBooks.find(
            (book) =>
              book._id ===
              selectedBook._id
          );

        setSelectedBook(
          freshSelected || null
        );
      }
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          'Unable to load dashboard data.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* =========================================
     OVERALL LIBRARY STATS
  ========================================= */

  const stats = useMemo(() => {
    const totalCopies =
      books.reduce(
        (sum, book) =>
          sum +
          Number(
            book.totalCopies || 0
          ),
        0
      );

    const availableCopies =
      books.reduce(
        (sum, book) =>
          sum +
          Number(
            book.availableCopies ||
              0
          ),
        0
      );

    const issuedCopies =
      Math.max(
        totalCopies -
          availableCopies,
        0
      );

    const overdue =
      transactions.filter(
        (transaction) =>
          transaction.status ===
            'issued' &&
          transaction.dueDate &&
          new Date(
            transaction.dueDate
          ) < new Date()
      ).length;

    const availability =
      totalCopies > 0
        ? Math.round(
            (availableCopies /
              totalCopies) *
              100
          )
        : 0;

    return {
      titles:
        books.length,
      copies:
        totalCopies,
      available:
        availableCopies,
      issued:
        issuedCopies,
      overdue,
      availability,
    };
  }, [
    books,
    transactions,
  ]);

  /* =========================================
     SELECTED BOOK
  ========================================= */

  const activeBook = useMemo(() => {
    if (!selectedBook) {
      return null;
    }

    return (
      books.find(
        (book) =>
          book._id ===
          selectedBook._id
      ) || null
    );
  }, [
    books,
    selectedBook,
  ]);

  /* =========================================
     SELECTED BOOK STATS
  ========================================= */

  const selectedStats =
    useMemo(() => {
      if (!activeBook) {
        return null;
      }

      const total =
        Number(
          activeBook.totalCopies ||
            0
        );

      const available =
        Number(
          activeBook.availableCopies ||
            0
        );

      const issued =
        Math.max(
          total - available,
          0
        );

      const overdue =
        transactions.filter(
          (transaction) =>
            transaction.book?._id ===
              activeBook._id &&
            transaction.status ===
              'issued' &&
            transaction.dueDate &&
            new Date(
              transaction.dueDate
            ) < new Date()
        ).length;

      const availability =
        total > 0
          ? Math.round(
              (available /
                total) *
                100
            )
          : 0;

      return {
        total,
        available,
        issued,
        overdue,
        availability,
      };
    }, [
      activeBook,
      transactions,
    ]);

  /* =========================================
     TRANSACTION FILTER
  ========================================= */

  const filteredTransactions =
    useMemo(() => {
      let result =
        activeBook
          ? transactions.filter(
              (transaction) =>
                transaction.book?._id ===
                activeBook._id
            )
          : transactions;

      const query =
        search
          .trim()
          .toLowerCase();

      if (query) {
        result =
          result.filter(
            (transaction) =>
              transaction.borrowerName
                ?.toLowerCase()
                .includes(query) ||
              transaction.book?.title
                ?.toLowerCase()
                .includes(query) ||
              transaction.book?.author
                ?.toLowerCase()
                .includes(query)
          );
      }

      if (statusFilter) {
        result =
          result.filter(
            (transaction) =>
              transaction.status ===
              statusFilter
          );
      }

      return [
        ...result,
      ].sort(
        (a, b) =>
          new Date(
            b.issueTimestamp
          ) -
          new Date(
            a.issueTimestamp
          )
      );
    }, [
      transactions,
      activeBook,
      search,
      statusFilter,
    ]);

  /* =========================================
     7 DAY GRAPH
  ========================================= */

  const activity =
    useMemo(() => {
      const days = [];

      const sourceTransactions =
        activeBook
          ? transactions.filter(
              (transaction) =>
                transaction.book?._id ===
                activeBook._id
            )
          : transactions;

      for (
        let i = 6;
        i >= 0;
        i -= 1
      ) {
        const date =
          new Date();

        date.setHours(
          0,
          0,
          0,
          0
        );

        date.setDate(
          date.getDate() -
            i
        );

        const count =
          sourceTransactions.filter(
            (transaction) => {
              if (
                !transaction.issueTimestamp
              ) {
                return false;
              }

              const issueDate =
                new Date(
                  transaction.issueTimestamp
                );

              return (
                issueDate.getFullYear() ===
                  date.getFullYear() &&
                issueDate.getMonth() ===
                  date.getMonth() &&
                issueDate.getDate() ===
                  date.getDate()
              );
            }
          ).length;

        days.push({
          label:
            date.toLocaleDateString(
              undefined,
              {
                weekday:
                  'short',
              }
            ),
          count,
        });
      }

      return days;
    }, [
      transactions,
      activeBook,
    ]);

  const maxActivity =
    Math.max(
      ...activity.map(
        (item) =>
          item.count
      ),
      1
    );

  /* =========================================
     CURRENT DISPLAY NUMBERS
  ========================================= */

  const currentAvailability =
    activeBook
      ? selectedStats?.availability ||
        0
      : stats.availability;

  const currentAvailable =
    activeBook
      ? selectedStats?.available ||
        0
      : stats.available;

  const currentIssued =
    activeBook
      ? selectedStats?.issued ||
        0
      : stats.issued;

  /* =========================================
     EXPORT
  ========================================= */

  const exportCsv =
    async () => {
      try {
        const response =
          await api.get(
            '/transactions/export',
            {
              responseType:
                'blob',
            }
          );

        const blob =
          new Blob(
            [response.data],
            {
              type: 'text/csv',
            }
          );

        const url =
          window.URL.createObjectURL(
            blob
          );

        const link =
          document.createElement(
            'a'
          );

        link.href = url;

        link.download =
          'nexlib-transactions.csv';

        document.body.appendChild(
          link
        );

        link.click();

        link.remove();

        window.URL.revokeObjectURL(
          url
        );
      } catch (err) {
        setError(
          err.response?.data?.message ||
            'Unable to export transactions.'
        );
      }
    };

  return (
    <div className="workspace-page">

      {/* =========================
          HEADER
      ========================= */}

      <header className="workspace-header">

        <div className="workspace-title">

          <span className="eyebrow">
            CONTROL ROOM / LIVE STATE
          </span>

          <h1>
            Library,{' '}
            <em>
              in motion.
            </em>
          </h1>

          {activeBook && (
            <p className="workspace-selection-label">
              Inspecting:{' '}
              <strong>
                {
                  activeBook.title
                }
              </strong>
            </p>
          )}

        </div>

        <div className="workspace-actions">

          {activeBook && (
            <button
              type="button"
              className="utility-link"
              onClick={() =>
                setSelectedBook(
                  null
                )
              }
            >
              Clear selection
            </button>
          )}

          <button
            type="button"
            className="utility-link"
            onClick={
              fetchData
            }
            disabled={loading}
          >
            <RefreshCw
              size={15}
              className={
                loading
                  ? 'is-spinning'
                  : ''
              }
            />

            Refresh
          </button>

          <button
            type="button"
            className="utility-link utility-link--solid"
            onClick={
              exportCsv
            }
          >
            <Download size={15} />

            Export
          </button>

        </div>

      </header>

      {error && (
        <div
          className="workspace-error"
          role="alert"
        >
          {error}
        </div>
      )}

      {loading ? (
        <div className="workspace-loading">

          <div className="loading-line" />

          <span>
            Loading library state...
          </span>

        </div>
      ) : (
        <>

          {/* =========================
              OVERVIEW
          ========================= */}

          <section className="dashboard-overview">

            <div className="overview-item">

              <span className="eyebrow">
                Titles
              </span>

              <strong>
                {stats.titles}
              </strong>

              <small>
                registered titles
              </small>

            </div>

            <div className="overview-item">

              <span className="eyebrow">
                Copies
              </span>

              <strong>
                {stats.copies}
              </strong>

              <small>
                physical copies
              </small>

            </div>

            <div className="overview-item">

              <span className="eyebrow">
                Issued
              </span>

              <strong>
                {stats.issued}
              </strong>

              <small>
                currently circulating
              </small>

            </div>

            <div className="overview-item">

              <span className="eyebrow">
                Overdue
              </span>

              <strong
                className={
                  stats.overdue >
                  0
                    ? 'signal-text'
                    : ''
                }
              >
                {stats.overdue}
              </strong>

              <small>
                require attention
              </small>

            </div>

          </section>

          {/* =========================
              MAIN CONTROL
          ========================= */}

          <section className="dashboard-main">

            <div className="dashboard-network">

              <div className="dashboard-network__header">

                <div>

                  <span className="section-index">
                    01 / LIBRARY FIELD
                  </span>

                  <h2>
                    {activeBook
                      ? activeBook.title
                      : 'Explore the collection.'}
                  </h2>

                  <p className="dashboard-field-subtitle">
                    {activeBook
                      ? 'Live state for the selected title.'
                      : 'Click a title to inspect its live state.'}
                  </p>

                </div>

                <div className="dashboard-availability">

                  <span className="eyebrow">
                    {activeBook
                      ? 'Selected available'
                      : 'Available'}
                  </span>

                  <strong>
                    {
                      currentAvailability
                    }
                    %
                  </strong>

                </div>

              </div>

              <div className="dashboard-network__field">

                <LibraryNetwork
                  books={books}
                  transactions={
                    transactions
                  }
                  selectedId={
                    activeBook?._id
                  }
                  onSelect={
                    setSelectedBook
                  }
                />

              </div>

              <div className="dashboard-network__footer">

                <span>
                  {activeBook
                    ? 'Selected title / live state'
                    : 'Click a title to inspect'}
                </span>

                <span>
                  {
                    currentAvailable
                  }{' '}
                  AVAILABLE /{' '}
                  {
                    currentIssued
                  }{' '}
                  ISSUED
                </span>

              </div>

            </div>

            {/* =====================
                SIDE PANEL
            ===================== */}

            <aside className="dashboard-side">

              <div className="dashboard-side__block dashboard-side__selected">

                <span className="eyebrow">
                  02 / SELECTED TITLE
                </span>

                {activeBook ? (
                  <>

                    <h2>
                      {
                        activeBook.title
                      }
                    </h2>

                    <p>
                      {
                        activeBook.author
                      }
                    </p>

                    <div className="selected-details">

                      <div>
                        <span>
                          Available
                        </span>

                        <strong>
                          {
                            selectedStats?.available
                          }
                        </strong>
                      </div>

                      <div>
                        <span>
                          Issued
                        </span>

                        <strong>
                          {
                            selectedStats?.issued
                          }
                        </strong>
                      </div>

                      <div>
                        <span>
                          Total copies
                        </span>

                        <strong>
                          {
                            selectedStats?.total
                          }
                        </strong>
                      </div>

                      <div>
                        <span>
                          Category
                        </span>

                        <strong>
                          {
                            activeBook.category ||
                            '—'
                          }
                        </strong>
                      </div>

                      <div>
                        <span>
                          ISBN
                        </span>

                        <strong>
                          {
                            activeBook.isbn
                          }
                        </strong>
                      </div>

                      <div>
                        <span>
                          Overdue
                        </span>

                        <strong
                          className={
                            selectedStats
                              ?.overdue >
                            0
                              ? 'signal-text'
                              : ''
                          }
                        >
                          {
                            selectedStats?.overdue
                          }
                        </strong>
                      </div>

                    </div>

                    <Link
                      to="/books"
                      className="text-link"
                    >
                      Open collection
                      <ArrowUpRight
                        size={14}
                      />
                    </Link>

                  </>
                ) : (

                  <div className="selected-empty">

                    <div>
                      +
                    </div>

                    <p>
                      Click any book
                      node to inspect
                      its live state.
                    </p>

                  </div>

                )}

              </div>

              {/* =====================
                  CIRCULATION
              ===================== */}

              <div className="dashboard-side__block">

                <span className="eyebrow">
                  03 / CIRCULATION
                </span>

                <div className="circulation-context">
                  {activeBook
                    ? `${activeBook.title} / last 7 days`
                    : 'Entire library / last 7 days'}
                </div>

                <div className="circulation-summary">

                  <div>

                    <strong>
                      {
                        currentIssued
                      }
                    </strong>

                    <span>
                      issued
                    </span>

                  </div>

                  <div>

                    <strong>
                      {
                        currentAvailable
                      }
                    </strong>

                    <span>
                      available
                    </span>

                  </div>

                </div>

                <div className="activity-chart">

                  {activity.map(
                    (item) => (
                      <div
                        key={
                          item.label
                        }
                        className="activity-column"
                      >

                        <div
                          className="activity-column__bar"
                          style={{
                            height: `${
                              item.count
                                ? Math.max(
                                    (item.count /
                                      maxActivity) *
                                      100,
                                    8
                                  )
                                : 3
                            }%`,
                          }}
                        />

                        <small>
                          {
                            item.label
                          }
                        </small>

                        <span>
                          {
                            item.count
                          }
                        </span>

                      </div>
                    )
                  )}

                </div>

              </div>

            </aside>

          </section>

          {/* =========================
              TRANSACTION LOG
          ========================= */}

          <section className="transaction-strip">

            <header className="transaction-strip__head">

              <div>

                <span className="section-index">
                  04 / TRANSACTION LOG
                </span>

                <h2>
                  Recent movement
                </h2>

                <p className="transaction-context">
                  {activeBook
                    ? `Showing movement for ${activeBook.title}.`
                    : 'Showing movement across the full library.'}
                </p>

              </div>

              <div className="transaction-filters">

                <label className="search-line">

                  <Search
                    size={14}
                  />

                  <input
                    type="search"
                    value={search}
                    onChange={(
                      event
                    ) =>
                      setSearch(
                        event.target.value
                      )
                    }
                    placeholder="Search borrower, title or author"
                  />

                </label>

                <select
                  value={
                    statusFilter
                  }
                  onChange={(
                    event
                  ) =>
                    setStatusFilter(
                      event.target.value
                    )
                  }
                >

                  <option value="">
                    All statuses
                  </option>

                  <option value="issued">
                    Issued
                  </option>

                  <option value="returned">
                    Returned
                  </option>

                </select>

              </div>

            </header>

            <div className="transaction-table">

              <div className="transaction-row transaction-row--head">

                <span>
                  Book
                </span>

                <span>
                  Borrower
                </span>

                <span>
                  Date
                </span>

                <span>
                  Status
                </span>

              </div>

              {filteredTransactions
                .slice(
                  0,
                  10
                )
                .map(
                  (
                    transaction
                  ) => (

                    <div
                      className="transaction-row"
                      key={
                        transaction._id
                      }
                    >

                      <span>

                        <strong>
                          {
                            transaction
                              .book
                              ?.title ||
                            'Unknown book'
                          }
                        </strong>

                        <small>
                          {
                            transaction
                              .book
                              ?.author ||
                            ''
                          }
                        </small>

                      </span>

                      <span>
                        {
                          transaction
                            .borrowerName ||
                          '—'
                        }
                      </span>

                      <span>
                        {
                          transaction
                            .issueTimestamp
                            ? new Date(
                                transaction.issueTimestamp
                              ).toLocaleDateString()
                            : '—'
                        }
                      </span>

                      <span
                        className={
                          transaction.status ===
                          'issued'
                            ? 'signal-text'
                            : ''
                        }
                      >
                        {
                          transaction.status
                        }
                      </span>

                    </div>

                  )
                )}

              {!filteredTransactions.length && (
                <div className="transaction-empty">
                  No transactions match
                  the current filters.
                </div>
              )}

            </div>

          </section>

        </>
      )}

    </div>
  );
}
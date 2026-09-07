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
  const [books, setBooks] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      const [booksResponse, transactionsResponse] =
        await Promise.all([
          api.get('/books'),
          api.get('/transactions'),
        ]);

      setBooks(booksResponse.data || []);
      setTransactions(
        transactionsResponse.data || []
      );
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
  }, []);

  const stats = useMemo(() => {
    const totalCopies = books.reduce(
      (sum, book) =>
        sum + Number(book.totalCopies || 0),
      0
    );

    const availableCopies = books.reduce(
      (sum, book) =>
        sum + Number(book.availableCopies || 0),
      0
    );

    const issuedCopies = Math.max(
      totalCopies - availableCopies,
      0
    );

    const overdue = transactions.filter(
      (transaction) =>
        transaction.status === 'issued' &&
        transaction.dueDate &&
        new Date(transaction.dueDate) < new Date()
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
      titles: books.length,
      copies: totalCopies,
      available: availableCopies,
      issued: issuedCopies,
      overdue,
      availability,
    };
  }, [books, transactions]);

  const filteredTransactions = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    return transactions.filter(
      (transaction) => {
        const matchesStatus =
          !statusFilter ||
          transaction.status === statusFilter;

        const matchesSearch =
          !query ||
          transaction.borrowerName
            ?.toLowerCase()
            .includes(query) ||
          transaction.book?.title
            ?.toLowerCase()
            .includes(query);

        return (
          matchesStatus &&
          matchesSearch
        );
      }
    );
  }, [
    transactions,
    search,
    statusFilter,
  ]);

  const activity = useMemo(() => {
    const days = [];

    for (let i = 6; i >= 0; i -= 1) {
      const date = new Date();

      date.setHours(0, 0, 0, 0);
      date.setDate(
        date.getDate() - i
      );

      const count = transactions.filter(
        (transaction) => {
          if (
            !transaction.issueTimestamp
          ) {
            return false;
          }

          const issuedAt =
            new Date(
              transaction.issueTimestamp
            );

          return (
            issuedAt.getFullYear() ===
              date.getFullYear() &&
            issuedAt.getMonth() ===
              date.getMonth() &&
            issuedAt.getDate() ===
              date.getDate()
          );
        }
      ).length;

      days.push({
        label:
          date.toLocaleDateString(
            undefined,
            {
              weekday: 'short',
            }
          ),
        count,
      });
    }

    return days;
  }, [transactions]);

  const maxActivity = Math.max(
    ...activity.map(
      (item) => item.count
    ),
    1
  );

  const exportCsv = async () => {
    try {
      const response = await api.get(
        '/transactions/export',
        {
          responseType: 'blob',
        }
      );

      const blob = new Blob(
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
        document.createElement('a');

      link.href = url;
      link.download =
        'nexlib-transactions.csv';

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Unable to export transactions.'
      );
    }
  };

  return (
    <div className="workspace-page">
      {/* HEADER */}

      <header className="workspace-header">
        <div className="workspace-title">
          <span className="eyebrow">
            CONTROL ROOM / LIVE STATE
          </span>

          <h1>
            Library, <em>in motion.</em>
          </h1>
        </div>

        <div className="workspace-actions">
          <button
            type="button"
            className="utility-link"
            onClick={fetchData}
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
            onClick={exportCsv}
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
          {/* LIVE OVERVIEW */}

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
                  stats.overdue > 0
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

          {/* MAIN CONTROL AREA */}

          <section className="dashboard-main">
            <div className="dashboard-network">
              <div className="dashboard-network__header">
                <div>
                  <span className="section-index">
                    01 / LIBRARY FIELD
                  </span>

                  <h2>
                    Explore the collection.
                  </h2>
                </div>

                <div className="dashboard-availability">
                  <span className="eyebrow">
                    Available
                  </span>

                  <strong>
                    {stats.availability}%
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
                    selectedBook?._id
                  }
                  onSelect={setSelectedBook}
                />
              </div>

              <div className="dashboard-network__footer">
                <span>
                  Click a title to inspect
                </span>

                <span>
                  {stats.available}{' '}
                  AVAILABLE /{' '}
                  {stats.issued}{' '}
                  ISSUED
                </span>
              </div>
            </div>

            {/* SIDE PANEL */}

            <aside className="dashboard-side">
              <div className="dashboard-side__block dashboard-side__selected">
                <span className="eyebrow">
                  02 / SELECTED TITLE
                </span>

                {selectedBook ? (
                  <>
                    <h2>
                      {selectedBook.title}
                    </h2>

                    <p>
                      {selectedBook.author}
                    </p>

                    <div className="selected-details">
                      <div>
                        <span>
                          Availability
                        </span>

                        <strong>
                          {
                            selectedBook.availableCopies
                          }
                          /
                          {
                            selectedBook.totalCopies
                          }
                        </strong>
                      </div>

                      <div>
                        <span>
                          Category
                        </span>

                        <strong>
                          {
                            selectedBook.category ||
                            '—'
                          }
                        </strong>
                      </div>

                      <div>
                        <span>
                          ISBN
                        </span>

                        <strong>
                          {selectedBook.isbn}
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
                      Click any book node in
                      the field to inspect its
                      live state.
                    </p>
                  </div>
                )}
              </div>

              <div className="dashboard-side__block">
                <span className="eyebrow">
                  03 / CIRCULATION
                </span>

                <div className="circulation-summary">
                  <div>
                    <strong>
                      {stats.issued}
                    </strong>

                    <span>
                      issued
                    </span>
                  </div>

                  <div>
                    <strong>
                      {stats.available}
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
                        key={item.label}
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
                          {item.label}
                        </small>

                        <span>
                          {item.count}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>
            </aside>
          </section>

          {/* TRANSACTION LOG */}

          <section className="transaction-strip">
            <header className="transaction-strip__head">
              <div>
                <span className="section-index">
                  04 / TRANSACTION LOG
                </span>

                <h2>
                  Recent movement
                </h2>
              </div>

              <div className="transaction-filters">
                <label className="search-line">
                  <Search size={14} />

                  <input
                    type="search"
                    value={search}
                    onChange={(event) =>
                      setSearch(
                        event.target.value
                      )
                    }
                    placeholder="Search borrower or title"
                  />
                </label>

                <select
                  value={
                    statusFilter
                  }
                  onChange={(event) =>
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
                .slice(0, 10)
                .map(
                  (transaction) => (
                    <div
                      className="transaction-row"
                      key={
                        transaction._id
                      }
                    >
                      <span>
                        {
                          transaction
                            .book?.title ||
                          'Unknown book'
                        }
                      </span>

                      <span>
                        {
                          transaction.borrowerName ||
                          '—'
                        }
                      </span>

                      <span>
                        {transaction.issueTimestamp
                          ? new Date(
                              transaction.issueTimestamp
                            ).toLocaleDateString()
                          : '—'}
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
                  No transactions match the
                  current filters.
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
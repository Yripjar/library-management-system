import { useEffect, useMemo, useState } from 'react';
import QRCode from 'react-qr-code';
import {
  ArrowUpRight,
  BookOpen,
  Copy,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import api from '../api';

const categories = [
  'Fiction',
  'Literature',
  'Non-Fiction',
  'Biography',
  'History',
  'Philosophy',
  'Psychology',
  'Self Help',
  'Productivity',
  'Science',
  'Technology',
  'Computer Science',
  'Engineering',
  'Business',
  'Finance',
  'Economics',
  'Arts',
  'Design',
  'Travel',
  'Health',
  'Mathematics',
  'Environment',
];

const coverClasses = [
  'catalog-card--olive',
  'catalog-card--sand',
  'catalog-card--rust',
  'catalog-card--blue',
  'catalog-card--plum',
  'catalog-card--stone',
];

export default function Books() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const [query, setQuery] =
    useState('');

  const [category, setCategory] =
    useState('');

  const [availability, setAvailability] =
    useState('');

  const [selectedBook, setSelectedBook] =
    useState(null);

  const [qrBook, setQrBook] =
    useState(null);

  const [editingBook, setEditingBook] =
    useState(null);

  const [editForm, setEditForm] =
    useState(null);

  const [saving, setSaving] =
    useState(false);

  const [copied, setCopied] =
    useState(false);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      setError('');

      const params = {};

      if (query.trim()) {
        params.title =
          query.trim();
      }

      if (category) {
        params.category =
          category;
      }

      if (availability) {
        params.availability =
          availability;
      }

      const response = await api.get(
        '/books',
        { params }
      );

      setBooks(
        response.data || []
      );
    } catch (err) {
      console.error(
        'Load books failed:',
        err
      );

      setError(
        err.response?.data?.message ||
          'Unable to load the collection.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer =
      setTimeout(() => {
        fetchBooks();
      }, 250);

    return () =>
      clearTimeout(timer);
  }, [
    query,
    category,
    availability,
  ]);

  const stats = useMemo(() => {
    const copies = books.reduce(
      (sum, book) =>
        sum +
        Number(
          book.totalCopies || 0
        ),
      0
    );

    const available = books.reduce(
      (sum, book) =>
        sum +
        Number(
          book.availableCopies || 0
        ),
      0
    );

    return {
      titles: books.length,
      copies,
      available,
      issued: Math.max(
        copies - available,
        0
      ),
    };
  }, [books]);

  const openEdit = (book) => {
    setEditingBook(book);

    setEditForm({
      title: book.title || '',
      author: book.author || '',
      isbn: book.isbn || '',
      category:
        book.category || '',
      totalCopies:
        book.totalCopies || 1,
    });
  };

  const saveEdit = async () => {
    if (!editingBook) return;

    try {
      setSaving(true);
      setError('');

      await api.put(
        `/books/${editingBook._id}`,
        {
          ...editForm,
          totalCopies:
            Number(
              editForm.totalCopies
            ),
        }
      );

      setEditingBook(null);
      setEditForm(null);

      await fetchBooks();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Unable to update the book.'
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteBook = async (book) => {
    const confirmed =
      window.confirm(
        `Delete "${book.title}"?`
      );

    if (!confirmed) return;

    try {
      await api.delete(
        `/books/${book._id}`
      );

      if (
        selectedBook?._id ===
        book._id
      ) {
        setSelectedBook(null);
      }

      await fetchBooks();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Unable to delete the book.'
      );
    }
  };

  const copyQr = async () => {
    if (!qrBook?.qrCodeData) return;

    try {
      await navigator.clipboard.writeText(
        qrBook.qrCodeData
      );

      setCopied(true);

      setTimeout(
        () => setCopied(false),
        1500
      );
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="catalog-page">
      <section className="catalog-header">
        <div>
          <span className="catalog-kicker">
            COLLECTION / CATALOGUE
          </span>

          <h1>
            The
            <br />
            <em>collection.</em>
          </h1>

          <p>
            Every title, every copy, one place.
            Search, inspect, edit and manage
            the physical collection.
          </p>
        </div>

        <div className="catalog-header__actions">
          <button
            type="button"
            className="catalog-refresh"
            onClick={fetchBooks}
          >
            <RefreshCw size={15} />
            Refresh
          </button>

          <Link
            to="/add"
            className="catalog-add"
          >
            <Plus size={16} />
            Add title
          </Link>
        </div>
      </section>

      <section className="catalog-stats">
        <div>
          <span>TITLES</span>
          <strong>{stats.titles}</strong>
        </div>

        <div>
          <span>PHYSICAL COPIES</span>
          <strong>{stats.copies}</strong>
        </div>

        <div>
          <span>AVAILABLE</span>
          <strong>{stats.available}</strong>
        </div>

        <div>
          <span>ISSUED</span>
          <strong>{stats.issued}</strong>
        </div>
      </section>

      <section className="catalog-tools">
        <label className="catalog-search">
          <Search size={16} />

          <input
            type="search"
            value={query}
            onChange={(event) =>
              setQuery(
                event.target.value
              )
            }
            placeholder="Search titles..."
          />
        </label>

        <select
          value={category}
          onChange={(event) =>
            setCategory(
              event.target.value
            )
          }
        >
          <option value="">
            All genres
          </option>

          {categories.map(
            (item) => (
              <option
                value={item}
                key={item}
              >
                {item}
              </option>
            )
          )}
        </select>

        <select
          value={availability}
          onChange={(event) =>
            setAvailability(
              event.target.value
            )
          }
        >
          <option value="">
            Any status
          </option>

          <option value="available">
            Available
          </option>

          <option value="issued">
            Issued
          </option>
        </select>
      </section>

      {error && (
        <div className="catalog-error">
          {error}
        </div>
      )}

      {loading ? (
        <div className="catalog-loading">
          <span />
          Loading collection...
        </div>
      ) : books.length === 0 ? (
        <div className="catalog-empty">
          <BookOpen
            size={32}
            strokeWidth={1}
          />

          <span>
            COLLECTION EMPTY
          </span>

          <h2>
            Nothing here yet.
          </h2>

          <p>
            Add your first book and the
            catalogue will begin to take shape.
          </p>

          <Link
            to="/add"
            className="catalog-empty__link"
          >
            Add first title
            <ArrowUpRight size={15} />
          </Link>
        </div>
      ) : (
        <section className="catalog-grid">
          {books.map(
            (book, index) => {
              const available =
                Number(
                  book.availableCopies ||
                    0
                );

              const total =
                Number(
                  book.totalCopies ||
                    0
                );

              const isAvailable =
                available > 0;

              return (
                <article
                  key={book._id}
                  className={`catalog-card ${
                    coverClasses[
                      index %
                        coverClasses.length
                    ]
                  }`}
                  onClick={() =>
                    setSelectedBook(
                      book
                    )
                  }
                >
                  <div className="catalog-card__top">
                    <span>
                      {String(
                        index + 1
                      ).padStart(2, '0')}
                    </span>

                    <span>
                      {book.category}
                    </span>
                  </div>

                  <div className="catalog-cover">
                    <div className="catalog-cover__symbol">
                      <BookOpen
                        size={20}
                        strokeWidth={1.4}
                      />
                    </div>

                    <small>
                      NEXLIB
                    </small>

                    <h2>
                      {book.title}
                    </h2>

                    <p>
                      {book.author}
                    </p>

                    <div className="catalog-cover__rule" />
                  </div>

                  <div className="catalog-card__bottom">
                    <div>
                      <span>
                        STATUS
                      </span>

                      <strong
                        className={
                          isAvailable
                            ? 'is-available'
                            : 'is-issued'
                        }
                      >
                        {isAvailable
                          ? 'Available'
                          : 'Issued'}
                      </strong>
                    </div>

                    <div>
                      <span>
                        COPIES
                      </span>

                      <strong>
                        {available}/{total}
                      </strong>
                    </div>
                  </div>

                  <div className="catalog-card__actions">
                    <button
                      type="button"
                      onClick={(
                        event
                      ) => {
                        event.stopPropagation();
                        setQrBook(
                          book
                        );
                      }}
                    >
                      QR
                    </button>

                    <button
                      type="button"
                      onClick={(
                        event
                      ) => {
                        event.stopPropagation();
                        openEdit(book);
                      }}
                    >
                      <Pencil size={13} />
                    </button>

                    <button
                      type="button"
                      onClick={(
                        event
                      ) => {
                        event.stopPropagation();
                        deleteBook(book);
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </article>
              );
            }
          )}
        </section>
      )}

      {selectedBook && (
        <div
          className="catalog-drawer-backdrop"
          onClick={() =>
            setSelectedBook(null)
          }
        >
          <aside
            className="catalog-drawer"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <button
              type="button"
              className="catalog-drawer__close"
              onClick={() =>
                setSelectedBook(null)
              }
            >
              <X size={18} />
            </button>

            <span className="catalog-kicker">
              TITLE / INSPECTION
            </span>

            <h2>
              {selectedBook.title}
            </h2>

            <p className="catalog-drawer__author">
              {selectedBook.author}
            </p>

            <div className="catalog-drawer__cover">
              <BookOpen
                size={30}
                strokeWidth={1.2}
              />

              <strong>
                {selectedBook.title}
              </strong>

              <span>
                {selectedBook.category}
              </span>
            </div>

            <dl>
              <div>
                <dt>ISBN / ID</dt>
                <dd>
                  {selectedBook.isbn}
                </dd>
              </div>

              <div>
                <dt>Copies</dt>
                <dd>
                  {
                    selectedBook.availableCopies
                  }
                  /
                  {
                    selectedBook.totalCopies
                  }
                </dd>
              </div>

              <div>
                <dt>Status</dt>
                <dd>
                  {
                    selectedBook
                      .availableCopies >
                    0
                    ? 'Available'
                    : 'Issued'
                  }
                </dd>
              </div>

              <div>
                <dt>QR identity</dt>
                <dd>
                  <code>
                    {
                      selectedBook.qrCodeData
                    }
                  </code>
                </dd>
              </div>
            </dl>

            <div className="catalog-drawer__actions">
              <button
                type="button"
                onClick={() => {
                  setQrBook(
                    selectedBook
                  );
                  setSelectedBook(
                    null
                  );
                }}
              >
                Show QR
              </button>

              <button
                type="button"
                onClick={() => {
                  openEdit(
                    selectedBook
                  );
                  setSelectedBook(
                    null
                  );
                }}
              >
                Edit title
              </button>
            </div>
          </aside>
        </div>
      )}

      {qrBook && (
        <div
          className="qr-modal-backdrop"
          onClick={() =>
            setQrBook(null)
          }
        >
          <div
            className="qr-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <button
              type="button"
              className="qr-modal__close"
              onClick={() =>
                setQrBook(null)
              }
            >
              <X size={18} />
            </button>

            <span className="catalog-kicker">
              BOOK IDENTITY
            </span>

            <h2>
              {qrBook.title}
            </h2>

            <div className="qr-modal__code">
              <QRCode
                value={
                  qrBook.qrCodeData
                }
                size={210}
              />
            </div>

            <code className="qr-modal__value">
              {qrBook.qrCodeData}
            </code>

            <button
              type="button"
              className="qr-copy"
              onClick={copyQr}
            >
              <Copy size={14} />

              {copied
                ? 'Copied'
                : 'Copy QR identity'}
            </button>
          </div>
        </div>
      )}

      {editingBook && editForm && (
        <div className="edit-modal-backdrop">
          <div className="edit-modal">
            <div className="edit-modal__head">
              <div>
                <span className="catalog-kicker">
                  MODIFY RECORD
                </span>

                <h2>
                  Edit title
                </h2>
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditingBook(
                    null
                  );
                  setEditForm(
                    null
                  );
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="edit-fields">
              <input
                value={editForm.title}
                onChange={(event) =>
                  setEditForm({
                    ...editForm,
                    title:
                      event.target.value,
                  })
                }
                placeholder="Title"
              />

              <input
                value={editForm.author}
                onChange={(event) =>
                  setEditForm({
                    ...editForm,
                    author:
                      event.target.value,
                  })
                }
                placeholder="Author"
              />

              <input
                value={editForm.isbn}
                onChange={(event) =>
                  setEditForm({
                    ...editForm,
                    isbn:
                      event.target.value,
                  })
                }
                placeholder="ISBN / Book ID"
              />

              <select
                value={
                  editForm.category
                }
                onChange={(event) =>
                  setEditForm({
                    ...editForm,
                    category:
                      event.target.value,
                  })
                }
              >
                <option value="">
                  Select category
                </option>

                {categories.map(
                  (item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  )
                )}
              </select>

              <input
                type="number"
                min="1"
                value={
                  editForm.totalCopies
                }
                onChange={(event) =>
                  setEditForm({
                    ...editForm,
                    totalCopies:
                      Number(
                        event.target
                          .value
                      ),
                  })
                }
                placeholder="Copies"
              />
            </div>

            <button
              type="button"
              className="edit-modal__save"
              disabled={saving}
              onClick={saveEdit}
            >
              {saving
                ? 'Saving...'
                : 'Save changes'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
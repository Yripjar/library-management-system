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
  Upload,
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

const isValidIsbn = (value) => {
  const cleaned = String(value || '')
    .replace(/[-\s]/g, '')
    .toUpperCase();

  return (
    /^\d{9}[\dX]$/.test(cleaned) ||
    /^\d{13}$/.test(cleaned)
  );
};

/*
  Bulk import supports:
  - TAB separated data from Excel / Google Sheets
  - CSV data
  - quoted CSV values
*/

const parseDelimitedLine = (line, delimiter) => {
  const values = [];
  let current = '';
  let insideQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (char === '"') {
      if (
        insideQuotes &&
        line[i + 1] === '"'
      ) {
        current += '"';
        i += 1;
      } else {
        insideQuotes = !insideQuotes;
      }

      continue;
    }

    if (
      char === delimiter &&
      !insideQuotes
    ) {
      values.push(current.trim());
      current = '';
      continue;
    }

    current += char;
  }

  values.push(current.trim());

  return values;
};

const parseBulkText = (text) => {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (!lines.length) {
    return [];
  }

  const delimiter = lines[0].includes('\t')
    ? '\t'
    : ',';

  let rows = lines.map((line) =>
    parseDelimitedLine(
      line,
      delimiter
    )
  );

  const firstRow = rows[0].map((value) =>
    value.toLowerCase()
  );

  const hasHeader =
    firstRow.some(
      (value) =>
        value === 'title' ||
        value === 'book title'
    ) &&
    firstRow.some(
      (value) =>
        value === 'author' ||
        value === 'writer'
    );

  if (hasHeader) {
    rows = rows.slice(1);
  }

  return rows
    .map((row, index) => ({
      rowNumber:
        index + (hasHeader ? 2 : 1),
      title: row[0] || '',
      author: row[1] || '',
      isbn: row[2] || '',
      category: row[3] || '',
      totalCopies: Number(row[4] || 0),
    }))
    .filter(
      (row) =>
        row.title ||
        row.author ||
        row.isbn ||
        row.category
    );
};

export default function Books() {
  const [books, setBooks] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const [query, setQuery] =
    useState('');

  const [searchField, setSearchField] =
    useState('title');

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

  const [bulkOpen, setBulkOpen] =
    useState(false);

  const [bulkText, setBulkText] =
    useState('');

  const [bulkRows, setBulkRows] =
    useState([]);

  const [bulkImporting, setBulkImporting] =
    useState(false);

  const [bulkResult, setBulkResult] =
    useState(null);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      setError('');

      const params = {};

      if (query.trim()) {
        if (searchField === 'author') {
          params.author =
            query.trim();
        } else {
          params.title =
            query.trim();
        }
      }

      if (category) {
        params.category =
          category;
      }

      const response = await api.get(
        '/books',
        { params }
      );

      let loadedBooks =
        response.data || [];

      /*
        We filter availability locally so that
        we can distinguish:

        Available
        Partially issued
        Fully issued
      */

      if (availability) {
        loadedBooks =
          loadedBooks.filter(
            (book) => {
              const available =
                Number(
                  book.availableCopies || 0
                );

              const total =
                Number(
                  book.totalCopies || 0
                );

              if (
                availability ===
                'available'
              ) {
                return available > 0;
              }

              if (
                availability ===
                'partial'
              ) {
                return (
                  available > 0 &&
                  available < total
                );
              }

              if (
                availability ===
                'issued'
              ) {
                return available <= 0;
              }

              return true;
            }
          );
      }

      setBooks(
        loadedBooks
      );

      if (selectedBook) {
        const freshSelected =
          loadedBooks.find(
            (book) =>
              book._id ===
              selectedBook._id
          );

        setSelectedBook(
          freshSelected || null
        );
      }
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
      setTimeout(
        () => {
          fetchBooks();
        },
        250
      );

    return () =>
      clearTimeout(timer);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    query,
    searchField,
    category,
    availability,
  ]);

  const stats = useMemo(() => {
    const copies =
      books.reduce(
        (sum, book) =>
          sum +
          Number(
            book.totalCopies || 0
          ),
        0
      );

    const available =
      books.reduce(
        (sum, book) =>
          sum +
          Number(
            book.availableCopies || 0
          ),
        0
      );

    return {
      titles:
        books.length,
      copies,
      available,
      issued: Math.max(
        copies -
          available,
        0
      ),
    };
  }, [books]);

  const openEdit = (book) => {
    setEditingBook(book);

    setEditForm({
      title:
        book.title || '',
      author:
        book.author || '',
      isbn:
        book.isbn || '',
      category:
        book.category || '',
      totalCopies:
        book.totalCopies || 1,
    });
  };

  const saveEdit =
    async () => {
      if (!editingBook) {
        return;
      }

      try {
        setSaving(true);
        setError('');

        if (
          !editForm.title.trim() ||
          !editForm.author.trim() ||
          !editForm.isbn.trim() ||
          !editForm.category
        ) {
          setError(
            'Please complete every book field.'
          );
          setSaving(false);
          return;
        }

        if (
          !isValidIsbn(
            editForm.isbn
          )
        ) {
          setError(
            'ISBN / Book ID must be a valid ISBN-10 or ISBN-13.'
          );
          setSaving(false);
          return;
        }

        if (
          Number(
            editForm.totalCopies
          ) < 1
        ) {
          setError(
            'Total copies must be at least 1.'
          );
          setSaving(false);
          return;
        }

        await api.put(
          `/books/${editingBook._id}`,
          {
            title:
              editForm.title.trim(),
            author:
              editForm.author.trim(),
            isbn:
              editForm.isbn.trim(),
            category:
              editForm.category,
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

  const deleteBook =
    async (book) => {
      const confirmed =
        window.confirm(
          `Delete "${book.title}"?`
        );

      if (!confirmed) {
        return;
      }

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

  const copyQr =
    async () => {
      if (
        !qrBook?.qrCodeData
      ) {
        return;
      }

      try {
        await navigator.clipboard.writeText(
          qrBook.qrCodeData
        );

        setCopied(true);

        setTimeout(
          () =>
            setCopied(false),
          1500
        );
      } catch {
        setCopied(false);
      }
    };

  /*
    BULK IMPORT
  */

  const prepareBulkImport =
    () => {
      setBulkResult(null);

      const rows =
        parseBulkText(
          bulkText
        );

      setBulkRows(rows);

      if (!rows.length) {
        setBulkResult({
          type: 'error',
          message:
            'No rows found. Paste your book data first.',
        });

        return;
      }

      setBulkResult({
        type: 'preview',
        message: `${rows.length} book ${
          rows.length === 1
            ? 'row'
            : 'rows'
        } detected.`,
      });
    };

  const importBulkBooks =
    async () => {
      if (!bulkRows.length) {
        prepareBulkImport();
        return;
      }

      const validRows = [];
      const errors = [];

      bulkRows.forEach(
        (row) => {
          if (
            !row.title.trim() ||
            !row.author.trim() ||
            !row.isbn.trim() ||
            !row.category.trim() ||
            !Number.isInteger(
              row.totalCopies
            ) ||
            row.totalCopies < 1
          ) {
            errors.push(
              `Row ${row.rowNumber}: missing or invalid field.`
            );
            return;
          }

          if (
            !isValidIsbn(
              row.isbn
            )
          ) {
            errors.push(
              `Row ${row.rowNumber}: invalid ISBN ${row.isbn}.`
            );
            return;
          }

          validRows.push(row);
        }
      );

      if (!validRows.length) {
        setBulkResult({
          type: 'error',
          message:
            errors.join(' '),
        });

        return;
      }

      try {
        setBulkImporting(true);

        /*
          Send valid rows in parallel.
          Each successful request still uses
          the normal /books endpoint, so the
          backend generates a unique QR code.
        */

        const results =
          await Promise.allSettled(
            validRows.map(
              (row) =>
                api.post(
                  '/books',
                  {
                    title:
                      row.title.trim(),
                    author:
                      row.author.trim(),
                    isbn:
                      row.isbn.trim(),
                    category:
                      row.category.trim(),
                    totalCopies:
                      Number(
                        row.totalCopies
                      ),
                  }
                )
            )
          );

        const succeeded =
          results.filter(
            (result) =>
              result.status ===
              'fulfilled'
          ).length;

        const failed =
          results.length -
          succeeded;

        const serverErrors =
          results
            .map(
              (
                result,
                index
              ) => ({
                result,
                row:
                  validRows[
                    index
                  ],
              })
            )
            .filter(
              (item) =>
                item.result
                  .status ===
                'rejected'
            )
            .map(
              (item) =>
                `Row ${item.row.rowNumber}: ${
                  item.result
                    .reason
                    ?.response
                    ?.data
                    ?.message ||
                  item.result
                    .reason
                    ?.response
                    ?.data
                    ?.errors?.[0]
                    ?.msg ||
                  'Import failed.'
                }`
            );

        const allErrors = [
          ...errors,
          ...serverErrors,
        ];

        setBulkResult({
          type:
            succeeded ===
              validRows.length &&
            allErrors.length ===
              0
              ? 'success'
              : 'partial',

          message:
            `${succeeded} imported successfully${
              failed
                ? `, ${failed} failed`
                : ''
            }.${
              allErrors.length
                ? ` ${allErrors
                    .slice(
                      0,
                      5
                    )
                    .join(
                      ' '
                    )}`
                : ''
            }`,
        });

        await fetchBooks();

        if (
          succeeded > 0 &&
          failed === 0 &&
          errors.length === 0
        ) {
          setBulkText('');
          setBulkRows([]);
        }
      } catch (err) {
        setBulkResult({
          type: 'error',
          message:
            err.response?.data
              ?.message ||
            'Bulk import failed.',
        });
      } finally {
        setBulkImporting(
          false
        );
      }
    };

  return (
    <div className="catalog-page">

      {/* =========================
          HEADER
      ========================= */}

      <section className="catalog-header">
        <div>
          <span className="catalog-kicker">
            COLLECTION / CATALOGUE
          </span>

          <h1>
            The
            <br />
            <em>
              collection.
            </em>
          </h1>

          <p>
            Every title, every copy,
            one place. Search,
            inspect, edit and manage
            the physical collection.
          </p>
        </div>

        <div className="catalog-header__actions">

          <button
            type="button"
            className="catalog-refresh"
            onClick={
              fetchBooks
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
            className="catalog-bulk"
            onClick={() => {
              setBulkOpen(
                true
              );
              setBulkResult(
                null
              );
            }}
          >
            <Upload size={15} />
            Bulk import
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

      {/* =========================
          STATS
      ========================= */}

      <section className="catalog-stats">

        <div>
          <span>
            TITLES
          </span>

          <strong>
            {stats.titles}
          </strong>
        </div>

        <div>
          <span>
            PHYSICAL COPIES
          </span>

          <strong>
            {stats.copies}
          </strong>
        </div>

        <div>
          <span>
            AVAILABLE
          </span>

          <strong>
            {stats.available}
          </strong>
        </div>

        <div>
          <span>
            ISSUED
          </span>

          <strong>
            {stats.issued}
          </strong>
        </div>

      </section>

      {/* =========================
          SEARCH / FILTERS
      ========================= */}

      <section className="catalog-tools">

        <div className="catalog-search-group">

          <div className="catalog-search-mode">

            <span>
              SEARCH BY
            </span>

            <select
              value={
                searchField
              }
              onChange={(event) =>
                setSearchField(
                  event.target.value
                )
              }
            >
              <option value="title">
                Title
              </option>

              <option value="author">
                Author
              </option>
            </select>

          </div>

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
              placeholder={
                searchField ===
                'author'
                  ? 'Search authors...'
                  : 'Search titles...'
              }
            />
          </label>

        </div>

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
          value={
            availability
          }
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

          <option value="partial">
            Partially issued
          </option>

          <option value="issued">
            Fully issued
          </option>
        </select>

      </section>

      {/* ERROR */}

      {error && (
        <div className="catalog-error">
          {error}
        </div>
      )}

      {/* =========================
          BOOK COLLECTION
      ========================= */}

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
            No books match the
            current filters.
          </p>

          <Link
            to="/add"
            className="catalog-empty__link"
          >
            Add first title
            <ArrowUpRight
              size={15}
            />
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

              const status =
                available <= 0
                  ? 'Fully issued'
                  : available <
                      total
                  ? 'Partially issued'
                  : 'Available';

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
                      ).padStart(
                        2,
                        '0'
                      )}
                    </span>

                    <span>
                      {book.category}
                    </span>

                  </div>

                  <div className="catalog-cover">

                    <div className="catalog-cover__symbol">
                      <BookOpen
                        size={20}
                        strokeWidth={
                          1.4
                        }
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
                          available >
                          0
                            ? 'is-available'
                            : 'is-issued'
                        }
                      >
                        {status}
                      </strong>

                    </div>

                    <div>

                      <span>
                        COPIES
                      </span>

                      <strong>
                        {available}/
                        {total}
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

                        openEdit(
                          book
                        );
                      }}
                    >
                      <Pencil
                        size={13}
                      />
                    </button>

                    <button
                      type="button"
                      onClick={(
                        event
                      ) => {
                        event.stopPropagation();

                        deleteBook(
                          book
                        );
                      }}
                    >
                      <Trash2
                        size={13}
                      />
                    </button>

                  </div>

                </article>
              );
            }
          )}

        </section>
      )}

      {/* =========================
          DETAIL DRAWER
      ========================= */}

      {selectedBook && (
        <div
          className="catalog-drawer-backdrop"
          onClick={() =>
            setSelectedBook(
              null
            )
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
                setSelectedBook(
                  null
                )
              }
            >
              <X size={18} />
            </button>

            <span className="catalog-kicker">
              TITLE / INSPECTION
            </span>

            <h2>
              {
                selectedBook.title
              }
            </h2>

            <p className="catalog-drawer__author">
              {
                selectedBook.author
              }
            </p>

            <div className="catalog-drawer__cover">

              <BookOpen
                size={30}
                strokeWidth={1.2}
              />

              <strong>
                {
                  selectedBook.title
                }
              </strong>

              <span>
                {
                  selectedBook.category
                }
              </span>

            </div>

            <dl>

              <div>
                <dt>
                  ISBN / ID
                </dt>

                <dd>
                  {
                    selectedBook.isbn
                  }
                </dd>
              </div>

              <div>
                <dt>
                  Copies
                </dt>

                <dd>
                  {
                    selectedBook
                      .availableCopies
                  }
                  /
                  {
                    selectedBook
                      .totalCopies
                  }
                </dd>
              </div>

              <div>
                <dt>
                  Available
                </dt>

                <dd>
                  {
                    selectedBook
                      .availableCopies
                  }
                </dd>
              </div>

              <div>
                <dt>
                  Issued
                </dt>

                <dd>
                  {Math.max(
                    Number(
                      selectedBook
                        .totalCopies ||
                        0
                    ) -
                      Number(
                        selectedBook
                          .availableCopies ||
                          0
                      ),
                    0
                  )}
                </dd>
              </div>

              <div>
                <dt>
                  Status
                </dt>

                <dd>
                  {Number(
                    selectedBook
                      .availableCopies ||
                      0
                  ) <= 0
                    ? 'Fully issued'
                    : Number(
                        selectedBook
                          .availableCopies ||
                          0
                      ) <
                      Number(
                        selectedBook
                          .totalCopies ||
                          0
                      )
                    ? 'Partially issued'
                    : 'Available'}
                </dd>
              </div>

              <div>
                <dt>
                  QR identity
                </dt>

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

      {/* =========================
          QR MODAL
      ========================= */}

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
              {
                qrBook.title
              }
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
              {
                qrBook.qrCodeData
              }
            </code>

            <button
              type="button"
              className="qr-copy"
              onClick={
                copyQr
              }
            >
              <Copy size={14} />

              {copied
                ? 'Copied'
                : 'Copy QR identity'}
            </button>

          </div>

        </div>
      )}

      {/* =========================
          EDIT MODAL
      ========================= */}

      {editingBook &&
        editForm && (
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
                  value={
                    editForm.title
                  }
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
                  value={
                    editForm.author
                  }
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
                  value={
                    editForm.isbn
                  }
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

              {error && (
                <div className="edit-modal__error">
                  {error}
                </div>
              )}

              <button
                type="button"
                className="edit-modal__save"
                disabled={saving}
                onClick={
                  saveEdit
                }
              >
                {saving
                  ? 'Saving...'
                  : 'Save changes'}
              </button>

            </div>

          </div>
        )}

      {/* =========================
          BULK IMPORT MODAL
      ========================= */}

      {bulkOpen && (
        <div
          className="bulk-modal-backdrop"
          onClick={() =>
            !bulkImporting &&
            setBulkOpen(false)
          }
        >

          <div
            className="bulk-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="bulk-modal__head">

              <div>

                <span className="catalog-kicker">
                  COLLECTION / FAST ENTRY
                </span>

                <h2>
                  Bulk import books.
                </h2>

                <p>
                  Paste multiple
                  books at once.
                  Every successful
                  book receives a
                  unique QR identity.
                </p>

              </div>

              <button
                type="button"
                disabled={
                  bulkImporting
                }
                onClick={() =>
                  setBulkOpen(
                    false
                  )
                }
              >
                <X size={18} />
              </button>

            </div>

            <div className="bulk-format">

              <strong>
                FORMAT
              </strong>

              <code>
                Title | Author | ISBN | Category | Total Copies
              </code>

              <small>
                TAB-separated data
                copied from Excel or
                Google Sheets works best.
              </small>

            </div>

            <textarea
              value={bulkText}
              disabled={
                bulkImporting
              }
              onChange={(event) => {
                setBulkText(
                  event.target.value
                );

                setBulkRows([]);

                setBulkResult(
                  null
                );
              }}
              placeholder={`Title\tAuthor\tISBN\tCategory\tTotal Copies
Atomic Habits\tJames Clear\t9781847941831\tSelf Help\t5
Clean Code\tRobert C. Martin\t9780132350884\tTechnology\t4
Sapiens\tYuval Noah Harari\t9780062316097\tHistory\t3`}
            />

            {bulkResult && (
              <div
                className={`bulk-result bulk-result--${bulkResult.type}`}
              >
                {
                  bulkResult.message
                }
              </div>
            )}

            {bulkRows.length >
              0 && (
              <div className="bulk-preview">

                <div className="bulk-preview__head">

                  <span>
                    PREVIEW
                  </span>

                  <strong>
                    {
                      bulkRows.length
                    }{' '}
                    rows
                  </strong>

                </div>

                <div className="bulk-preview__list">

                  {bulkRows
                    .slice(
                      0,
                      10
                    )
                    .map(
                      (
                        row
                      ) => (
                        <div
                          key={
                            row.rowNumber
                          }
                        >

                          <span>
                            {
                              row.rowNumber
                            }
                          </span>

                          <strong>
                            {
                              row.title
                            }
                          </strong>

                          <small>
                            {
                              row.author
                            }{' '}
                            ·{' '}
                            {
                              row.totalCopies
                            }{' '}
                            copies
                          </small>

                        </div>
                      )
                    )}

                </div>

                {bulkRows.length >
                  10 && (
                  <small className="bulk-more">
                    +
                    {bulkRows.length -
                      10}{' '}
                    more rows
                  </small>
                )}

              </div>
            )}

            <div className="bulk-modal__actions">

              <button
                type="button"
                disabled={
                  bulkImporting
                }
                onClick={
                  prepareBulkImport
                }
              >
                Preview rows
              </button>

              <button
                type="button"
                disabled={
                  bulkImporting ||
                  !bulkRows.length
                }
                onClick={
                  importBulkBooks
                }
              >
                {bulkImporting
                  ? 'Importing...'
                  : `Import ${
                      bulkRows.length ||
                      ''
                    } books`}
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
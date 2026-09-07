import { useState, useEffect, useRef } from 'react';
import api from '../api';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import QRCode from 'react-qr-code';

gsap.registerPlugin(ScrollTrigger);

export default function BookList() {
  const [books, setBooks] = useState([]);
  const [filters, setFilters] = useState({ title: '', author: '', category: '', availability: '' });
  const [loading, setLoading] = useState(false);
  const [qrBook, setQrBook] = useState(null);
  const cardRefs = useRef([]);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.title) params.title = filters.title;
      if (filters.author) params.author = filters.author;
      if (filters.category) params.category = filters.category;
      if (filters.availability) params.availability = filters.availability;
      const res = await api.get('/books', { params });
      setBooks(res.data);
    } catch (err) {
      alert('Error fetching books');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [filters]);

  useEffect(() => {
    if (books.length && cardRefs.current.length) {
      gsap.fromTo(
        cardRefs.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, stagger: 0.1, duration: 0.6, ease: 'power3.out', overwrite: 'auto' }
      );
    }
  }, [books]);

  const handleDelete = async (id) => {
    if (window.confirm('Delete this book?')) {
      try {
        await api.delete(`/books/${id}`);
        fetchBooks();
      } catch (err) {
        alert('Delete failed');
      }
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <h2 className="text-4xl font-extrabold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
          Library Books
        </h2>
        <button
          onClick={fetchBooks}
          className="mt-4 md:mt-0 px-6 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <input
          className="bg-slate-800/80 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-slate-400"
          placeholder="🔍 Title"
          value={filters.title}
          onChange={(e) => setFilters({ ...filters, title: e.target.value })}
        />
        <input
          className="bg-slate-800/80 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-slate-400"
          placeholder="✍️ Author"
          value={filters.author}
          onChange={(e) => setFilters({ ...filters, author: e.target.value })}
        />
        <input
          className="bg-slate-800/80 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-slate-400"
          placeholder="🏷️ Category"
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
        />
        <select
          className="bg-slate-800/80 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500 text-white"
          value={filters.availability}
          onChange={(e) => setFilters({ ...filters, availability: e.target.value })}
        >
          <option value="">All</option>
          <option value="available">✅ Available</option>
          <option value="issued">📤 Issued</option>
        </select>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Book Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {books.map((book, i) => (
          <div
            key={book._id}
            ref={(el) => (cardRefs.current[i] = el)}
            className="bg-slate-800/80 backdrop-blur rounded-xl p-6 shadow-lg hover:shadow-purple-500/20 hover:-translate-y-1 transition-all duration-300"
          >
            <div className="flex justify-between items-start">
              <h3 className="text-xl font-semibold text-white">{book.title}</h3>
              <span
                className={`badge text-xs font-medium px-3 py-1 rounded-full ${
                  book.availableCopies > 0
                    ? 'bg-green-500/20 text-green-300'
                    : 'bg-red-500/20 text-red-300'
                }`}
              >
                {book.availableCopies} / {book.totalCopies}
              </span>
            </div>
            <p className="text-slate-400 mt-1">{book.author}</p>
            <p className="text-slate-500 text-sm mt-1">ISBN: {book.isbn}</p>
            <span className="inline-block mt-3 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-sm">
              {book.category}
            </span>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setQrBook(book)}
                className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium transition-colors"
              >
                📱 QR
              </button>
              <button
                onClick={() => handleDelete(book._id)}
                className="px-4 py-2 rounded-lg bg-red-900/60 hover:bg-red-800 text-red-200 text-sm font-medium transition-colors"
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {!loading && books.length === 0 && (
        <div className="text-center py-12 text-slate-500">No books found.</div>
      )}

      {/* QR Modal */}
      {qrBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl border border-slate-700">
            <div className="flex justify-between items-center mb-4">
              <h5 className="text-lg font-semibold text-white">QR Code – {qrBook.title}</h5>
              <button
                onClick={() => setQrBook(null)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="flex flex-col items-center gap-4">
              <QRCode value={qrBook.qrCodeData} size={200} />
              <p className="text-xs text-slate-500 break-all text-center">{qrBook.qrCodeData}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
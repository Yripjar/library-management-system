import { useState } from 'react';
import api from '../api';
import gsap from 'gsap';

export default function BookForm() {
  const [form, setForm] = useState({ title: '', author: '', isbn: '', category: '', totalCopies: 1 });
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/books', { ...form, totalCopies: Number(form.totalCopies) });
      setSuccess(true);
      gsap.fromTo('.success-toast', { scale: 0.5, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6, ease: 'back.out' });
      setTimeout(() => setSuccess(false), 2000);
      setForm({ title: '', author: '', isbn: '', category: '', totalCopies: 1 });
    } catch (err) {
      alert(err.response?.data?.message || 'Error');
    }
  };

  return (
    <div className="max-w-xl mx-auto p-8">
      <h2 className="text-4xl font-bold mb-8">Add New Book</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative">
          <input className="peer w-full bg-slate-800 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500 text-white" name="title" value={form.title} onChange={handleChange} required placeholder="" />
          <label className="absolute left-3 -top-2.5 bg-slate-900 px-1 text-sm text-slate-400 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-purple-400">
            Title
          </label>
        </div>
        {/* Repeat for other fields */}
        <button type="submit" className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-semibold hover:scale-[1.02] transition-transform">
          Add Book
        </button>
      </form>
      {success && <div className="success-toast fixed bottom-5 right-5 bg-green-500 text-white px-6 py-3 rounded-lg shadow-xl">Book added!</div>}
    </div>
  );
}
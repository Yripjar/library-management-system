import { useState, useEffect } from 'react';
import api from '../api';

function AdminDashboard() {
  const [stats, setStats] = useState({ totalBooks: 0, availableBooks: 0, issuedBooks: 0, overdueBooks: 0 });
  const [transactions, setTransactions] = useState([]);
  const [filterStatus, setFilterStatus] = useState('');

  const fetchStats = async () => {
    try {
      const booksRes = await api.get('/books');
      const transRes = await api.get('/transactions');

      const total = booksRes.data.length;
      const available = booksRes.data.filter(b => b.availableCopies > 0).length;
      const issued = total - available;
      const overdue = transRes.data.filter(
        t => t.status === 'issued' && t.dueDate && new Date(t.dueDate) < new Date()
      ).length;

      setStats({
        totalBooks: total,
        availableBooks: available,
        issuedBooks: issued,
        overdueBooks: overdue,
      });
      setTransactions(transRes.data);
    } catch (err) {
      alert('Error loading dashboard');
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleExport = async () => {
    try {
      const res = await api.get('/transactions/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'transactions.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Export failed');
    }
  };

  const filteredTransactions = filterStatus
    ? transactions.filter(t => t.status === filterStatus)
    : transactions;

  return (
    <div>
      <h2 className="mb-4">Admin Dashboard</h2>

      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card text-white bg-primary">
            <div className="card-body">
              <h5 className="card-title">Total Books</h5>
              <h2>{stats.totalBooks}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-white bg-success">
            <div className="card-body">
              <h5 className="card-title">Available</h5>
              <h2>{stats.availableBooks}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-white bg-warning">
            <div className="card-body">
              <h5 className="card-title">Issued</h5>
              <h2>{stats.issuedBooks}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-white bg-danger">
            <div className="card-body">
              <h5 className="card-title">Overdue</h5>
              <h2>{stats.overdueBooks}</h2>
            </div>
          </div>
        </div>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <button className="btn btn-success" onClick={handleExport}>Export CSV</button>
        <select
          className="form-select"
          style={{ width: 'auto' }}
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">All Transactions</option>
          <option value="issued">Issued</option>
          <option value="returned">Returned</option>
        </select>
      </div>

      <div className="table-responsive">
        <table className="table table-striped table-hover">
          <thead className="table-dark">
            <tr>
              <th>Book Title</th>
              <th>Author</th>
              <th>Borrower</th>
              <th>Issue Time</th>
              <th>Return Time</th>
              <th>Status</th>
              <th>Overdue Days</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((t) => {
              const overdueDays = t.status === 'issued' && t.dueDate && new Date(t.dueDate) < new Date()
                ? Math.floor((new Date() - new Date(t.dueDate)) / (1000 * 60 * 60 * 24))
                : 0;
              return (
                <tr key={t._id}>
                  <td>{t.book?.title}</td>
                  <td>{t.book?.author}</td>
                  <td>{t.borrowerName}</td>
                  <td>{new Date(t.issueTimestamp).toLocaleString()}</td>
                  <td>{t.returnTimestamp ? new Date(t.returnTimestamp).toLocaleString() : '-'}</td>
                  <td>
                    <span className={`badge ${t.status === 'issued' ? 'bg-warning text-dark' : 'bg-success'}`}>
                      {t.status}
                    </span>
                  </td>
                  <td>
                    {overdueDays > 0 ? <span className="text-danger fw-bold">{overdueDays} days</span> : '-'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminDashboard;
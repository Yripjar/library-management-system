import {
  Routes,
  Route,
  useLocation,
} from 'react-router-dom';

import Navbar from './components/Navbar';

import Landing from './pages/Landing';
import Books from './pages/Books';
import AddBook from './pages/AddBook';
import QRScanner from './pages/QRScanner';
import Dashboard from './pages/Dashboard';
import IssueReturn from './pages/IssueReturn';

export default function App() {
  const location = useLocation();

  return (
    <div className="app-shell">
      <Navbar />

      <main
        key={location.pathname}
        className="page-transition"
      >
        <Routes location={location}>
          <Route
            path="/"
            element={<Landing />}
          />

          <Route
            path="/books"
            element={<Books />}
          />

          <Route
            path="/add"
            element={<AddBook />}
          />

          <Route
            path="/scan"
            element={<QRScanner />}
          />

          <Route
            path="/issue"
            element={<IssueReturn />}
          />

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />
        </Routes>
      </main>
    </div>
  );
}
import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 28);

    handleScroll();
    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const links = [
    { to: '/books', label: 'Collection' },
    { to: '/scan', label: 'Scan' },
    { to: '/dashboard', label: 'Control room' },
  ];

  return (
    <header className={`site-nav ${scrolled ? 'site-nav--scrolled' : ''}`}>
      <div className="site-nav__inner">
        <Link to="/" className="brand" aria-label="NexLib home">
          <span className="brand__mark" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>

          <span className="brand__word">NexLib</span>
        </Link>

        <nav className="site-nav__links" aria-label="Primary">
          {links.map((link) => {
            const active = location.pathname === link.to;

            return (
              <Link
                key={link.to}
                to={link.to}
                className={`site-nav__link ${active ? 'is-active' : ''}`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="site-nav__actions">
          <Link to="/add" className="nav-add">
            Add book <span>+</span>
          </Link>

          <button
            type="button"
            className="nav-menu"
            onClick={() => setMobileOpen((value) => !value)}
            aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={mobileOpen}
          >
            <span />
            <span />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="site-nav__mobile" aria-label="Mobile primary">
          {[...links, { to: '/add', label: 'Add book' }].map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={location.pathname === link.to ? 'is-active' : ''}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
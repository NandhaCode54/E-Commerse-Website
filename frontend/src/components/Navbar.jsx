import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';

/**
 * Top navigation: brand, search, cart and account menu.
 */
const Navbar = () => {
  const { getCartItemCount } = useCart();
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const cartCount = getCartItemCount();

  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/?q=${encodeURIComponent(q)}` : '/');
  };

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-ink-950 via-ink-900 to-brand-900 text-white shadow-lg">
      <div className="container mx-auto flex items-center gap-3 px-4 py-2.5 md:gap-6">
        {/* Brand */}
        <Link to="/" className="flex shrink-0 items-center">
          <Logo light />
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} className="relative flex-1 max-w-2xl">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for products, brands and more"
            className="w-full rounded-full border-0 py-2.5 pl-5 pr-12 text-sm text-gray-800 placeholder-gray-400 outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-accent-400"
          />
          <button
            type="submit"
            aria-label="Search"
            className="absolute right-1 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-brand-600 text-white transition hover:bg-brand-500"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z" />
            </svg>
          </button>
        </form>

        {/* Right side */}
        <div className="flex shrink-0 items-center gap-1 md:gap-2">
          {isAdmin && (
            <Link
              to="/admin"
              className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-white/90 hover:bg-white/10 sm:block"
            >
              Admin
            </Link>
          )}

          {user ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-semibold hover:bg-white/10"
              >
                <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-accent-500 text-xs font-bold uppercase">
                  {user.name?.charAt(0) || 'U'}
                </span>
                <span className="hidden max-w-[8rem] truncate md:block">{user.name}</span>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl bg-white py-1 text-gray-700 shadow-2xl ring-1 ring-black/5">
                  <div className="border-b border-gray-100 px-4 py-3">
                    <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                    <p className="truncate text-xs text-gray-500">{user.email}</p>
                    <span className="mt-1 inline-block rounded bg-brand-50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-700">
                      {user.role}
                    </span>
                  </div>
                  {isAdmin && (
                    <Link to="/admin" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 text-sm hover:bg-brand-50">
                      Admin Dashboard
                    </Link>
                  )}
                  <Link to="/cart" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 text-sm hover:bg-brand-50">
                    My Cart
                  </Link>
                  <button onClick={handleLogout} className="block w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50">
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="rounded-lg bg-white px-4 py-2 text-sm font-bold text-brand-700 hover:bg-brand-50"
            >
              Login
            </Link>
          )}

          {/* Cart */}
          <Link
            to="/cart"
            className="relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold hover:bg-white/10"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="hidden md:block">Cart</span>
            {cartCount > 0 && (
              <span className="absolute -top-0.5 left-5 grid h-5 min-w-[1.25rem] place-items-center rounded-full bg-accent-500 px-1 text-[11px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

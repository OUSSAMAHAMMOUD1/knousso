import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import {
  FiShoppingBag, FiSearch, FiMenu, FiX, FiUser, FiLogOut, FiSettings,
} from 'react-icons/fi';

const LANGS = [
  { code: 'fr', label: 'FR', dir: 'ltr' },
  { code: 'ar', label: 'AR', dir: 'rtl' },
  { code: 'en', label: 'EN', dir: 'ltr' },
];

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const { itemCount } = useCart();
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef(null);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  useEffect(() => {
    if (searchOpen && searchRef.current) searchRef.current.focus();
  }, [searchOpen]);

  const changeLang = (code, dir) => {
    i18n.changeLanguage(code);
    document.documentElement.dir = dir;
    document.documentElement.lang = code;
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalogue?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { to: '/', label: t('nav.home') },
    { to: '/catalogue', label: t('nav.catalogue') },
    { to: '/contact', label: t('nav.contact') },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'bg-dark-900/95 backdrop-blur-md shadow-lg shadow-black/50' : 'bg-transparent'
      }`}
    >
      <div className="section-padding max-w-7xl mx-auto">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <span className="font-heading text-2xl md:text-3xl font-bold gold-gradient tracking-widest">
              KnOusso
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm tracking-widest uppercase transition-colors duration-200 hover:text-gold-400 ${
                  location.pathname === link.to ? 'text-gold-500' : 'text-gray-300'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Icons */}
          <div className="flex items-center gap-3 md:gap-4">
            {/* Language Switcher */}
            <div className="hidden md:flex items-center gap-1">
              {LANGS.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => changeLang(lang.code, lang.dir)}
                  className={`text-xs px-2 py-1 rounded transition-colors ${
                    i18n.language === lang.code
                      ? 'text-gold-500 font-semibold'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>

            {/* Search */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="text-gray-300 hover:text-gold-400 transition-colors p-1"
              aria-label="Search"
            >
              <FiSearch size={20} />
            </button>

            {/* Cart */}
            <Link to="/cart" className="relative text-gray-300 hover:text-gold-400 transition-colors p-1">
              <FiShoppingBag size={20} />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gold-500 text-dark-900 text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </Link>

            {/* User */}
            {user ? (
              <div className="relative group hidden md:block">
                <button className="text-gray-300 hover:text-gold-400 transition-colors p-1 flex items-center gap-1">
                  <FiUser size={20} />
                </button>
                <div className="absolute right-0 mt-2 w-44 bg-dark-700 border border-dark-500 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  {isAdmin && (
                    <Link to="/admin" className="flex items-center gap-2 px-4 py-3 text-sm text-gray-300 hover:text-gold-400 hover:bg-dark-600 transition-colors">
                      <FiSettings size={14} /> {t('nav.admin')}
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-300 hover:text-gold-400 hover:bg-dark-600 transition-colors"
                  >
                    <FiLogOut size={14} /> {t('nav.logout')}
                  </button>
                </div>
              </div>
            ) : (
              <Link to="/login" className="hidden md:block text-gray-300 hover:text-gold-400 transition-colors p-1">
                <FiUser size={20} />
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden text-gray-300 hover:text-gold-400 transition-colors p-1"
            >
              {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {searchOpen && (
          <div className="border-t border-dark-600 py-3 animate-slide-up">
            <form onSubmit={handleSearch} className="flex items-center gap-3">
              <FiSearch className="text-gold-500 flex-shrink-0" size={18} />
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={t('nav.search')}
                className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none text-sm"
              />
              <button type="submit" className="text-gold-500 text-sm hover:text-gold-300 transition-colors uppercase tracking-wider">
                OK
              </button>
              <button type="button" onClick={() => setSearchOpen(false)} className="text-gray-500 hover:text-white">
                <FiX size={18} />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-dark-800/98 backdrop-blur-md border-t border-dark-600 animate-slide-up">
          <div className="section-padding py-6 flex flex-col gap-4">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm tracking-widest uppercase py-2 border-b border-dark-600 transition-colors ${
                  location.pathname === link.to ? 'text-gold-500' : 'text-gray-300'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <>
                {isAdmin && (
                  <Link to="/admin" className="text-sm tracking-widest uppercase py-2 border-b border-dark-600 text-gray-300">
                    {t('nav.admin')}
                  </Link>
                )}
                <button onClick={handleLogout} className="text-left text-sm tracking-widest uppercase py-2 text-gray-300">
                  {t('nav.logout')}
                </button>
              </>
            ) : (
              <Link to="/login" className="text-sm tracking-widest uppercase py-2 text-gray-300">
                {t('nav.login')}
              </Link>
            )}
            <div className="flex gap-3 pt-2">
              {LANGS.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => changeLang(lang.code, lang.dir)}
                  className={`text-xs px-3 py-1 border transition-colors ${
                    i18n.language === lang.code
                      ? 'border-gold-500 text-gold-500'
                      : 'border-dark-500 text-gray-400'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

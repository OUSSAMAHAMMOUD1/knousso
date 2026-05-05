import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiInstagram, FiFacebook, FiMessageCircle } from 'react-icons/fi';
import { FaTiktok, FaWhatsapp } from 'react-icons/fa';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-dark-800 border-t border-dark-600">
      <div className="section-padding max-w-7xl mx-auto py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <h2 className="font-heading text-3xl font-bold gold-gradient tracking-widest mb-3">KnOusso</h2>
            <p className="text-gray-400 text-sm leading-relaxed">{t('footer.tagline')}</p>
            <div className="flex gap-4 mt-5">
              <a href="https://instagram.com" target="_blank" rel="noreferrer"
                className="text-gray-400 hover:text-gold-400 transition-colors">
                <FiInstagram size={20} />
              </a>
              <a href="https://tiktok.com" target="_blank" rel="noreferrer"
                className="text-gray-400 hover:text-gold-400 transition-colors">
                <FaTiktok size={18} />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer"
                className="text-gray-400 hover:text-gold-400 transition-colors">
                <FiFacebook size={20} />
              </a>
              <a href="https://wa.me/212616122264" target="_blank" rel="noreferrer"
                className="text-gray-400 hover:text-gold-400 transition-colors">
                <FaWhatsapp size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs uppercase tracking-widest text-gold-500 mb-4 font-semibold">
              {t('footer.quick_links')}
            </h3>
            <ul className="space-y-2">
              {[
                { to: '/', label: t('nav.home') },
                { to: '/catalogue', label: t('nav.catalogue') },
                { to: '/contact', label: t('nav.contact') },
                { to: '/cart', label: t('nav.cart') },
              ].map(link => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-gray-400 hover:text-gold-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xs uppercase tracking-widest text-gold-500 mb-4 font-semibold">
              {t('footer.follow_us')}
            </h3>
            <div className="space-y-3">
              <a href="https://wa.me/212616122264" target="_blank" rel="noreferrer"
                className="flex items-center gap-3 text-sm text-gray-400 hover:text-gold-400 transition-colors">
                <FaWhatsapp size={16} />
                <span>+212 6 16 12 22 64</span>
              </a>
              <a href="https://instagram.com/knousso" target="_blank" rel="noreferrer"
                className="flex items-center gap-3 text-sm text-gray-400 hover:text-gold-400 transition-colors">
                <FiInstagram size={16} />
                <span>@knousso</span>
              </a>
              <a href="https://tiktok.com/@knousso" target="_blank" rel="noreferrer"
                className="flex items-center gap-3 text-sm text-gray-400 hover:text-gold-400 transition-colors">
                <FaTiktok size={14} />
                <span>@knousso</span>
              </a>
              <a href="https://facebook.com/knousso" target="_blank" rel="noreferrer"
                className="flex items-center gap-3 text-sm text-gray-400 hover:text-gold-400 transition-colors">
                <FiFacebook size={16} />
                <span>KnOusso</span>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-dark-600 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} KnOusso. {t('footer.rights')}
          </p>
          <p className="text-xs text-gray-600">Made with ♥ in Morocco</p>
        </div>
      </div>
    </footer>
  );
}

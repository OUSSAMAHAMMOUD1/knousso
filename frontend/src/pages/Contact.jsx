import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { FiInstagram, FiFacebook, FiSend } from 'react-icons/fi';
import { FaTiktok, FaWhatsapp } from 'react-icons/fa';

export default function Contact() {
  const { t } = useTranslation();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sending, setSending] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const text = `*Nouveau message — KnOusso*\n\n👤 *Nom:* ${form.name}\n📧 *Email:* ${form.email}\n\n💬 *Message:*\n${form.message}`;
    window.open(`https://wa.me/212616122264?text=${encodeURIComponent(text)}`, '_blank');
    toast.success(t('contact.success'), {
      style: { background: '#1a1a1a', color: '#fff', border: '1px solid #C9A84C' },
    });
    setForm({ name: '', email: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-dark-900 pt-20">
      {/* Header */}
      <div className="bg-dark-800 border-b border-dark-600">
        <div className="section-padding max-w-7xl mx-auto py-12">
          <p className="text-gold-500 text-xs uppercase tracking-[0.3em] mb-2">KnOusso</p>
          <h1 className="font-heading text-4xl md:text-5xl text-white font-bold">{t('contact.title')}</h1>
        </div>
      </div>

      <div className="section-padding max-w-5xl mx-auto py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Form */}
          <div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-xs uppercase tracking-widest text-gray-400 mb-2 block">
                  {t('contact.name')}
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full bg-dark-700 border border-dark-500 text-white px-4 py-3 text-sm outline-none focus:border-gold-500 transition-colors"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-gray-400 mb-2 block">
                  {t('contact.email')}
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full bg-dark-700 border border-dark-500 text-white px-4 py-3 text-sm outline-none focus:border-gold-500 transition-colors"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-gray-400 mb-2 block">
                  {t('contact.message')}
                </label>
                <textarea
                  required
                  rows={6}
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  className="w-full bg-dark-700 border border-dark-500 text-white px-4 py-3 text-sm outline-none focus:border-gold-500 transition-colors resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={sending}
                className="btn-gold w-full flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <FiSend size={16} />
                {sending ? 'Envoi...' : t('contact.send')}
              </button>
            </form>
          </div>

          {/* Social / Info */}
          <div>
            <h2 className="font-heading text-2xl text-white mb-6">{t('contact.follow')}</h2>
            <div className="space-y-4">
              <a href="https://wa.me/212616122264" target="_blank" rel="noreferrer"
                className="flex items-center gap-4 p-4 bg-dark-800 border border-dark-600 hover:border-gold-500/40 transition-colors group">
                <div className="w-10 h-10 bg-green-500/10 border border-green-500/30 flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                  <FaWhatsapp className="text-green-400" size={20} />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{t('contact.whatsapp')}</p>
                  <p className="text-gray-400 text-xs">+212 6 16 12 22 64</p>
                </div>
              </a>

              <a href="https://instagram.com/knousso" target="_blank" rel="noreferrer"
                className="flex items-center gap-4 p-4 bg-dark-800 border border-dark-600 hover:border-gold-500/40 transition-colors group">
                <div className="w-10 h-10 bg-pink-500/10 border border-pink-500/30 flex items-center justify-center group-hover:bg-pink-500/20 transition-colors">
                  <FiInstagram className="text-pink-400" size={20} />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">Instagram</p>
                  <p className="text-gray-400 text-xs">@knousso</p>
                </div>
              </a>

              <a href="https://tiktok.com/@knousso" target="_blank" rel="noreferrer"
                className="flex items-center gap-4 p-4 bg-dark-800 border border-dark-600 hover:border-gold-500/40 transition-colors group">
                <div className="w-10 h-10 bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                  <FaTiktok className="text-white" size={18} />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">TikTok</p>
                  <p className="text-gray-400 text-xs">@knousso</p>
                </div>
              </a>

              <a href="https://facebook.com/knousso" target="_blank" rel="noreferrer"
                className="flex items-center gap-4 p-4 bg-dark-800 border border-dark-600 hover:border-gold-500/40 transition-colors group">
                <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/30 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                  <FiFacebook className="text-blue-400" size={20} />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">Facebook</p>
                  <p className="text-gray-400 text-xs">KnOusso Official</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

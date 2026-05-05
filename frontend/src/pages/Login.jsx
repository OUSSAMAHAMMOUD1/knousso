import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const { t } = useTranslation();
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';

  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
        toast.success(t('auth.login_success'), { style: { background: '#1a1a1a', color: '#fff', border: '1px solid #C9A84C' } });
      } else {
        await register(form.name, form.email, form.password);
        toast.success(t('auth.register_success'), { style: { background: '#1a1a1a', color: '#fff', border: '1px solid #C9A84C' } });
      }
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center section-padding pt-20">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link to="/">
            <span className="font-heading text-4xl font-bold gold-gradient tracking-widest">KnOusso</span>
          </Link>
          <p className="text-gray-400 mt-2 text-sm">
            {mode === 'login' ? t('auth.login') : t('auth.register')}
          </p>
        </div>

        {/* Tab Switch */}
        <div className="flex border border-dark-600 mb-8">
          {['login', 'register'].map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(''); }}
              className={`flex-1 py-3 text-sm uppercase tracking-widest transition-colors ${
                mode === m ? 'bg-gold-500 text-dark-900 font-semibold' : 'text-gray-400 hover:text-white'
              }`}
            >
              {m === 'login' ? t('auth.login') : t('auth.register')}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="text-xs uppercase tracking-widest text-gray-400 mb-2 block">{t('auth.name')}</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full bg-dark-700 border border-dark-500 text-white px-4 py-3 text-sm outline-none focus:border-gold-500 transition-colors"
              />
            </div>
          )}
          <div>
            <label className="text-xs uppercase tracking-widest text-gray-400 mb-2 block">{t('auth.email')}</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className="w-full bg-dark-700 border border-dark-500 text-white px-4 py-3 text-sm outline-none focus:border-gold-500 transition-colors"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-gray-400 mb-2 block">{t('auth.password')}</label>
            <input
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              className="w-full bg-dark-700 border border-dark-500 text-white px-4 py-3 text-sm outline-none focus:border-gold-500 transition-colors"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-gold w-full disabled:opacity-50 py-4"
          >
            {loading ? '...' : (mode === 'login' ? t('auth.login') : t('auth.register'))}
          </button>
        </form>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';
import { ordersAPI, productsAPI } from '../utils/api';
import toast from 'react-hot-toast';
import {
  FiTrash2, FiMinus, FiPlus, FiShoppingBag,
  FiCheckCircle, FiMapPin, FiPhone, FiUser, FiMap,
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';

const WHATSAPP_NUMBER = '212616122264';

function SuggestedCard({ product, onAdd, onConfirm }) {
  const [imgError, setImgError] = useState(false);
  const imgSrc = !imgError && product.images?.[0]
    ? product.images[0]
    : `https://placehold.co/400x400/1a1a1a/C9A84C?text=${encodeURIComponent(product.name || 'K')}`;

  return (
    <div className="bg-dark-800 border border-dark-600 overflow-hidden">
      <Link to={`/product/${product._id}`}>
        <div className="aspect-square overflow-hidden bg-dark-700">
          <img
            src={imgSrc}
            alt={product.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
          />
        </div>
        <div className="p-4 pb-3">
          <p className="text-xs text-gold-500 uppercase tracking-widest mb-1 truncate">
            {product.category || 'KnOusso'}
          </p>
          <h3 className="text-white font-heading font-medium text-base mb-1 truncate">
            {product.name}
          </h3>
          <p className="text-gold-400 font-semibold text-lg mb-3">
            {product.price?.toLocaleString()} MAD
          </p>
        </div>
      </Link>
      <div className="px-4 pb-4 space-y-2">
        <button
          onClick={() => { onAdd(); onConfirm(); }}
          className="btn-gold w-full py-2.5 text-xs tracking-widest flex items-center justify-center gap-2"
        >
          <FiCheckCircle size={14} />
          Confirmer la commande
        </button>
        <button
          onClick={onAdd}
          className="btn-outline-gold w-full py-2.5 text-xs tracking-widest flex items-center justify-center gap-2"
        >
          <FiShoppingBag size={14} />
          Ajouter au panier
        </button>
      </div>
    </div>
  );
}

const MOROCCAN_CITIES = [
  'Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Tanger', 'Agadir',
  'Meknès', 'Oujda', 'Kenitra', 'Tétouan', 'Safi', 'El Jadida',
  'Béni Mellal', 'Nador', 'Khouribga', 'Settat', 'Berrechid',
  'Khémisset', 'Salé', 'Mohammedia', 'Autre',
];

export default function Cart() {
  const { t } = useTranslation();
  const { items, total, dispatch } = useCart();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', phone: '', city: '', address: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [ordered, setOrdered] = useState(false);
  const [orderRef, setOrderRef] = useState('');
  const [orderItems, setOrderItems] = useState([]);
  const [orderTotal, setOrderTotal] = useState(0);
  const [suggested, setSuggested] = useState([]);

  useEffect(() => {
    productsAPI.getAll({ limit: 10 })
      .then(({ data }) => {
        const cartIds = new Set(items.map(i => i._id));
        const others = (data.products || []).filter(p => !cartIds.has(p._id));
        setSuggested(others.slice(0, 2));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!ordered) return;
    productsAPI.getAll({ limit: 10 })
      .then(({ data }) => {
        const orderedIds = new Set(orderItems.map(i => i._id));
        const others = (data.products || []).filter(p => !orderedIds.has(p._id));
        setSuggested(others.slice(0, 2));
      })
      .catch(() => {});
  }, [ordered]);

  const remove = (id, size) => dispatch({ type: 'REMOVE_ITEM', payload: { id, size } });
  const updateQty = (id, size, qty) => dispatch({ type: 'UPDATE_QUANTITY', payload: { id, size, quantity: qty } });

  const set = (key, val) => {
    setForm(f => ({ ...f, [key]: val }));
    setErrors(e => ({ ...e, [key]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Nom requis';
    if (!form.phone.trim()) e.phone = 'Téléphone requis';
    else if (!/^[\d\s\+\-]{8,15}$/.test(form.phone)) e.phone = 'Numéro invalide';
    if (!form.city) e.city = 'Ville requise';
    if (!form.address.trim()) e.address = 'Adresse requise';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const buildWhatsAppMsg = (ref) => {
    const lines = [
      `🛍️ *Nouvelle commande KnOusso*`,
      `📋 Réf: ${ref}`,
      ``,
      `👤 *Client:* ${form.name}`,
      `📞 *Tél:* ${form.phone}`,
      `🏙️ *Ville:* ${form.city}`,
      `📍 *Adresse:* ${form.address}`,
      ``,
      `🛒 *Articles:*`,
      ...orderItems.map(i => `   • ${i.name} (Pointure ${i.selectedSize}) x${i.quantity} — ${(i.price * i.quantity).toLocaleString()} MAD`),
      ``,
      `💰 *Total: ${orderTotal.toLocaleString()} MAD*`,
      `💵 *Paiement: Cash à la livraison*`,
    ];
    return encodeURIComponent(lines.join('\n'));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      // Try API first, fallback to WhatsApp-only mode
      let ref = `KN-${Date.now().toString().slice(-6)}`;
      try {
        const { data } = await ordersAPI.create({
          items: items.map(i => ({
            product: i._id,
            size: i.selectedSize,
            quantity: i.quantity,
            price: i.price,
          })),
          total,
          shippingAddress: form,
        });
        ref = data._id ? `KN-${data._id.slice(-6).toUpperCase()}` : ref;
      } catch {
        // Backend not connected — order still goes via WhatsApp
      }

      setOrderRef(ref);
      setOrderItems([...items]);
      setOrderTotal(total);
      dispatch({ type: 'CLEAR_CART' });
      setOrdered(true);
    } catch (err) {
      toast.error('Une erreur est survenue. Réessayez.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Empty cart ──
  if (items.length === 0 && !ordered) {
    return (
      <div className="min-h-screen bg-dark-900 pt-20 flex flex-col items-center justify-center section-padding text-center">
        <FiShoppingBag className="text-gold-500/20 mb-6" size={80} />
        <h1 className="font-heading text-3xl text-white mb-3">{t('cart.empty')}</h1>
        <p className="text-gray-400 mb-8">{t('cart.empty_sub')}</p>
        <Link to="/catalogue" className="btn-gold">{t('cart.continue')}</Link>
      </div>
    );
  }

  // ── Success screen ──
  if (ordered) {
    return (
      <div className="min-h-screen bg-dark-900 pt-20">
        {/* Confirmation block */}
        <div className="section-padding max-w-2xl mx-auto py-16 flex flex-col items-center text-center">
          <div className="w-20 h-20 border-2 border-gold-500 flex items-center justify-center mb-6">
            <FiCheckCircle className="text-gold-500" size={36} />
          </div>
          <h1 className="font-heading text-3xl md:text-4xl text-white mb-3">
            Commande confirmée!
          </h1>
          <p className="text-gray-400 mb-2 text-sm">Référence: <span className="text-gold-400 font-mono font-semibold">{orderRef}</span></p>
          <p className="text-gray-400 mb-8 max-w-md text-sm leading-relaxed">
            Merci <span className="text-white font-medium">{form.name}</span>! Votre commande est enregistrée.
            Nous vous contacterons au <span className="text-white">{form.phone}</span> pour confirmer la livraison à <span className="text-white">{form.city}</span>.
          </p>

          {/* WhatsApp button */}
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${buildWhatsAppMsg(orderRef)}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 bg-green-600 hover:bg-green-500 text-white font-semibold px-8 py-4 transition-colors mb-4 text-sm tracking-wider"
          >
            <FaWhatsapp size={20} />
            Confirmer via WhatsApp
          </a>
          <p className="text-xs text-gray-600 mb-8">
            Appuyez pour envoyer les détails directement à notre équipe
          </p>

          <Link to="/catalogue" className="btn-outline-gold text-sm">
            Continuer mes achats
          </Link>
        </div>

        {/* Suggested products */}
        {suggested.length > 0 && (
          <div className="section-padding max-w-7xl mx-auto pb-20">
            <div className="border-t border-dark-600 pt-14">
              <p className="text-xs uppercase tracking-widest text-gold-500 mb-2 text-center">Vous aimerez aussi</p>
              <h2 className="font-heading text-2xl md:text-3xl text-white text-center mb-10">
                Complétez votre style
              </h2>
              <div className="grid grid-cols-2 gap-6">
                {suggested.map(p => (
                  <SuggestedCard key={p._id} product={p}
                    onConfirm={() => navigate('/cart')}
                    onAdd={() => {
                      const defaultSize = p.sizes?.[0] || 41;
                      dispatch({ type: 'ADD_ITEM', payload: { ...p, selectedSize: defaultSize } });
                      toast.success(`${p.name} ajouté au panier`, {
                        style: { background: '#1a1a1a', color: '#fff', border: '1px solid #C9A84C' },
                        iconTheme: { primary: '#C9A84C', secondary: '#1a1a1a' },
                      });
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Main cart ──
  return (
    <div className="min-h-screen bg-dark-900 pt-20">
      <div className="section-padding max-w-7xl mx-auto py-10">
        <h1 className="font-heading text-4xl text-white mb-2">{t('cart.title')}</h1>
        <p className="text-gray-500 text-sm mb-8">{items.length} article(s)</p>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">

          {/* ── LEFT: Items + Suggestions ── */}
          <div className="lg:col-span-3 space-y-3">
            {items.map(item => {
              const key = `${item._id}-${item.selectedSize}`;
              const img = item.images?.[0] || `https://placehold.co/100x100/1a1a1a/C9A84C?text=K`;
              return (
                <div key={key} className="flex gap-4 bg-dark-800 border border-dark-600 p-4">
                  <img
                    src={img}
                    alt={item.name}
                    onError={e => { e.target.src = `https://placehold.co/100x100/1a1a1a/C9A84C?text=K`; }}
                    className="w-20 h-20 object-cover flex-shrink-0 bg-dark-700"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between gap-2 mb-1">
                      <h3 className="text-white font-medium text-sm leading-tight">{item.name}</h3>
                      <button onClick={() => remove(item._id, item.selectedSize)}
                        className="text-gray-600 hover:text-red-400 transition-colors flex-shrink-0">
                        <FiTrash2 size={15} />
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">
                      Pointure: <span className="text-gold-400">{item.selectedSize}</span>
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center border border-dark-500">
                        <button onClick={() => updateQty(item._id, item.selectedSize, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="px-2.5 py-1.5 text-gray-400 hover:text-white disabled:opacity-30 transition-colors">
                          <FiMinus size={11} />
                        </button>
                        <span className="px-3 py-1.5 text-white text-sm min-w-[2rem] text-center border-x border-dark-500">
                          {item.quantity}
                        </span>
                        <button onClick={() => updateQty(item._id, item.selectedSize, item.quantity + 1)}
                          className="px-2.5 py-1.5 text-gray-400 hover:text-white transition-colors">
                          <FiPlus size={11} />
                        </button>
                      </div>
                      <span className="text-gold-400 font-semibold text-sm">
                        {(item.price * item.quantity).toLocaleString()} MAD
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* ── Suggested products ── */}
            {suggested.length > 0 && (
              <div className="pt-6">
                <p className="text-xs uppercase tracking-widest text-gold-500 mb-1">Vous aimerez aussi</p>
                <h2 className="font-heading text-xl text-white mb-4">Complétez votre style</h2>
                <div className="grid grid-cols-2 gap-3">
                  {suggested.map(p => (
                    <SuggestedCard key={p._id} product={p}
                      onConfirm={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                      onAdd={() => {
                        const defaultSize = p.sizes?.[0] || 41;
                        dispatch({ type: 'ADD_ITEM', payload: { ...p, selectedSize: defaultSize } });
                        toast.success(`${p.name} ajouté au panier`, {
                          style: { background: '#1a1a1a', color: '#fff', border: '1px solid #C9A84C' },
                          iconTheme: { primary: '#C9A84C', secondary: '#1a1a1a' },
                        });
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT: Order Form ── */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-dark-800 border border-dark-600 p-6 sticky top-24">

              {/* Summary */}
              <div className="space-y-2 mb-5 pb-5 border-b border-dark-600">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Sous-total</span>
                  <span className="text-white">{total.toLocaleString()} MAD</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Livraison</span>
                  <span className="text-green-400">Gratuite</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-white font-semibold">Total</span>
                  <span className="text-gold-400 font-bold text-xl">{total.toLocaleString()} MAD</span>
                </div>
              </div>

              {/* COD Badge */}
              <div className="flex items-center gap-3 bg-dark-700 border border-gold-500/20 px-4 py-3 mb-5">
                <div className="w-8 h-8 bg-gold-500/10 border border-gold-500/30 flex items-center justify-center flex-shrink-0">
                  <span className="text-gold-400 text-base">💵</span>
                </div>
                <div>
                  <p className="text-white text-xs font-semibold uppercase tracking-wider">Paiement à la livraison</p>
                  <p className="text-gray-500 text-xs">Cash on Delivery — Payez en recevant votre commande</p>
                </div>
              </div>

              {/* Delivery Info */}
              <h3 className="text-xs uppercase tracking-widest text-gold-500 mb-4">
                Informations de livraison
              </h3>

              <div className="space-y-3 mb-5">

                {/* Nom */}
                <div>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                    <input
                      type="text"
                      placeholder="Nom complet *"
                      value={form.name}
                      onChange={e => set('name', e.target.value)}
                      className={`w-full bg-dark-700 border text-white pl-9 pr-3 py-3 text-sm outline-none transition-colors placeholder-gray-600 ${
                        errors.name ? 'border-red-500/60' : 'border-dark-500 focus:border-gold-500'
                      }`}
                    />
                  </div>
                  {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                </div>

                {/* Téléphone */}
                <div>
                  <div className="relative">
                    <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                    <input
                      type="tel"
                      placeholder="Numéro de téléphone * (ex: 0612345678)"
                      value={form.phone}
                      onChange={e => set('phone', e.target.value)}
                      className={`w-full bg-dark-700 border text-white pl-9 pr-3 py-3 text-sm outline-none transition-colors placeholder-gray-600 ${
                        errors.phone ? 'border-red-500/60' : 'border-dark-500 focus:border-gold-500'
                      }`}
                    />
                  </div>
                  {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
                </div>

                {/* Ville */}
                <div>
                  <div className="relative">
                    <FiMap className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={14} />
                    <select
                      value={form.city}
                      onChange={e => set('city', e.target.value)}
                      className={`w-full bg-dark-700 border text-sm pl-9 pr-3 py-3 outline-none transition-colors appearance-none cursor-pointer ${
                        form.city ? 'text-white' : 'text-gray-600'
                      } ${errors.city ? 'border-red-500/60' : 'border-dark-500 focus:border-gold-500'}`}
                    >
                      <option value="" disabled>Ville *</option>
                      {MOROCCAN_CITIES.map(c => (
                        <option key={c} value={c} className="bg-dark-700 text-white">{c}</option>
                      ))}
                    </select>
                  </div>
                  {errors.city && <p className="text-red-400 text-xs mt-1">{errors.city}</p>}
                </div>

                {/* Adresse */}
                <div>
                  <div className="relative">
                    <FiMapPin className="absolute left-3 top-3.5 text-gray-500" size={14} />
                    <textarea
                      rows={2}
                      placeholder="Adresse complète * (quartier, rue, numéro...)"
                      value={form.address}
                      onChange={e => set('address', e.target.value)}
                      className={`w-full bg-dark-700 border text-white pl-9 pr-3 py-3 text-sm outline-none transition-colors placeholder-gray-600 resize-none ${
                        errors.address ? 'border-red-500/60' : 'border-dark-500 focus:border-gold-500'
                      }`}
                    />
                  </div>
                  {errors.address && <p className="text-red-400 text-xs mt-1">{errors.address}</p>}
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="btn-gold w-full py-4 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <><div className="w-4 h-4 border-2 border-dark-900 border-t-transparent rounded-full animate-spin" /> Traitement...</>
                ) : (
                  <><FiCheckCircle size={16} /> Confirmer la commande</>
                )}
              </button>

              <p className="text-center text-xs text-gray-600 mt-3">
                Vous payez en espèces à la réception de votre commande
              </p>

              <Link to="/catalogue" className="block text-center text-xs text-gray-500 hover:text-gold-400 transition-colors mt-4">
                ← Continuer mes achats
              </Link>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

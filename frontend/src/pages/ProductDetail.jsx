import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { productsAPI, ordersAPI } from '../utils/api';
import { useCart } from '../context/CartContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ProductCard from '../components/ProductCard';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiShoppingBag, FiShare2, FiCheckCircle, FiCreditCard, FiX, FiUser, FiPhone, FiMapPin } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';

const WHATSAPP_NUMBER = '212616122264';

export default function ProductDetail() {
  const { id } = useParams();
  const { t } = useTranslation();
  const { dispatch } = useCart();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [sizeError, setSizeError] = useState(false);
  const [added, setAdded] = useState(false);

  const [showOrderForm, setShowOrderForm] = useState(false);
  const [orderForm, setOrderForm] = useState({ name: '', phone: '', city: '', address: '' });
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderDone, setOrderDone] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    setSelectedSize(null);
    setSelectedImage(0);
    setAdded(false);

    productsAPI.getById(id)
      .then(({ data }) => {
        setProduct(data);
        if (data.sizes?.length > 0) setSelectedSize(null);
        // Fetch related
        return productsAPI.getAll({ limit: 10 });
      })
      .then(({ data }) => {
        setRelated((data.products || []).filter(p => p._id !== id).slice(0, 4));
      })
      .catch(() => {
        const fallback = FALLBACK.find(p => p._id === id) || FALLBACK[0];
        setProduct(fallback);
        setRelated(FALLBACK.filter(p => p._id !== id).slice(0, 4));
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleOpenOrder = () => {
    if (!selectedSize) {
      setSizeError(true);
      setTimeout(() => setSizeError(false), 2000);
      return;
    }
    setOrderDone(false);
    setOrderForm({ name: '', phone: '', city: '', address: '' });
    setShowOrderForm(true);
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setOrderLoading(true);
    const waWindow = window.open('', '_blank');
    try {
      await ordersAPI.create({
        items: [{ product: product._id, size: selectedSize, quantity: 1 }],
        total: product.price,
        shippingAddress: orderForm,
      });
      const msg = encodeURIComponent(
        `🛍️ *Nouvelle commande KnOusso*\n\n` +
        `👟 *Produit:* ${product.name} — Pointure ${selectedSize}\n` +
        `💰 *Total:* ${product.price} MAD\n\n` +
        `👤 *Client:* ${orderForm.name}\n` +
        `📞 *Tél:* ${orderForm.phone}\n` +
        `🏙️ *Ville:* ${orderForm.city}\n` +
        `📍 *Adresse:* ${orderForm.address}`
      );
      waWindow.location.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`;
      setOrderDone(true);
    } catch (err) {
      waWindow.close();
      toast.error(err.response?.data?.message || 'Erreur lors de la commande', {
        style: { background: '#1a1a1a', color: '#fff', border: '1px solid #ef4444' },
      });
    } finally {
      setOrderLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      setSizeError(true);
      setTimeout(() => setSizeError(false), 2000);
      return;
    }
    dispatch({ type: 'ADD_ITEM', payload: { ...product, selectedSize } });
    setAdded(true);
    toast.success(`${product.name} (${selectedSize}) ajouté!`, {
      style: { background: '#1a1a1a', color: '#fff', border: '1px solid #C9A84C' },
      iconTheme: { primary: '#C9A84C', secondary: '#1a1a1a' },
    });
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) return <div className="min-h-screen bg-dark-900 pt-20"><LoadingSpinner /></div>;
  if (!product) return null;

  const images = product.images?.length ? product.images : [
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',
  ];

  return (
    <div className="min-h-screen bg-dark-900 pt-20">
      <div className="section-padding max-w-7xl mx-auto py-8">
        {/* Breadcrumb */}
        <Link to="/catalogue" className="flex items-center gap-2 text-sm text-gray-400 hover:text-gold-400 transition-colors mb-8">
          <FiArrowLeft size={14} />
          {t('nav.catalogue')}
        </Link>

        {/* Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Images */}
          <div>
            <div className="relative aspect-square bg-dark-700 overflow-hidden mb-4">
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={e => { e.target.src = `https://placehold.co/600x600/1a1a1a/C9A84C?text=${encodeURIComponent(product.name)}`; }}
              />
              {product.isNew && (
                <span className="absolute top-4 left-4 bg-gold-500 text-dark-900 text-xs px-3 py-1 font-semibold tracking-wider uppercase">
                  New
                </span>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-3">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-20 h-20 overflow-hidden border-2 transition-colors flex-shrink-0 ${
                      selectedImage === i ? 'border-gold-500' : 'border-dark-500 hover:border-gray-400'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover"
                      onError={e => { e.target.src = `https://placehold.co/80x80/1a1a1a/C9A84C?text=K`; }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col">
            <p className="text-gold-500 text-xs uppercase tracking-widest mb-2">
              {product.category || 'KnOusso'}
            </p>
            <h1 className="font-heading text-3xl md:text-4xl text-white font-bold mb-3">
              {product.name}
            </h1>
            <p className="text-3xl text-gold-400 font-semibold mb-6">
              {product.price?.toLocaleString()} MAD
            </p>

            {/* Divider */}
            <div className="w-full h-px bg-dark-600 mb-6" />

            {/* Description */}
            {product.description && (
              <div className="mb-6">
                <h3 className="text-xs uppercase tracking-widest text-gray-400 mb-2">
                  {t('product.description')}
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Size Selector */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs uppercase tracking-widest text-gray-400">
                  {t('product.select_size')}
                </h3>
                {sizeError && (
                  <span className="text-xs text-red-400 animate-pulse">Veuillez choisir une pointure</span>
                )}
              </div>
              <div className="flex flex-wrap gap-3">
                {(product.sizes || [40, 41, 42, 43]).map(size => (
                  <button
                    key={size}
                    onClick={() => { setSelectedSize(size); setSizeError(false); }}
                    className={`w-14 h-14 border text-sm font-semibold transition-all duration-200 ${
                      selectedSize === size
                        ? 'border-gold-500 bg-gold-500 text-dark-900'
                        : sizeError
                          ? 'border-red-500/50 text-white bg-dark-700 hover:border-red-400'
                          : 'border-gray-500 text-white bg-dark-700 hover:border-gold-500 hover:text-gold-400'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Confirm Order */}
            <button
              onClick={handleOpenOrder}
              className="w-full flex items-center justify-center gap-3 py-4 text-sm btn-gold"
            >
              <FiCreditCard size={18} /> Confirmer la commande
            </button>

            {/* Add to Cart */}
            <button
              onClick={handleAddToCart}
              className={`w-full flex items-center justify-center gap-3 py-4 text-sm mt-3 border border-gold-500 text-gold-400 hover:bg-gold-500 hover:text-dark-900 transition-all duration-200 tracking-wider uppercase font-medium ${
                added ? 'bg-green-600 border-green-600 text-white hover:bg-green-500 hover:text-white' : ''
              }`}
            >
              {added ? (
                <><FiCheckCircle size={18} /> Ajouté!</>
              ) : (
                <><FiShoppingBag size={18} /> {t('product.add_to_cart')}</>
              )}
            </button>

            {/* Share */}
            <button
              onClick={() => navigator.share?.({ title: product.name, url: window.location.href })}
              className="mt-3 flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gold-400 transition-colors py-2"
            >
              <FiShare2 size={14} /> {t('product.share')}
            </button>

            {/* Stock indicator */}
            <div className="flex items-center gap-2 mt-4">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-xs text-gray-400">{t('product.in_stock')}</span>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div className="mt-20">
            <h2 className="font-heading text-2xl text-white mb-8">{t('product.related')}</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              {related.map(p => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Order Form Modal */}
      {showOrderForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-dark-800 border border-dark-600 w-full max-w-md p-8 relative">
            <button
              onClick={() => setShowOrderForm(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
            >
              <FiX size={20} />
            </button>

            {orderDone ? (
              <div className="text-center py-6">
                <FiCheckCircle size={56} className="mx-auto text-gold-400 mb-4" />
                <h2 className="font-heading text-2xl text-white mb-2">Commande confirmée !</h2>
                <p className="text-gray-400 text-sm mb-1">
                  <span className="text-white font-medium">{product.name}</span> — Pointure {selectedSize}
                </p>
                <p className="text-gold-400 font-semibold text-lg mb-6">{product.price?.toLocaleString()} MAD</p>
                <p className="text-gray-400 text-sm mb-6">Nous vous contacterons bientôt pour confirmer la livraison.</p>
                <button
                  onClick={() => setShowOrderForm(false)}
                  className="mt-3 w-full py-3 btn-gold text-sm"
                >
                  Fermer
                </button>
              </div>
            ) : (
              <>
                <h2 className="font-heading text-2xl text-white mb-1">Votre commande</h2>
                <p className="text-gray-400 text-sm mb-6">
                  {product.name} — Pointure {selectedSize} — <span className="text-gold-400">{product.price?.toLocaleString()} MAD</span>
                </p>

                <form onSubmit={handleSubmitOrder} className="flex flex-col gap-4">
                  <div className="relative">
                    <FiUser size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      required
                      type="text"
                      placeholder="Nom complet"
                      value={orderForm.name}
                      onChange={e => setOrderForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full bg-dark-700 border border-dark-500 text-white placeholder-gray-500 pl-9 pr-4 py-3 text-sm focus:outline-none focus:border-gold-500 transition-colors"
                    />
                  </div>
                  <div className="relative">
                    <FiPhone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      required
                      type="tel"
                      placeholder="Téléphone"
                      value={orderForm.phone}
                      onChange={e => setOrderForm(f => ({ ...f, phone: e.target.value }))}
                      className="w-full bg-dark-700 border border-dark-500 text-white placeholder-gray-500 pl-9 pr-4 py-3 text-sm focus:outline-none focus:border-gold-500 transition-colors"
                    />
                  </div>
                  <div className="relative">
                    <FiMapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      required
                      type="text"
                      placeholder="Ville"
                      value={orderForm.city}
                      onChange={e => setOrderForm(f => ({ ...f, city: e.target.value }))}
                      className="w-full bg-dark-700 border border-dark-500 text-white placeholder-gray-500 pl-9 pr-4 py-3 text-sm focus:outline-none focus:border-gold-500 transition-colors"
                    />
                  </div>
                  <div className="relative">
                    <FiMapPin size={14} className="absolute left-3 top-3 text-gray-500" />
                    <textarea
                      required
                      placeholder="Adresse complète"
                      rows={3}
                      value={orderForm.address}
                      onChange={e => setOrderForm(f => ({ ...f, address: e.target.value }))}
                      className="w-full bg-dark-700 border border-dark-500 text-white placeholder-gray-500 pl-9 pr-4 py-3 text-sm focus:outline-none focus:border-gold-500 transition-colors resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={orderLoading}
                    className="w-full py-4 bg-green-600 hover:bg-green-500 text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60 transition-colors"
                  >
                    {orderLoading ? (
                      <span className="w-4 h-4 border-2 border-dark-900 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <><FaWhatsapp size={16} /> Confirmer via WhatsApp</>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const FALLBACK = [
  { _id: 'p1', name: 'Derby Cuir Noir', price: 399, category: 'Derby', sizes: [40,41,42,43], description: 'Derby en cuir véritable grain fin, semelle caoutchouc naturel avec surpiqûres contrastées camel. Confort optimal pour un usage quotidien ou les occasions semi-formelles.', images: ['/images/derby.jpg'] },
  { _id: 'p2', name: 'Loafer Cuir Noir', price: 399, category: 'Mocassin', sizes: [40,41,42,43], description: 'Mocassin penny loafer en cuir lisse, semelle épaisse crantée pour une accroche maximale. Style casual chic, facile à enfiler.', images: ['/images/loafer.jpg'] },
  { _id: 'p3', name: 'Brogue Cuir Noir', price: 399, category: 'Brogue', sizes: [40,41,42,43], description: 'Brogue classique à perforations décoratives wingtip, cuir haute brillance poli à la main. Semelle cuir avec protection caoutchouc.', images: ['/images/brogue.jpg'] },
];

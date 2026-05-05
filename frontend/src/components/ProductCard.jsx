import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import { FiShoppingBag, FiEye } from 'react-icons/fi';

export default function ProductCard({ product }) {
  const { t } = useTranslation();
  const { dispatch } = useCart();
  const [hovered, setHovered] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const defaultSize = product.sizes?.[0] || 41;
    dispatch({
      type: 'ADD_ITEM',
      payload: { ...product, selectedSize: defaultSize },
    });
    toast.success(`${product.name} ajouté au panier`, {
      style: { background: '#1a1a1a', color: '#fff', border: '1px solid #C9A84C' },
      iconTheme: { primary: '#C9A84C', secondary: '#1a1a1a' },
    });
  };

  const imgSrc = !imgError && product.images?.[0]
    ? product.images[0]
    : `https://placehold.co/400x400/1a1a1a/C9A84C?text=${encodeURIComponent(product.name || 'KnOusso')}`;

  return (
    <div
      className="group relative bg-dark-700 border border-dark-500 overflow-hidden card-hover cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link to={`/product/${product._id}`}>
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-dark-600">
          <img
            src={imgSrc}
            alt={product.name}
            onError={() => setImgError(true)}
            className={`w-full h-full object-cover transition-transform duration-500 ${
              hovered ? 'scale-110' : 'scale-100'
            }`}
          />
          {/* Overlay */}
          <div className={`absolute inset-0 bg-dark-900/50 flex items-center justify-center gap-3 transition-opacity duration-300 ${
            hovered ? 'opacity-100' : 'opacity-0'
          }`}>
            <button
              onClick={handleAddToCart}
              className="bg-gold-500 text-dark-900 p-3 hover:bg-gold-400 transition-colors"
              title={t('product.add_to_cart')}
            >
              <FiShoppingBag size={18} />
            </button>
            <Link
              to={`/product/${product._id}`}
              className="bg-white/10 backdrop-blur text-white p-3 hover:bg-white/20 transition-colors border border-white/20"
              title="Voir"
            >
              <FiEye size={18} />
            </Link>
          </div>

          {/* New badge */}
          {product.isNew && (
            <span className="absolute top-3 left-3 bg-gold-500 text-dark-900 text-xs px-2 py-1 font-semibold tracking-wider uppercase">
              New
            </span>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <p className="text-xs text-gold-500 uppercase tracking-widest mb-1 truncate">
            {product.category || 'KnOusso'}
          </p>
          <h3 className="text-white font-heading font-medium text-base mb-2 truncate group-hover:text-gold-300 transition-colors">
            {product.name}
          </h3>

          {/* Sizes */}
          {product.sizes?.length > 0 && (
            <div className="flex gap-1 mb-3">
              {product.sizes.map(s => (
                <span key={s} className="text-xs text-white font-medium border border-gray-500 bg-dark-700 px-2 py-1">
                  {s}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-gold-400 font-semibold text-lg">
              {product.price?.toLocaleString()} MAD
            </span>
          </div>
        </div>
      </Link>

      {/* Add to cart button (always visible on mobile) */}
      <button
        onClick={handleAddToCart}
        className="w-full btn-gold py-2.5 text-xs tracking-widest md:hidden"
      >
        {t('product.add_to_cart')}
      </button>
    </div>
  );
}

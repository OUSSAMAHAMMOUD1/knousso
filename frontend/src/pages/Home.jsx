import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { productsAPI, settingsAPI } from '../utils/api';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { FiArrowRight, FiCheckCircle, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const DEFAULT_HERO = [];

export default function Home() {
  const { t } = useTranslation();
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [heroIdx, setHeroIdx] = useState(0);
  const [heroImages, setHeroImages] = useState(DEFAULT_HERO);

  useEffect(() => {
    productsAPI.getAll({ limit: 4, featured: true })
      .then(({ data }) => setFeatured(data.products || []))
      .catch(() => setFeatured([]))
      .finally(() => setLoading(false));
    settingsAPI.getSlideshow()
      .then(({ data }) => { if (data.images?.length) setHeroImages(data.images); })
      .catch(() => {});
  }, []);

  // Hero slideshow
  useEffect(() => {
    const timer = setInterval(() => setHeroIdx(i => (i + 1) % heroImages.length), 3000);
    return () => clearInterval(timer);
  }, [heroImages.length]);

  const whyItems = [
    { key: 'quality', icon: '✦' },
    { key: 'comfort', icon: '✦' },
    { key: 'style', icon: '✦' },
  ];

  return (
    <div className="min-h-screen">
      {/* ── HERO ── */}
      <section className="relative h-screen flex items-center overflow-hidden">
        {heroImages.map((img, i) => (
          <div
            key={img}
            className="absolute inset-0 transition-opacity duration-1000"
            style={{ opacity: i === heroIdx ? 1 : 0 }}
          >
            <img src={img} alt="hero" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-dark-900/90 via-dark-900/60 to-transparent" />
          </div>
        ))}

        <div className="relative z-10 section-padding max-w-7xl mx-auto w-full">
          <div className="max-w-xl animate-fade-in">
            <p className="text-gold-500 text-xs uppercase tracking-[0.3em] mb-4 font-medium">
              KnOusso Collection
            </p>
            <h1 className="font-heading text-5xl md:text-7xl font-bold text-white leading-tight mb-6">
              {t('home.hero_title')}
            </h1>
            <p className="text-gray-300 text-base md:text-lg leading-relaxed mb-10">
              {t('home.hero_subtitle')}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/catalogue" className="btn-gold flex items-center gap-2">
                {t('home.cta_shop')}
                <FiArrowRight size={16} />
              </Link>
              <Link to="/catalogue" className="btn-outline-gold">
                {t('home.cta_catalogue')}
              </Link>
            </div>
          </div>
        </div>

        {/* Arrows */}
        <button
          onClick={() => setHeroIdx(i => (i - 1 + heroImages.length) % heroImages.length)}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 flex items-center justify-center border border-white/20 bg-black/30 text-white hover:bg-gold-500 hover:border-gold-500 hover:text-dark-900 transition-all duration-200"
        >
          <FiChevronLeft size={22} />
        </button>
        <button
          onClick={() => setHeroIdx(i => (i + 1) % heroImages.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 flex items-center justify-center border border-white/20 bg-black/30 text-white hover:bg-gold-500 hover:border-gold-500 hover:text-dark-900 transition-all duration-200"
        >
          <FiChevronRight size={22} />
        </button>

        {/* Slide indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {heroImages.map((_, i) => (
            <button
              key={i}
              onClick={() => setHeroIdx(i)}
              className={`w-6 h-0.5 transition-all duration-300 ${
                i === heroIdx ? 'bg-gold-500 w-10' : 'bg-gray-600'
              }`}
            />
          ))}
        </div>
      </section>

      {/* ── FEATURED ── */}
      <section className="py-20 bg-dark-900">
        <div className="section-padding max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-gold-500 text-xs uppercase tracking-[0.3em] mb-3">{t('home.featured')}</p>
            <h2 className="font-heading text-4xl md:text-5xl text-white font-bold">
              {t('home.featured_sub')}
            </h2>
            <div className="w-16 h-0.5 bg-gold-500 mx-auto mt-4" />
          </div>

          {loading ? (
            <LoadingSpinner />
          ) : featured.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              {featured.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : null}

          <div className="text-center mt-12">
            <Link to="/catalogue" className="btn-outline-gold inline-flex items-center gap-2">
              {t('home.cta_catalogue')} <FiArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── WHY KNOUSSO ── */}
      <section className="py-20 bg-dark-800">
        <div className="section-padding max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-heading text-4xl text-white font-bold mb-2">{t('home.why_title')}</h2>
            <div className="w-16 h-0.5 bg-gold-500 mx-auto mt-4" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {whyItems.map(item => (
              <div key={item.key} className="text-center p-8 border border-dark-500 hover:border-gold-500/40 transition-colors group">
                <div className="w-14 h-14 border border-gold-500/40 flex items-center justify-center mx-auto mb-5 group-hover:bg-gold-500/10 transition-colors">
                  <FiCheckCircle className="text-gold-400" size={24} />
                </div>
                <h3 className="font-heading text-xl text-white mb-3">
                  {t(`home.why_${item.key}`)}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {t(`home.why_${item.key}_desc`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="py-20 bg-dark-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-96 h-96 bg-gold-500 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-gold-500 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        </div>
        <div className="relative z-10 section-padding max-w-3xl mx-auto text-center">
          <p className="text-gold-500 text-xs uppercase tracking-[0.3em] mb-4">Maroc Premium</p>
          <h2 className="font-heading text-4xl md:text-5xl text-white font-bold mb-6">
            Elevez votre style
          </h2>
          <p className="text-gray-400 mb-8 text-base">
            Chaque paire KnOusso est une déclaration d'élégance. Fabriquée pour durer, conçue pour impressionner.
          </p>
          <Link to="/catalogue" className="btn-gold inline-flex items-center gap-2">
            Explorer <FiArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}

const PLACEHOLDER_PRODUCTS = [
  {
    _id: 'p1', name: 'Derby Cuir Noir', price: 399, category: 'Derby',
    sizes: [40, 41, 42, 43],
    images: ['/images/derby.jpg'],
  },
  {
    _id: 'p2', name: 'Loafer Cuir Noir', price: 399, category: 'Mocassin',
    sizes: [40, 41, 42, 43],
    images: ['/images/loafer.jpg'],
  },
  {
    _id: 'p3', name: 'Brogue Cuir Noir', price: 399, category: 'Brogue',
    sizes: [40, 41, 42, 43],
    images: ['/images/brogue.jpg'],
  },
];

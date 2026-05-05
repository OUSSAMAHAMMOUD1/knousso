import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { productsAPI } from '../utils/api';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { FiFilter, FiX, FiChevronDown } from 'react-icons/fi';

const SIZES = [40, 41, 42, 43];
const CATEGORIES = ['Oxford', 'Derby', 'Mocassin', 'Brogue', 'Sneaker', 'Boot'];

export default function Catalogue() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [filterOpen, setFilterOpen] = useState(false);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    size: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    sort: 'newest',
  });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.size) params.size = filters.size;
      if (filters.category) params.category = filters.category;
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      if (filters.sort) params.sort = filters.sort;

      const { data } = await productsAPI.getAll(params);
      setProducts(data.products || []);
      setTotal(data.total || 0);
    } catch {
      setProducts(FALLBACK_PRODUCTS);
      setTotal(FALLBACK_PRODUCTS.length);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    if (searchParams.get('search')) {
      setFilters(f => ({ ...f, search: searchParams.get('search') }));
    }
  }, [searchParams]);

  const updateFilter = (key, value) => {
    setFilters(f => ({ ...f, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ search: '', size: '', category: '', minPrice: '', maxPrice: '', sort: 'newest' });
    setSearchParams({});
  };

  const activeFilterCount = [filters.size, filters.category, filters.minPrice, filters.maxPrice]
    .filter(Boolean).length;

  return (
    <div className="min-h-screen bg-dark-900 pt-20">
      {/* Header */}
      <div className="bg-dark-800 border-b border-dark-600">
        <div className="section-padding max-w-7xl mx-auto py-12">
          <p className="text-gold-500 text-xs uppercase tracking-[0.3em] mb-2">KnOusso</p>
          <h1 className="font-heading text-4xl md:text-5xl text-white font-bold">{t('catalogue.title')}</h1>
        </div>
      </div>

      <div className="section-padding max-w-7xl mx-auto py-8">
        {/* Search + Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <input
              type="text"
              value={filters.search}
              onChange={e => updateFilter('search', e.target.value)}
              placeholder={t('nav.search')}
              className="w-full bg-dark-700 border border-dark-500 text-white placeholder-gray-500 px-4 py-3 text-sm outline-none focus:border-gold-500 transition-colors"
            />
            {filters.search && (
              <button onClick={() => updateFilter('search', '')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                <FiX size={16} />
              </button>
            )}
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              value={filters.sort}
              onChange={e => updateFilter('sort', e.target.value)}
              className="bg-dark-700 border border-dark-500 text-white px-4 py-3 text-sm outline-none focus:border-gold-500 transition-colors appearance-none pr-8 cursor-pointer"
            >
              <option value="newest">{t('catalogue.sort_newest')}</option>
              <option value="price_asc">{t('catalogue.sort_price_asc')}</option>
              <option value="price_desc">{t('catalogue.sort_price_desc')}</option>
            </select>
            <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className="flex items-center gap-2 border border-dark-500 hover:border-gold-500 text-gray-300 hover:text-gold-400 px-4 py-3 text-sm transition-colors"
          >
            <FiFilter size={16} />
            {t('catalogue.filter_price')}
            {activeFilterCount > 0 && (
              <span className="bg-gold-500 text-dark-900 text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Filter Panel */}
        {filterOpen && (
          <div className="bg-dark-800 border border-dark-600 p-6 mb-8 animate-slide-up">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Size */}
              <div>
                <label className="text-xs uppercase tracking-widest text-gold-500 mb-3 block">
                  {t('catalogue.filter_size')}
                </label>
                <div className="flex flex-wrap gap-2">
                  {SIZES.map(s => (
                    <button
                      key={s}
                      onClick={() => updateFilter('size', filters.size === String(s) ? '' : String(s))}
                      className={`px-3 py-1.5 text-sm border transition-colors ${
                        filters.size === String(s)
                          ? 'border-gold-500 text-gold-500 bg-gold-500/10'
                          : 'border-dark-500 text-gray-400 hover:border-gray-400'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="text-xs uppercase tracking-widest text-gold-500 mb-3 block">
                  Catégorie
                </label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => updateFilter('category', filters.category === cat ? '' : cat)}
                      className={`px-3 py-1.5 text-xs border transition-colors ${
                        filters.category === cat
                          ? 'border-gold-500 text-gold-500 bg-gold-500/10'
                          : 'border-dark-500 text-gray-400 hover:border-gray-400'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <label className="text-xs uppercase tracking-widest text-gold-500 mb-3 block">
                  Prix Min (MAD)
                </label>
                <input
                  type="number"
                  value={filters.minPrice}
                  onChange={e => updateFilter('minPrice', e.target.value)}
                  placeholder="0"
                  className="w-full bg-dark-700 border border-dark-500 text-white px-3 py-2 text-sm outline-none focus:border-gold-500"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-gold-500 mb-3 block">
                  Prix Max (MAD)
                </label>
                <input
                  type="number"
                  value={filters.maxPrice}
                  onChange={e => updateFilter('maxPrice', e.target.value)}
                  placeholder="9999"
                  className="w-full bg-dark-700 border border-dark-500 text-white px-3 py-2 text-sm outline-none focus:border-gold-500"
                />
              </div>
            </div>

            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="mt-4 text-sm text-gray-400 hover:text-gold-400 flex items-center gap-1 transition-colors"
              >
                <FiX size={14} /> Effacer les filtres
              </button>
            )}
          </div>
        )}

        {/* Results count */}
        <p className="text-sm text-gray-500 mb-6">
          {loading ? '...' : `${total} ${t('catalogue.products_found')}`}
        </p>

        {/* Products Grid */}
        {loading ? (
          <LoadingSpinner />
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">{t('catalogue.no_results')}</p>
            <button onClick={clearFilters} className="btn-outline-gold mt-6">
              {t('catalogue.filter_all')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
            {products.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const FALLBACK_PRODUCTS = [
  { _id: 'p1', name: 'Derby Cuir Noir', price: 399, category: 'Derby', sizes: [40,41,42,43], images: ['/images/derby.jpg'] },
  { _id: 'p2', name: 'Loafer Cuir Noir', price: 399, category: 'Mocassin', sizes: [40,41,42,43], images: ['/images/loafer.jpg'] },
  { _id: 'p3', name: 'Brogue Cuir Noir', price: 399, category: 'Brogue', sizes: [40,41,42,43], images: ['/images/brogue.jpg'] },
];

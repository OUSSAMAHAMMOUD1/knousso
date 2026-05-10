import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { productsAPI, ordersAPI, settingsAPI } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiPackage, FiShoppingBag, FiDollarSign, FiX, FiUpload, FiImage, FiSave } from 'react-icons/fi';

function compressImage(file, maxWidth = 800, quality = 0.82) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement('canvas');
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

const EMPTY_PRODUCT = {
  name: '', price: '', description: '', category: '', sizes: [40, 41, 42, 43], images: [''], isNewArrival: false, featured: false,
};

export default function Admin() {
  const { t } = useTranslation();

  const [tab, setTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [slideshow, setSlideshow] = useState([]);
  const [slideSaving, setSlideSaving] = useState(false);
  const [slideUploadingIdx, setSlideUploadingIdx] = useState(null);
  const slideFileRef = useRef(null);
  const slideImgIdx = useRef(null);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY_PRODUCT);
  const [saving, setSaving] = useState(false);
  const [uploadingIdx, setUploadingIdx] = useState(null);
  const fileInputRef = useRef(null);
  const currentImgIdx = useRef(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [prodRes, ordRes, slideRes] = await Promise.all([
        productsAPI.getAll({ limit: 100 }),
        ordersAPI.getAll(),
        settingsAPI.getSlideshow(),
      ]);
      setProducts(prodRes.data.products || []);
      setOrders(ordRes.data || []);
      setSlideshow(slideRes.data.images || []);
    } catch {
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => { setForm(EMPTY_PRODUCT); setModal('add'); };
  const openEdit = (p) => {
    setForm({ ...p, images: p.images?.length ? p.images : [''], sizes: p.sizes || [40,41,42,43] });
    setModal('edit');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        images: form.images.filter(Boolean),
      };
      if (modal === 'add') {
        await productsAPI.create(payload);
        toast.success('Produit ajouté!');
      } else {
        await productsAPI.update(form._id, payload);
        toast.success('Produit modifié!');
      }
      setModal(null);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('admin.confirm_delete'))) return;
    try {
      await productsAPI.delete(id);
      toast.success('Produit supprimé');
      loadData();
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  const activeOrders = orders.filter(o => o.status !== 'cancelled');
  const revenue = activeOrders.reduce((s, o) => s + (o.total || 0), 0);

  const stats = [
    { icon: FiPackage, label: t('admin.total_products'), value: products.length, color: 'text-gold-400' },
    { icon: FiShoppingBag, label: t('admin.total_orders'), value: activeOrders.length, color: 'text-blue-400' },
    { icon: FiDollarSign, label: t('admin.revenue'), value: `${revenue.toLocaleString()} MAD`, color: 'text-green-400' },
  ];

  return (
    <div className="min-h-screen bg-dark-900 pt-20">
      <div className="section-padding max-w-7xl mx-auto py-8">
        <h1 className="font-heading text-4xl text-white mb-8">{t('admin.title')}</h1>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {stats.map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="bg-dark-800 border border-dark-600 p-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-dark-700 flex items-center justify-center">
                <Icon className={color} size={22} />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-dark-600 mb-6">
          {[
            { key: 'products', label: t('admin.products') },
            { key: 'orders', label: t('admin.orders') },
            { key: 'slideshow', label: 'Slideshow' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-6 py-3 text-sm uppercase tracking-widest transition-colors ${
                tab === key
                  ? 'border-b-2 border-gold-500 text-gold-400'
                  : 'text-gray-500 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {loading ? <LoadingSpinner /> : (
          <>
            {tab === 'products' && (
              <>
                <div className="flex justify-end mb-4">
                  <button onClick={openAdd} className="btn-gold flex items-center gap-2">
                    <FiPlus size={16} /> {t('admin.add_product')}
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-dark-600 text-left">
                        {['Image', 'Nom', 'Prix', 'Catégorie', 'Tailles', 'Actions'].map(h => (
                          <th key={h} className="pb-3 pr-4 text-xs uppercase tracking-widest text-gray-500">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-600">
                      {products.map(p => (
                        <tr key={p._id} className="hover:bg-dark-800 transition-colors">
                          <td className="py-3 pr-4">
                            <img
                              src={p.images?.[0] || 'https://placehold.co/50x50/1a1a1a/C9A84C?text=K'}
                              alt={p.name}
                              onError={e => { e.target.src = 'https://placehold.co/50x50/1a1a1a/C9A84C?text=K'; }}
                              className="w-12 h-12 object-cover bg-dark-700"
                            />
                          </td>
                          <td className="py-3 pr-4 text-white font-medium">{p.name}</td>
                          <td className="py-3 pr-4 text-gold-400">{p.price?.toLocaleString()} MAD</td>
                          <td className="py-3 pr-4 text-gray-400">{p.category || '-'}</td>
                          <td className="py-3 pr-4 text-gray-400">{p.sizes?.join(', ') || '-'}</td>
                          <td className="py-3 pr-4">
                            <div className="flex gap-2">
                              <button onClick={() => openEdit(p)} className="p-2 text-gray-400 hover:text-gold-400 transition-colors">
                                <FiEdit2 size={14} />
                              </button>
                              <button onClick={() => handleDelete(p._id)} className="p-2 text-gray-400 hover:text-red-400 transition-colors">
                                <FiTrash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {products.length === 0 && (
                    <p className="text-center text-gray-500 py-8">Aucun produit. Ajoutez-en un!</p>
                  )}
                </div>
              </>
            )}

            {tab === 'orders' && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-dark-600 text-left">
                      {['Réf', 'Nom', 'Téléphone', 'Ville', 'Adresse', 'Total', 'Articles', 'Statut', 'Date'].map(h => (
                        <th key={h} className="pb-3 pr-4 text-xs uppercase tracking-widest text-gray-500 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-600">
                    {orders.map(o => (
                      <tr key={o._id} className="hover:bg-dark-800 transition-colors">
                        <td className="py-3 pr-4 text-gray-400 font-mono text-xs whitespace-nowrap">KN-{o._id?.slice(-6).toUpperCase()}</td>
                        <td className="py-3 pr-4 text-white font-medium whitespace-nowrap">{o.shippingAddress?.name || '-'}</td>
                        <td className="py-3 pr-4">
                          <a href={`tel:${o.shippingAddress?.phone}`}
                            className="text-gold-400 hover:text-gold-300 transition-colors whitespace-nowrap">
                            {o.shippingAddress?.phone || '-'}
                          </a>
                        </td>
                        <td className="py-3 pr-4 text-gray-300 whitespace-nowrap">{o.shippingAddress?.city || '-'}</td>
                        <td className="py-3 pr-4 text-gray-400 text-xs max-w-[140px] truncate">{o.shippingAddress?.address || '-'}</td>
                        <td className="py-3 pr-4 text-gold-400 font-semibold whitespace-nowrap">{o.total?.toLocaleString()} MAD</td>
                        <td className="py-3 pr-4 text-gray-400 text-xs whitespace-nowrap">{o.items?.length || 0} art.</td>
                        <td className="py-3 pr-4">
                          <select
                            value={o.status || 'pending'}
                            onChange={async (e) => {
                              try {
                                await ordersAPI.updateStatus(o._id, e.target.value);
                                loadData();
                              } catch { toast.error('Erreur'); }
                            }}
                            className={`text-xs px-2 py-1 border outline-none cursor-pointer bg-dark-700 ${
                              o.status === 'delivered' ? 'border-green-500/40 text-green-400' :
                              o.status === 'cancelled' ? 'border-red-500/40 text-red-400' :
                              o.status === 'shipped' ? 'border-blue-500/40 text-blue-400' :
                              'border-gold-500/40 text-gold-400'
                            }`}
                          >
                            <option value="pending">En attente</option>
                            <option value="confirmed">Confirmé</option>
                            <option value="shipped">Expédié</option>
                            <option value="delivered">Livré</option>
                            <option value="cancelled">Annulé</option>
                          </select>
                        </td>
                        <td className="py-3 pr-4 text-gray-400">
                          {o.createdAt ? new Date(o.createdAt).toLocaleDateString('fr-FR') : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {orders.length === 0 && (
                  <p className="text-center text-gray-500 py-8">Aucune commande pour le moment.</p>
                )}
              </div>
            )}

            {tab === 'slideshow' && (
              <div className="max-w-2xl">
                <p className="text-gray-400 text-sm mb-6">
                  Les images du slideshow de la page d'accueil. Glissez pour réorganiser.
                </p>

                {/* Hidden file input */}
                <input
                  ref={slideFileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    const idx = slideImgIdx.current;
                    setSlideUploadingIdx(idx);
                    try {
                      const base64 = await compressImage(file);
                      setSlideshow(prev => {
                        const next = [...prev];
                        next[idx] = base64;
                        return next;
                      });
                    } finally {
                      setSlideUploadingIdx(null);
                      e.target.value = '';
                    }
                  }}
                />

                <div className="space-y-3 mb-6">
                  {slideshow.map((img, i) => (
                    <div key={i} className="flex items-center gap-3 bg-dark-800 border border-dark-600 p-3">
                      <span className="text-gray-600 text-sm w-5 text-center">{i + 1}</span>
                      {img && (
                        <img src={img} alt="" className="w-16 h-16 object-cover bg-dark-700 border border-dark-500 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 truncate">{img?.startsWith('data:') ? 'Image uploadée' : img}</p>
                      </div>
                      <button
                        onClick={() => { slideImgIdx.current = i; slideFileRef.current.click(); }}
                        disabled={slideUploadingIdx === i}
                        className="flex items-center gap-2 px-3 py-2 bg-dark-700 border border-dark-500 text-xs text-gray-300 hover:border-gold-500 hover:text-gold-400 transition-colors disabled:opacity-50 shrink-0"
                      >
                        <FiUpload size={12} />
                        {slideUploadingIdx === i ? 'Upload...' : 'Changer'}
                      </button>
                      <button
                        onClick={() => setSlideshow(prev => prev.filter((_, j) => j !== i))}
                        className="text-gray-500 hover:text-red-400 transition-colors p-1 shrink-0"
                      >
                        <FiX size={16} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setSlideshow(prev => [...prev, ''])}
                    className="flex items-center gap-2 px-4 py-2 border border-dark-500 text-gray-400 hover:border-gold-500 hover:text-gold-400 transition-colors text-sm"
                  >
                    <FiImage size={14} /> Ajouter une image
                  </button>
                  <button
                    onClick={async () => {
                      const valid = slideshow.filter(Boolean);
                      if (!valid.length) return toast.error('Ajoutez au moins une image');
                      setSlideSaving(true);
                      try {
                        await settingsAPI.updateSlideshow(valid);
                        setSlideshow(valid);
                        toast.success('Slideshow mis à jour!');
                      } catch {
                        toast.error('Erreur de sauvegarde');
                      } finally {
                        setSlideSaving(false);
                      }
                    }}
                    disabled={slideSaving}
                    className="btn-gold flex items-center gap-2 disabled:opacity-50"
                  >
                    <FiSave size={14} />
                    {slideSaving ? 'Sauvegarde...' : 'Sauvegarder'}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal Add/Edit Product */}
      {modal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark-800 border border-dark-600 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-dark-600">
              <h2 className="font-heading text-xl text-white">
                {modal === 'add' ? t('admin.add_product') : t('admin.edit')}
              </h2>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-white">
                <FiX size={20} />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              {[
                { key: 'name', label: t('admin.product_name'), type: 'text' },
                { key: 'price', label: t('admin.price'), type: 'number' },
                { key: 'category', label: t('admin.category'), type: 'text' },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-xs uppercase tracking-widest text-gray-400 mb-1.5 block">{f.label}</label>
                  <input
                    type={f.type}
                    required={f.key !== 'category'}
                    value={form[f.key]}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    className="w-full bg-dark-700 border border-dark-500 text-white px-3 py-2.5 text-sm outline-none focus:border-gold-500 transition-colors"
                  />
                </div>
              ))}

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="featured"
                  checked={!!form.featured}
                  onChange={e => setForm(p => ({ ...p, featured: e.target.checked }))}
                  className="w-4 h-4 accent-yellow-500"
                />
                <label htmlFor="featured" className="text-xs uppercase tracking-widest text-gray-400">Featured (page d'accueil)</label>
              </div>

              <div>
                <label className="text-xs uppercase tracking-widest text-gray-400 mb-1.5 block">Description</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  className="w-full bg-dark-700 border border-dark-500 text-white px-3 py-2.5 text-sm outline-none focus:border-gold-500 transition-colors resize-none"
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-widest text-gray-400 mb-2 block">{t('admin.sizes')}</label>
                <div className="flex gap-2">
                  {[40, 41, 42, 43].map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setForm(p => ({
                        ...p,
                        sizes: p.sizes.includes(s) ? p.sizes.filter(x => x !== s) : [...p.sizes, s].sort(),
                      }))}
                      className={`px-3 py-2 text-sm border transition-colors ${
                        form.sizes.includes(s)
                          ? 'border-gold-500 text-gold-500 bg-gold-500/10'
                          : 'border-dark-500 text-gray-400'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs uppercase tracking-widest text-gray-400 mb-2 block">{t('admin.images')}</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    const idx = currentImgIdx.current;
                    setUploadingIdx(idx);
                    try {
                      const base64 = await compressImage(file);
                      setForm(p => {
                        const imgs = [...p.images];
                        imgs[idx] = base64;
                        return { ...p, images: imgs };
                      });
                    } finally {
                      setUploadingIdx(null);
                      e.target.value = '';
                    }
                  }}
                />
                {form.images.map((img, i) => (
                  <div key={i} className="flex gap-2 mb-2 items-center">
                    {img && (
                      <img src={img} alt="" className="w-10 h-10 object-cover bg-dark-700 border border-dark-500 shrink-0" />
                    )}
                    <button
                      type="button"
                      disabled={uploadingIdx === i}
                      onClick={() => { currentImgIdx.current = i; fileInputRef.current.click(); }}
                      className="flex items-center gap-2 px-3 py-2 bg-dark-700 border border-dark-500 text-sm text-gray-300 hover:border-gold-500 hover:text-gold-400 transition-colors disabled:opacity-50"
                    >
                      <FiUpload size={13} />
                      {uploadingIdx === i ? 'Upload...' : img ? 'Changer' : 'Choisir photo'}
                    </button>
                    {img && (
                      <span className="text-xs text-gray-500 truncate max-w-[120px]">{img.split('/').pop()}</span>
                    )}
                    {form.images.length > 1 && (
                      <button type="button" onClick={() => setForm(p => ({ ...p, images: p.images.filter((_, j) => j !== i) }))}
                        className="text-gray-400 hover:text-red-400 p-2 ml-auto">
                        <FiX size={14} />
                      </button>
                    )}
                  </div>
                ))}
                <button type="button"
                  onClick={() => setForm(p => ({ ...p, images: [...p.images, ''] }))}
                  className="text-xs text-gold-500 hover:text-gold-300 transition-colors mt-1">
                  + Ajouter une image
                </button>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isNewArrival"
                  checked={form.isNewArrival}
                  onChange={e => setForm(p => ({ ...p, isNewArrival: e.target.checked }))}
                  className="accent-gold-500"
                />
                <label htmlFor="isNewArrival" className="text-sm text-gray-300">Marquer comme "New"</label>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn-gold flex-1 disabled:opacity-50">
                  {saving ? '...' : t('admin.save')}
                </button>
                <button type="button" onClick={() => setModal(null)} className="btn-outline-gold flex-1">
                  {t('admin.cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

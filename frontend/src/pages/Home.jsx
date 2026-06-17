import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { fetchProducts } from '../services/api';
import { useCart } from '../context/CartContext';

const CATEGORIES = [
  { label: 'Audio', icon: '🎧' },
  { label: 'Wearables', icon: '⌚' },
  { label: 'Cameras', icon: '📷' },
  { label: 'Accessories', icon: '🔌' },
  { label: 'Mobiles', icon: '📱' },
  { label: 'Power', icon: '🔋' },
  { label: 'Gaming', icon: '🎮' },
  { label: 'Deals', icon: '🏷️' },
];

const SORTS = [
  { key: 'featured', label: 'Featured' },
  { key: 'price-asc', label: 'Price: Low to High' },
  { key: 'price-desc', label: 'Price: High to Low' },
  { key: 'name', label: 'Name' },
];

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sort, setSort] = useState('featured');
  const { addToCart, showMessage } = useCart();
  const [searchParams] = useSearchParams();
  const query = (searchParams.get('q') || '').toLowerCase();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchProducts(0, 100);
      setProducts(response.products || []);
    } catch (err) {
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    showMessage(`${product.name} added to cart`);
  };

  const visible = useMemo(() => {
    let list = products;
    if (query) {
      list = list.filter(
        (p) =>
          p.name?.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query)
      );
    }
    const sorted = [...list];
    if (sort === 'price-asc') sorted.sort((a, b) => Number(a.price) - Number(b.price));
    else if (sort === 'price-desc') sorted.sort((a, b) => Number(b.price) - Number(a.price));
    else if (sort === 'name') sorted.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    return sorted;
  }, [products, query, sort]);

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      {!query && (
        <section className="bg-gradient-to-r from-brand-700 via-brand-600 to-brand-500 text-white">
          <div className="container mx-auto grid items-center gap-6 px-4 py-10 md:grid-cols-2 md:py-14">
            <div>
              <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                Big Savings Festival
              </span>
              <h1 className="mt-4 text-3xl font-extrabold leading-tight md:text-5xl">
                Top tech, <span className="text-accent-400">unbeatable</span> prices.
              </h1>
              <p className="mt-3 max-w-md text-white/80">
                Headphones, smartwatches, cameras and more — handpicked gadgets with up to 30% off.
              </p>
              <a
                href="#catalogue"
                className="mt-6 inline-block rounded-lg bg-accent-500 px-6 py-3 font-bold text-white shadow-lg transition hover:brightness-95"
              >
                Shop the deals
              </a>
            </div>
            <div className="hidden justify-end md:flex">
              <img
                src="https://images.unsplash.com/photo-1498049794561-7780e7231661?w=700&q=80"
                alt="Electronics"
                className="h-64 w-full max-w-md rounded-2xl object-cover shadow-2xl"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
          </div>
        </section>
      )}

      {/* Category strip */}
      <section className="border-b border-gray-200 bg-white">
        <div className="container mx-auto flex gap-6 overflow-x-auto px-4 py-4">
          {CATEGORIES.map((c) => (
            <div key={c.label} className="flex min-w-[64px] cursor-pointer flex-col items-center gap-1.5 text-center">
              <span className="grid h-14 w-14 place-items-center rounded-full bg-brand-50 text-2xl transition hover:bg-brand-100">
                {c.icon}
              </span>
              <span className="text-xs font-medium text-gray-700">{c.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Catalogue */}
      <section id="catalogue" className="container mx-auto px-4 py-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-bold text-gray-800">
            {query ? `Results for “${searchParams.get('q')}”` : 'Trending Products'}
            <span className="ml-2 text-sm font-normal text-gray-400">({visible.length})</span>
          </h2>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-500">Sort by</label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500"
            >
              {SORTS.map((s) => (
                <option key={s.key} value={s.key}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
            {error} — showing demo data where possible.
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-80 animate-pulse rounded-xl bg-gray-200" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-lg text-gray-500">No products found{query ? ` for “${searchParams.get('q')}”` : ''}.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {visible.map((product) => (
              <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;

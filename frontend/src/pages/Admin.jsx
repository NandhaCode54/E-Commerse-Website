import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchProducts, createProduct, updateProduct, deleteProduct } from '../services/api';
import { formatINR } from '../utils/format';

const EMPTY = { name: '', description: '', price: '', stock: '', imageUrl: '' };

const Admin = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    if (!isAdmin) { navigate('/'); return; }
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isAdmin]);

  const loadProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetchProducts(0, 100);
      setProducts(res.products || []);
    } catch (err) {
      setError(err.message || 'Failed to load products. Is the backend running?');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => { setFormData(EMPTY); setEditingProduct(null); };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      description: product.description || '',
      price: String(product.price ?? ''),
      stock: String(product.stock ?? ''),
      imageUrl: product.imageUrl || '',
    });
    setError(''); setSuccess('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    const name = formData.name.trim();
    const description = formData.description.trim();
    const price = parseFloat(formData.price);
    const stock = parseInt(formData.stock, 10);

    if (!name || name.length < 2) return setError('Product name must be at least 2 characters');
    if (isNaN(price) || price < 0) return setError('Price must be a valid number ≥ 0');
    if (isNaN(stock) || stock < 0) return setError('Stock must be a valid number ≥ 0');

    setSaving(true);
    try {
      const payload = { name, description, price, stock, imageUrl: formData.imageUrl.trim() || null };
      if (editingProduct?.id) {
        await updateProduct(editingProduct.id, payload);
        setSuccess('Product updated successfully');
      } else {
        await createProduct(payload);
        setSuccess('Product added successfully');
      }
      resetForm();
      loadProducts();
    } catch (err) {
      setError(err.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`Delete "${product.name}"?`)) return;
    setError(''); setSuccess('');
    try {
      await deleteProduct(product.id);
      setSuccess('Product deleted');
      loadProducts();
    } catch (err) {
      setError(err.message || 'Failed to delete product');
    }
  };

  if (!user || !isAdmin) return null;

  const totalStock = products.reduce((n, p) => n + (Number(p.stock) || 0), 0);
  const inventoryValue = products.reduce((n, p) => n + (Number(p.price) || 0) * (Number(p.stock) || 0), 0);
  const outOfStock = products.filter((p) => Number(p.stock) === 0).length;

  const stats = [
    { label: 'Products', value: products.length, color: 'bg-brand-50 text-brand-700' },
    { label: 'Units in stock', value: totalStock, color: 'bg-green-50 text-green-700' },
    { label: 'Inventory value', value: formatINR(inventoryValue), color: 'bg-amber-50 text-amber-700' },
    { label: 'Out of stock', value: outOfStock, color: 'bg-red-50 text-red-700' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-sm text-gray-500">Signed in as {user.name} ({user.email})</p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl bg-white p-5 shadow-card">
            <span className={`inline-block rounded-md px-2 py-1 text-xs font-bold ${s.color}`}>{s.label}</span>
            <p className="mt-3 text-2xl font-extrabold text-gray-900">{s.value}</p>
          </div>
        ))}
      </div>

      {error && <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">{error}</div>}
      {success && <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-700">{success}</div>}

      {/* Form */}
      <div className="mb-8 rounded-xl bg-white p-6 shadow-card">
        <h2 className="mb-4 text-lg font-semibold text-gray-800">
          {editingProduct ? `Edit "${editingProduct.name}"` : 'Add New Product'}
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Product Name</label>
            <input type="text" value={formData.name} required minLength={2} maxLength={100}
              onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
              className="input-field" placeholder="e.g. Wireless Headphones" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Image URL</label>
            <input type="url" value={formData.imageUrl}
              onChange={(e) => setFormData((p) => ({ ...p, imageUrl: e.target.value }))}
              className="input-field" placeholder="https://…" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Price (₹)</label>
            <input type="number" step="0.01" min="0" value={formData.price} required
              onChange={(e) => setFormData((p) => ({ ...p, price: e.target.value }))}
              className="input-field" placeholder="0.00" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Stock</label>
            <input type="number" min="0" value={formData.stock} required
              onChange={(e) => setFormData((p) => ({ ...p, stock: e.target.value }))}
              className="input-field" placeholder="0" />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Description</label>
            <textarea value={formData.description} rows={3} maxLength={500}
              onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
              className="input-field" placeholder="Product description…" />
          </div>
          <div className="flex gap-3 md:col-span-2">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving…' : editingProduct ? 'Update Product' : 'Add Product'}
            </button>
            {editingProduct && (
              <button type="button" onClick={resetForm} className="btn-ghost">Cancel</button>
            )}
          </div>
        </form>
      </div>

      {/* Table */}
      <div className="rounded-xl bg-white p-6 shadow-card">
        <h2 className="mb-4 text-lg font-semibold text-gray-800">All Products</h2>
        {loading ? (
          <div className="py-12 text-center text-gray-500">Loading products…</div>
        ) : products.length === 0 ? (
          <div className="py-12 text-center text-gray-500">No products yet. Add one above.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-gray-500">
                  <th className="px-2 py-3 font-medium">Product</th>
                  <th className="px-2 py-3 font-medium">Price</th>
                  <th className="px-2 py-3 font-medium">Stock</th>
                  <th className="px-2 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-2 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-gray-50 p-1">
                          <img
                            src={p.imageUrl || 'https://placehold.co/60x60?text=—'}
                            alt={p.name}
                            className="h-full w-full object-contain"
                            onError={(e) => { e.target.src = 'https://placehold.co/60x60?text=—'; }}
                          />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{p.name}</p>
                          <p className="text-xs text-gray-400">ID #{p.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-3 text-gray-700">{formatINR(p.price)}</td>
                    <td className="px-2 py-3">
                      <span className={`rounded px-2 py-0.5 text-xs font-semibold ${
                        Number(p.stock) === 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-2 py-3">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleEdit(p)}
                          className="rounded-md bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-100">
                          Edit
                        </button>
                        <button onClick={() => handleDelete(p)}
                          className="rounded-md bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-100">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DEMO_ACCOUNTS = [
  { label: 'Admin', email: 'admin@ecommerce.local', password: 'password123' },
  { label: 'Customer', email: 'user@ecommerce.local', password: 'Password@123' },
];

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user) navigate('/');
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-160px)] items-center justify-center px-4 py-10">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-xl md:grid-cols-2">
        {/* Side panel */}
        <div className="hidden flex-col justify-between bg-gradient-to-br from-brand-700 to-brand-500 p-8 text-white md:flex">
          <div>
            <h2 className="text-3xl font-extrabold">Welcome back</h2>
            <p className="mt-3 text-white/80">
              Sign in to access your cart, track orders and manage your store.
            </p>
          </div>
          <div className="rounded-xl bg-white/10 p-4 text-sm">
            <p className="mb-2 font-semibold">Demo accounts</p>
            {DEMO_ACCOUNTS.map((a) => (
              <button
                key={a.email}
                type="button"
                onClick={() => { setEmail(a.email); setPassword(a.password); }}
                className="mb-1.5 block w-full rounded-lg bg-white/10 px-3 py-2 text-left transition hover:bg-white/20"
              >
                <span className="font-semibold">{a.label}:</span> {a.email}
                <span className="block text-xs text-white/70">password: {a.password} — click to fill</span>
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="p-8">
          <h1 className="text-2xl font-bold text-gray-800">Sign In</h1>
          <p className="mt-1 text-sm text-gray-500">Use your email and password</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
            )}
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700">Email</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                required autoComplete="email" className="input-field" placeholder="you@example.com" />
            </div>
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-gray-700">Password</label>
              <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                required autoComplete="current-password" className="input-field" placeholder="••••••••" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-700">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

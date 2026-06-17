import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user) navigate('/');
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await register(name, email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed');
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
            <h2 className="text-3xl font-extrabold">Join ShopNow</h2>
            <p className="mt-3 text-white/80">
              Create a free account to shop the latest gadgets, save your cart and check out faster.
            </p>
          </div>
          <ul className="space-y-2 text-sm text-white/90">
            <li>✓ Exclusive member deals</li>
            <li>✓ Faster checkout</li>
            <li>✓ Order tracking</li>
          </ul>
        </div>

        {/* Form */}
        <div className="p-8">
          <h1 className="text-2xl font-bold text-gray-800">Create Account</h1>
          <p className="mt-1 text-sm text-gray-500">Sign up as a customer in seconds</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
            )}
            <div>
              <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-gray-700">Full Name</label>
              <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)}
                required minLength={2} className="input-field" placeholder="John Doe" />
            </div>
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700">Email</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                required autoComplete="email" className="input-field" placeholder="you@example.com" />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-gray-700">Password</label>
                <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  required minLength={6} autoComplete="new-password" className="input-field" placeholder="••••••••" />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium text-gray-700">Confirm</label>
                <input id="confirmPassword" type="password" value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)} required autoComplete="new-password"
                  className="input-field" placeholder="••••••••" />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
            <p className="text-center text-xs text-gray-400">
              New accounts are created as customers. Admin access is managed by the store team.
            </p>
          </form>

          <p className="mt-4 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;

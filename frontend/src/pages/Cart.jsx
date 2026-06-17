import React from 'react';
import { Link } from 'react-router-dom';
import CartItem from '../components/CartItem';
import { useCart } from '../context/CartContext';
import { formatINR } from '../utils/format';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, clearCart, getCartTotal } = useCart();
  const total = getCartTotal();
  const itemCount = cart.reduce((n, i) => n + (i.quantity || 0), 0);
  const shipping = total > 0 && total < 500 ? 40 : 0;

  const handleClearCart = () => {
    if (window.confirm('Remove all items from your cart?')) clearCart();
  };

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-md rounded-xl bg-white p-10 text-center shadow-card">
          <div className="mx-auto mb-4 grid h-20 w-20 place-items-center rounded-full bg-brand-50 text-4xl">🛒</div>
          <h2 className="mb-2 text-2xl font-bold text-gray-800">Your cart is empty</h2>
          <p className="mb-6 text-gray-500">Looks like you haven't added anything yet.</p>
          <Link to="/" className="btn-primary">Start shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Items */}
        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-xl bg-white shadow-card">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <h1 className="text-lg font-bold text-gray-800">
                Shopping Cart <span className="text-sm font-normal text-gray-400">({itemCount} items)</span>
              </h1>
              <button onClick={handleClearCart} className="text-sm font-semibold text-gray-500 hover:text-red-600">
                Clear cart
              </button>
            </div>
            {cart.map((item) => (
              <CartItem key={item.id} item={item} onRemove={removeFromCart} onUpdateQuantity={updateQuantity} />
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-20 rounded-xl bg-white shadow-card">
            <h2 className="border-b border-gray-100 px-5 py-4 text-sm font-bold uppercase tracking-wide text-gray-500">
              Price Details
            </h2>
            <div className="space-y-3 px-5 py-4 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Price ({itemCount} items)</span>
                <span>{formatINR(total)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery charges</span>
                <span className={shipping === 0 ? 'font-semibold text-green-600' : ''}>
                  {shipping === 0 ? 'FREE' : formatINR(shipping)}
                </span>
              </div>
              <div className="flex justify-between border-t border-dashed border-gray-200 pt-3 text-base font-bold text-gray-900">
                <span>Total Amount</span>
                <span>{formatINR(total + shipping)}</span>
              </div>
            </div>
            <div className="space-y-3 px-5 pb-5">
              <button className="btn-accent w-full" onClick={() => alert('Checkout is coming in a future phase 🙂')}>
                Place Order
              </button>
              <Link to="/" className="btn-ghost w-full">Continue Shopping</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
